const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying MockRealEstate with:", deployer.address);

  const MockRealEstate = await ethers.getContractFactory("MockRealEstate");
  const contract = await MockRealEstate.deploy(deployer.address); // ✅ pass owner
  await contract.waitForDeployment();
  console.log("MockRealEstate deployed at:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
