'// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token//ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


/*
 * Govt account will deploy this contract, and only the deployer address can call onlyOwner() functions
 * ERC721Enumerable just lets us find all tokenIds an address owns.
 */
contract AssetNFT is ERC721Enumerable, Ownable {
    using Strings for uint256;

    // Optional mapping for token URIs
    mapping (uint256 => string) private tokenURIs;

    constructor(string memory _name, string memory _symbol)
        ERC721(_name, _symbol)
    {}

    /* Base URI removed to reduce complexity, we just refer to token URI */

    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
        require(_exists(tokenId), "ERC721Metadata: URI set of nonexistent token");
        tokenURIs[tokenId] = _tokenURI;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        string memory _tokenURI = tokenURIs[tokenId];
        string memory base = _baseURI();

        // If there is no base URI, return the token URI.
        if (bytes(base).length == 0) {
        return _tokenURI;
        }
        // If both are set, concatenate the baseURI and tokenURI (via abi.encodePacked).
        if (bytes(_tokenURI).length > 0) {
        return string(abi.encodePacked(base, _tokenURI));
        }
        // If there is a baseURI but no tokenURI, concatenate the tokenID to the baseURI.
        return string(abi.encodePacked(base, tokenId.toString()));
    }

    function getTokenIds(address owner) public view returns (uint256[] memory) {
        uint256 numTokens = balanceOf(owner);
        uint256[] memory tokenIds = new uint[](numTokens);

        for(uint i=0; i<numTokens; i++) {
        uint256 tokenId = tokenOfOwnerByIndex(owner, i);
        tokenIds[i] = tokenId;
        }
        return tokenIds;
    }


    function mint(
    address _to,
    uint256 _tokenId,
    string memory tokenURI_
    ) external onlyOwner() returns (uint) {
        _safeMint(_to, _tokenId);
        _setTokenURI(_tokenId, tokenURI_);
        return _tokenId;
    }
}