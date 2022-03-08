// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './AssetNFT.sol';

/*
 * Govt account will deploy this contract, and only the deployer address can call onlyOwner() functions
 * One asset contract
 */
contract Will {
    address public willOwner;
    address public govAdd;
    mapping(address => Asset) public assets; // address -> Asset[] if we accept multiple deeds per beneficiary
    address[] public beneficiaries;

    // Note: constructor not needed for factory cloning

    // used by WillFactoryContract instead of constructor to clone contract
    /* TODO: think of how to prevent random user from calling this to change willOwner and govAdd state vars
     * If not, we can just use the old and expensive cloning pattern
     */
    function init (address willOwnerAddress, address govAddress) external {
        willOwner = willOwnerAddress;
        govAdd = govAddress;
    }

    struct Asset {
        address assetNFTcontract;
        uint256 tokenId;
    }

    modifier onlyWillOwner {
        require(msg.sender == willOwner, "Caller is not will owner");
        _;
    }


    modifier onlyGovAdd {
        require(msg.sender == govAdd, "Caller is not gov address");
        _;
    }

    // Approval of the ERC721 token must be done first before assets can be sent to this contract address
    function createWill(address beneficiaryAdd, address assetNFTcontract, uint256 tokenId) public onlyWillOwner returns (bool) {
        // TODO: require that this (beneficiaryAdd, assetNFTcontract, tokenId) does not exist

        // transfer asset ownership to this contract
        IERC721(assetNFTcontract).transferFrom(msg.sender, address(this), tokenId);

        // update state
        beneficiaries.push(beneficiaryAdd);
        assets[beneficiaryAdd] = Asset(
            assetNFTcontract,
            tokenId
        );
        return true;
    }


    function editAssets() public onlyWillOwner returns (bool) {

    }


    // only govt can execute this
    function executeWill() public onlyGovAdd returns (bool) {
        // send assets to beneficiaries
        for(uint i=0; i<beneficiaries.length; i++) {
            address currBeneficiary = beneficiaries[i];
            Asset memory asset = assets[currBeneficiary];
            IERC721(asset.assetNFTcontract).transferFrom(address(this), currBeneficiary, asset.tokenId);
            //remove asset mapping
            delete assets[currBeneficiary];
        }

        // reset array
        delete beneficiaries;

        return true;
    }


    function destroyWill() public onlyWillOwner returns (bool) {
        // return all assets from this contract back to the owner
        for(uint j=0; j<beneficiaries.length; j++) {
            address currBeneficiary = beneficiaries[j];
            Asset memory asset = assets[currBeneficiary];
            IERC721(asset.assetNFTcontract).transferFrom(address(this), willOwner, asset.tokenId);

            //remove asset mapping
            delete assets[currBeneficiary];
        }

        // reset array
        delete beneficiaries;

        // Option 1: selfdestruct(add) destroys contract and return ETH to specified address, function calls will still work but
        // Option 2: use an internal state to disable functions by adding require statements for each function
        selfdestruct(payable(willOwner));
        return true;
    }


}