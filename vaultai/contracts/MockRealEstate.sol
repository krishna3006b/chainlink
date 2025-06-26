// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockRealEstate is ERC721, Ownable {
    uint256 public nextTokenId;

    constructor(address initialOwner) 
        ERC721("MockRealEstate", "MRE") 
        Ownable(initialOwner) 
    {}

    function mint(address to) external onlyOwner returns (uint256) {
        uint256 tokenId = nextTokenId;
        _mint(to, tokenId);
        nextTokenId++;
        return tokenId;
    }
}
