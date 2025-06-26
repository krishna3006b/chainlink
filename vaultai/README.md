# VaultAI Protocol

## Overview
VaultAI is a cross-chain RWA lending protocol leveraging Chainlink Automation, CCIP, and AI-based risk management. It supports Avalanche Fuji and Ethereum Sepolia testnets.

## Deployed Contracts

### Avalanche Fuji
- VaultCore: [ADDRESS_HERE]
- AIRiskManager: [ADDRESS_HERE]

### Ethereum Sepolia
- RWARegistry: [ADDRESS_HERE]
- MockRealEstate: [ADDRESS_HERE]
- CCIPRouter: [ADDRESS_HERE]

## Features
- RWA asset registration and NFT minting (Sepolia)
- Lending, risk scoring, loan approval, health check, and liquidation (Fuji)
- Cross-chain messaging simulation (CCIP)
- Chainlink Automation for loan health and liquidation (both chains)
- Liquidation event display scripts
- (Optional) USDC/USD price feed support
- (Optional) Foundry-based Solidity tests

## Demo Steps
1. Deploy contracts using Hardhat scripts.
2. Register RWA and mint NFT on Sepolia.
3. Lend and test risk scoring on Fuji.
4. Simulate unhealthy loans and trigger liquidation via Chainlink Automation.
5. Use scripts to display recent liquidations.
6. (Optional) Run Foundry tests: `forge test`

## Scripts
- `deploy.js`, `deploy-registry.js`, `deploy-mockRWA.js`: Deployment
- `test-vaultcore.js`, `test-unhealthy-loan.js`, `test-unhealthy-loan-sepolia.js`: Testing
- `manual-upkeep.js`, `manual-upkeep-sepolia.js`: Manual Automation
- `show-liquidations.js`, `show-liquidations-sepolia.js`: Liquidation events
- `ccip-demo.js`, `ccip-send-sepolia.js`, `ccip-receive-fuji.js`: Cross-chain messaging

## Addresses
Replace [ADDRESS_HERE] with actual deployed addresses.

## Requirements
- Node.js, Hardhat, Foundry, dotenv
- Funded testnet wallets and LINK for Automation

## Contact
For questions, contact the VaultAI team.
