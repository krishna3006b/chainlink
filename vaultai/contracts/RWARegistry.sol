// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract RWARegistry {
    struct Asset {
        uint256 id;
        address owner;
        string metadataURI;
        uint256 valuationUSD;
    }

    mapping(uint256 => Asset) public assets;
    uint256 public assetCounter;

    event AssetRegistered(uint256 indexed id, address indexed owner, string metadataURI, uint256 valuationUSD);

    function registerAsset(string calldata metadataURI, uint256 valuationUSD) external returns (uint256) {
        assetCounter++;
        assets[assetCounter] = Asset({
            id: assetCounter,
            owner: msg.sender,
            metadataURI: metadataURI,
            valuationUSD: valuationUSD
        });

        emit AssetRegistered(assetCounter, msg.sender, metadataURI, valuationUSD);
        return assetCounter;
    }

    function getAsset(uint256 assetId) external view returns (Asset memory) {
        return assets[assetId];
    }
}
