// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DataStorage {
    struct AssetStatus {
        bool includedInWill;
        string tokenURI;
        address beneficiary;
    }
    mapping (uint256 => AssetStatus) private _tokenIdStatus;

    function setTokenIdData(uint256 tokenId, string memory tokenURI, address beneficiary) public {
        _tokenIdStatus[tokenId].includedInWill = true;
        _tokenIdStatus[tokenId].tokenURI = tokenURI;
        _tokenIdStatus[tokenId].beneficiary = beneficiary;
    }

    function getTokenIdData(uint256 tokenId) public view returns (AssetStatus memory) {
        return _tokenIdStatus[tokenId];
    }
    
    function getTokenIdStatus(uint256 tokenId) public view returns (bool) {
        return _tokenIdStatus[tokenId].includedInWill;
    }

    function toggleTokenIdStatus(uint256 tokenId) public {
        _tokenIdStatus[tokenId].includedInWill = !_tokenIdStatus[tokenId].includedInWill;
    }
}