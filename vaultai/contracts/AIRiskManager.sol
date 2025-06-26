// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract AIRiskManager {
    enum RiskTier { NONE, C, B, A }
    mapping(address => RiskTier) public riskScores;
    event RiskScored(address indexed user, RiskTier tier);

    // Called by Chainlink Functions or off-chain oracle
    function setRiskScore(address user, uint8 score) external {
        require(score <= uint8(RiskTier.A), "Invalid score");
        riskScores[user] = RiskTier(score);
        emit RiskScored(user, RiskTier(score));
    }

    function getRiskScore(address user) external view returns (RiskTier) {
        return riskScores[user];
    }
}

