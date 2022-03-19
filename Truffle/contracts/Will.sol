// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './AssetNFT.sol';

/*
 * Govt account will deploy this contract, and only the deployer address can call onlyOwner() functions
 */
contract Will {
    address public willOwner;
    address public govAdd;
    // mapping(address => Asset) public assets; // address -> Asset[] if we accept multiple deeds per beneficiary
    // address[] public beneficiaries;
    Asset[] public assets;
    bool public isActive;

    event WillCreated(address willOwner);
    event WillEdited(address willOwner);
    event WillDestroyed(address willOwner);
    event WillExecuted(address govAdd);
    // Note: constructor not needed for factory cloning

    // used by WillFactoryContract instead of constructor to clone contract
    /* TODO: think of how to prevent random user from calling this to change willOwner and govAdd state vars
     * If not, we can just use the old and expensive cloning pattern
     */
    function init (address willOwnerAddress, address govAddress) external {
        willOwner = willOwnerAddress;
        govAdd = govAddress;
        isActive = true;
    }

    struct Asset {
        string assetId;
        address assetNftContract;
        uint256 tokenId;
        address beneficiary;
    }

    modifier onlyWillOwner {
        require(msg.sender == willOwner, "Caller is not will owner");
        _;
    }


    modifier onlyGovAdd {
        require(msg.sender == govAdd, "Caller is not gov address");
        _;
    }

    modifier activeWill {
        require(isActive, "Will is inactive");
        _;
    }


    function createAssets(Asset[] memory willAssets) public onlyWillOwner activeWill returns (bool) {
        require(assets.length == 0, "Will has already been created.");

        for(uint i = 0; i < willAssets.length; i++) {
            // transfer ownership of assets to this contract, approval of the ERC721 token must be done first
            Asset memory asset = willAssets[i];
            // ensure assetNftContract or beneficiary address is not 0 address
            require(asset.assetNftContract != address(0) || asset.beneficiary != address(0), "Asset Contract/ beneficiary cannot be zero address");
            IERC721(asset.assetNftContract).transferFrom(msg.sender, address(this), asset.tokenId);

            // update state
            assets.push(Asset(
                    asset.assetId,
                    asset.assetNftContract,
                    asset.tokenId,
                    asset.beneficiary
                ));
        }
        emit WillCreated(willOwner);
        return true;
    }

    // expensive compute..
    function exists(Asset[] memory assetArr, Asset memory assetToFind) pure internal returns (bool) {
        for (uint i = 0; i < assetArr.length; i++) {
            Asset memory asset = assetArr[i];

            // hash and compare assetId strings in memory
            if (keccak256(abi.encodePacked(asset.assetId)) == keccak256(abi.encodePacked(assetToFind.assetId))) {
                return true;
            }
        }
        return false;
    }

    function editAssets(Asset[] memory newWillAssets) public onlyWillOwner activeWill returns (bool) {
        if (newWillAssets.length == 0) {
            // send back all assets
            for(uint k = 0; k < assets.length; k++) {
                Asset memory asset = assets[k];
                // transfer ownership from address(this) => caller
                IERC721(asset.assetNftContract).transferFrom(address(this), msg.sender, asset.tokenId);
            }
            delete assets;
        }

        uint diff = 0;

        // compute assets to add
        for(uint i = 0; i < newWillAssets.length; i++) {
            Asset memory newAsset = newWillAssets[i];
            // ensure assetNftContract or beneficiary address is not 0 address
            require(newAsset.assetNftContract != address(0) || newAsset.beneficiary != address(0), "Asset Contract/ beneficiary cannot be zero address");

            if (!exists(assets, newAsset)) {
                assets.push(newAsset);

                diff += 1;
                // transfer ownership from caller => address(this) needs approval first
                IERC721(newAsset.assetNftContract).transferFrom(msg.sender, address(this), newAsset.tokenId);
            }
        }

        // compute assets to delete
        for(uint j = 0; j < assets.length - diff; j++) {
            Asset memory asset = assets[j];
            // ensure assetNftContract or beneficiary address is not 0 address
            require(asset.assetNftContract != address(0) || asset.beneficiary != address(0), "Asset Contract/ beneficiary cannot be zero address");
            if (!exists(newWillAssets, asset)) {
                delete assets[j];
                assets[j] = assets[assets.length - 1];
                assets.pop();
                // transfer ownership from address(this) => caller
                IERC721(asset.assetNftContract).transferFrom(address(this), msg.sender, asset.tokenId);
            }
        }
        emit WillEdited(willOwner);
        return true;
    }


    // only gov can execute this
    function executeWill() public onlyGovAdd activeWill returns (bool) {
        // send assets to beneficiaries
        for(uint i=0; i<assets.length; i++) {
            Asset memory asset = assets[i];
            IERC721(asset.assetNftContract).transferFrom(address(this), asset.beneficiary, asset.tokenId);
        }
        isActive = false;
        emit WillExecuted(govAdd);
        // keep asset data for archival
        return true;
    }


    function destroyWill() public onlyWillOwner activeWill returns (bool) {
        // return all assets from this contract back to the owner
        for(uint i=0; i<assets.length; i++) {
            Asset memory asset = assets[i];
            IERC721(asset.assetNftContract).transferFrom(address(this), willOwner, asset.tokenId);
        }
        // reset states
        delete assets;
        isActive = false;

        // Option 1: selfdestruct(add) destroys contract and return ETH to specified address, function calls will still work but
        // Option 2: use an internal state to disable functions by adding require statements for each function
        selfdestruct(payable(willOwner));

        emit WillDestroyed(willOwner);
        return true;
    }

    function getAssets() activeWill public view returns (Asset[] memory) {
        return assets;
    }
}