// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './AssetNFT.sol';
import './DataStorage.sol';

/*
 * Govt account will deploy this contract, and only the deployer address can call onlyOwner() functions
 */
contract Will {
    AssetNFT assetNFTContract;
    DataStorage dataStorageContract;
    address public government;
    address private _willOwner;
    uint256[] private _tokenIdList;
    struct AssetData {
        uint256 tokenId;
        string tokenURI;
        address beneficiary;
    }

    event AssetCreated(address willOwner);
    event AssetAllocatedPreviously(address willOwner);
    event WillCreated(address willOwner);
    event WillDestroyed(address willOwner);
    event WillExecuted(address govAdd);
    // Note: constructor not needed for factory cloning

    // used by WillFactoryContract instead of constructor to clone contract
    /* TODO: think of how to prevent random user from calling this to change willOwner and govAdd state vars
     * If not, we can just use the old and expensive cloning pattern
     */
    function init (address willOwnerAddress, address govAddress) external {
        _willOwner = willOwnerAddress;
        government = govAddress;
    }

    modifier onlyWillOwner {
        require(msg.sender == _willOwner, "Caller is not will owner");
        _;
    }

    modifier onlyGovAdd {
        require(msg.sender == government, "Caller is not gov address");
        _;
    }

    function createAsset(address _to, uint256 _tokenId, string memory tokenURI_) public onlyWillOwner {
        assetNFTContract.mint(_to, _tokenId, tokenURI_);
        assetNFTContract.approve(address(this), _tokenId);
        emit AssetCreated(_willOwner);
    }

    function setAssetAllocation(address _to, AssetData[] memory assetDataList) private {

        for(uint i = 0; i < assetDataList.length; i++) {
            // transfer ownership of assets to this contract, approval of the ERC721 token must be done first
            AssetData memory asset = assetDataList[i];
            
            if (assetNFTContract.ownerOf(asset.tokenId)==address(0)) { // Check if tokenId exist 
                _tokenIdList.push(asset.tokenId);
                createAsset(_to, asset.tokenId, asset.tokenURI);
                dataStorageContract.setTokenIdData(asset.tokenId, asset.tokenURI, asset.beneficiary);     
            } else if (!dataStorageContract.getTokenIdStatus(asset.tokenId)) {
                dataStorageContract.toggleTokenIdStatus(asset.tokenId);
            } else {
                emit AssetAllocatedPreviously(government);
            }
        }
    }

    // only gov can execute this
    function executeWill() public onlyGovAdd {
        // send assets to beneficiaries
        for(uint i=0; i < _tokenIdList.length; i++) {
            address beneficiary = dataStorageContract.getTokenIdData(_tokenIdList[i]).beneficiary;
            assetNFTContract.safeTransferFrom(address(this), beneficiary, _tokenIdList[i]);
        }

        emit WillExecuted(government);
    }


    function destroyWill() public onlyWillOwner {        
        // detroy will and send remaining eth to owner
        selfdestruct(payable(_willOwner));

        emit WillDestroyed(_willOwner);
    }
}