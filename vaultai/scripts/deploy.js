// const hre = require("hardhat");
// async function main() {
//   const [deployer] = await hre.ethers.getSigners();
//   console.log("Deploying contracts with:", deployer.address);

//   const network = hre.network.name;
//   console.log("Network:", network);

//   if (network === "fuji") {
//     // Deploy VaultCore on Avalanche Fuji
//     const VaultCore = await hre.ethers.getContractFactory("VaultCore");
//     const vault = await VaultCore.deploy();
//     await vault.deployed();
//     console.log("✅ VaultCore deployed to:", vault.address);

//     // Deploy CCIPRouter on Fuji
//     const Router = await hre.ethers.getContractFactory("CCIPRouter");
//     const router = await Router.deploy();
//     await router.deployed();
//     console.log("✅ CCIPRouter deployed to:", router.address);

//   } else if (network === "sepolia") {
//     // Deploy RWARegistry on Ethereum Sepolia
//     const RWARegistry = await hre.ethers.getContractFactory("RWARegistry");
//     const rwa = await RWARegistry.deploy();
//     await rwa.deployed();
//     console.log("✅ RWARegistry deployed to:", rwa.address);

//     // Deploy CCIPRouter on Sepolia
//     const Router = await hre.ethers.getContractFactory("CCIPRouter");
//     const router = await Router.deploy();
//     await router.deployed();
//     console.log("✅ CCIPRouter deployed to:", router.address);
//   } else {
//     console.log("⚠️ Unknown network. Use `--network sepolia` or `--network fuji`");
//   }
// }

// main().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });

const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Network:", hre.network.name);

  // Chainlink ETH/USD Price Feed for Fuji
  const priceFeedAddress = "0x86d67c3D38D2bCeE722E601025C25a575021c6EA";

  // Deploy AIRiskManager
  const AIRiskManager = await hre.ethers.getContractFactory("AIRiskManager");
  const riskManager = await AIRiskManager.deploy();
  await riskManager.waitForDeployment();
  console.log("✅ AIRiskManager deployed at:", await riskManager.getAddress());

  // Deploy CCIPRouter
  const CCIPRouter = await hre.ethers.getContractFactory("CCIPRouter");
  const ccipRouter = await CCIPRouter.deploy();
  await ccipRouter.waitForDeployment();
  console.log("✅ CCIPRouter deployed at:", await ccipRouter.getAddress());

  // Deploy VaultCore with all dependencies
  const VaultCore = await hre.ethers.getContractFactory("VaultCore");
  const vault = await VaultCore.deploy(priceFeedAddress, await riskManager.getAddress(), await ccipRouter.getAddress());
  await vault.waitForDeployment();
  console.log("✅ VaultCore deployed at:", await vault.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
