import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  // Chainlink Price Feeds
  const ethPriceFeed = "0x694AA1769357215DE4FAC081bf1f309aDC325306"; // Sepolia ETH/USD
  const usdcPriceFeed = "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e"; // Sepolia USDC/USD

  // Deploy AIRiskManager
  const AIRiskManager = await ethers.getContractFactory("AIRiskManager");
  const riskManager = await AIRiskManager.deploy();
  await riskManager.waitForDeployment();
  console.log("✅ AIRiskManager deployed at:", await riskManager.getAddress());

  // Deploy CCIPRouter
  const CCIPRouter = await ethers.getContractFactory("CCIPRouter");
  const ccipRouter = await CCIPRouter.deploy();
  await ccipRouter.waitForDeployment();
  console.log("✅ CCIPRouter deployed at:", await ccipRouter.getAddress());

  // Deploy VaultCoreUSDC with both price feeds
  const VaultCoreUSDC = await ethers.getContractFactory("VaultCoreUSDC");
  const vault = await VaultCoreUSDC.deploy(
    ethPriceFeed,
    usdcPriceFeed,
    await riskManager.getAddress(),
    await ccipRouter.getAddress()
  );
  await vault.waitForDeployment();
  console.log("✅ VaultCoreUSDC deployed at:", await vault.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
