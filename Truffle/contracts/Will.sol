// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./AssetNFT.sol";
import "./DataStorage.sol";

/*
 * Govt account will deploy this contract, and only the deployer address can call onlyOwner() functions
 */
contract Will {
  AssetNFT assetNFTContract;
  DataStorage dataStorageContract;
  address public government;
  address private _willOwner;
  mapping(uint256 => bool) private _tokenIdStatusList;
  uint256[] private _tokenIdList;
  struct AssetData {
    address assetNftContractAddress;
    uint256 tokenId;
    address beneficiary;
  }

  event WillCreated(address willOwner);
  event WillDestroyed(address willOwner);
  event WillExecuted(address govAdd);
  event AssetAllocationSet();

  // Note: constructor not needed for factory cloning

  // used by WillFactoryContract instead of constructor to clone contract
  /* TODO: think of how to prevent random user from calling this to change willOwner and govAdd state vars
   * If not, we can just use the old and expensive cloning pattern
   */

  modifier onlyWillOwner() {
    require(msg.sender == _willOwner, "Caller is not will owner");
    _;
  }

  modifier onlyGovernment() {
    require(msg.sender == government, "Caller is not gov address");
    _;
  }

  function init(
    address willOwnerAddress,
    address govAddress,
    address dataStorageContractAddess
  ) external {
    _willOwner = willOwnerAddress;
    government = govAddress;
    dataStorageContract = DataStorage(dataStorageContractAddess);

    emit WillCreated(_willOwner);
  }

  function setAssetAllocation(AssetData[] memory assetDataList)
  public
  payable
  onlyWillOwner
  {
    for (uint256 i = 0; i < assetDataList.length; i++) {
      // transfer ownership of assets to this contract, approval of the ERC721 token must be done first
      AssetData memory asset = assetDataList[i];
      assetNFTContract = AssetNFT(asset.assetNftContractAddress);
      if (!_tokenIdStatusList[asset.tokenId]) {
        _tokenIdStatusList[asset.tokenId] = true;
        _tokenIdList.push(asset.tokenId);
        dataStorageContract.setTokenIdData(
          asset.assetNftContractAddress,
          asset.tokenId,
          asset.beneficiary
        );
        emit AssetAllocationSet();
      } else if (!dataStorageContract.getTokenIdStatus(asset.tokenId)) {
        dataStorageContract.toggleTokenIdStatus(asset.tokenId);
        emit AssetAllocationSet();
      } else {
        revert(); // Revert contract since assets are already used in previousl will
      }
    }
  }

  // only gov can execute this
  function executeWill() public onlyGovernment {
    // send assets to beneficiaries
    for (uint256 i = 0; i < _tokenIdList.length; i++) {
      address beneficiary = dataStorageContract
      .getTokenIdData(_tokenIdList[i])
      .beneficiary;
      address assetNFTContractAddress = dataStorageContract
      .getTokenIdData(_tokenIdList[i])
      .assetNftContractAddress;
      AssetNFT(assetNFTContractAddress).safeTransferFrom(
        _willOwner,
        beneficiary,
        _tokenIdList[i]
      );
    }

    emit WillExecuted(government);
  }

  function destroyWill() public onlyWillOwner {
    emit WillDestroyed(_willOwner);
    // destroy will and send remaining eth to owner
    selfdestruct(payable(_willOwner));
  }

  function getDataStorageContract() public view returns (DataStorage) {
    return dataStorageContract;
  }

  function getAssetNFTContract() public view returns (AssetNFT) {
    return assetNFTContract;
  }

  function getTokenIdList() public view returns (uint256[] memory) {
    return _tokenIdList;
  }
}
