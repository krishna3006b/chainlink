// const { ethers } = require("hardhat");

// async function main() {
//     // Use deployed addresses from last deployment
//     const vaultAddress = "0x454A4226aB2Eee18d747D146f10cB432c2Cf9a67";
//     const riskManagerAddress = "0xDc1Fd6267FB58A2c91B00ac4187fCd819Bf93bCb";

//     const [user] = await ethers.getSigners();
//     const VaultCore = await ethers.getContractFactory("contracts/VaultCore.sol:VaultCore");
//     const vault = VaultCore.attach(vaultAddress);
//     const AIRiskManager = await ethers.getContractFactory("contracts/AIRiskManager.sol:AIRiskManager");
//     const riskManager = AIRiskManager.attach(riskManagerAddress);

//     // Set risk score for user (simulate Chainlink Functions/AWS)
//     const tx1 = await riskManager.setRiskScore(user.address, 3); // A tier
//     await tx1.wait();
//     console.log("Set risk score for user", user.address);

//     // Approve a loan for user
//     const tx2 = await vault.receiveLoanApproval(1, ethers.parseEther("0.5"));
//     await tx2.wait();
//     console.log("Loan approved and issued for user");

//     // Check loan health
//     const healthy = await vault.checkHealth();
//     console.log("Loan health:", healthy);

//     // Simulate liquidation (should not liquidate healthy loan)
//     try {
//         await vault.liquidateLoan(0);
//         console.log("Loan liquidated (should only happen if unhealthy)");
//     } catch (e) {
//         console.log("Liquidation failed as expected for healthy loan");
//     }
// }

// main().catch(console.error);

const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Network:", hre.network.name);

  // Fuji Chainlink Configs
  const priceFeed = "0x86d67c3D38D2bCeE722E601025C25a575021c6EA"; // ETH/USD
  const riskManager = "0xDc1Fd6267FB58A2c91B00ac4187fCd819Bf93bCb"; // Your AIRiskManager deployed address
  const ccipRouter = "0x454A4226aB2Eee18d747D146f10cB432c2Cf9a67"; // MockRealEstate as placeholder for now

  // Chainlink VRF Config (Fuji)
  const vrfCoordinator = "0x6941C18D7d375509cb45d7b8b8b076112dc5a777"; // Fuji
  const keyHash = "0x9fe46b0eae3c2fcd4a026ca6d8853fbeef22afda4206d3db08c7c300aa3c8f68";
  const subscriptionId = 1451; // Replace with your actual Chainlink VRF sub ID

  const VaultCore = await hre.ethers.getContractFactory("VaultCore");
  const vault = await VaultCore.deploy(
    priceFeed,
    riskManager,
    ccipRouter,
    vrfCoordinator,
    keyHash,
    subscriptionId
  );

  await vault.waitForDeployment();
  console.log("✅ VaultCore deployed at:", await vault.getAddress());
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
