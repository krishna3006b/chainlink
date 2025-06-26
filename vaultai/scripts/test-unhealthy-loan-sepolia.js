const { ethers } = require("hardhat");

async function main() {
  // Sepolia VaultCore address (update if needed)
  const vaultAddress = "0xb22C345F372217b16E54E46394C75d8296Ea95B1";
  const riskManagerAddress = "0xDc509c261c2d0e12817cC6F99E9C5776c2768028";

  const [user] = await ethers.getSigners();
  const VaultCore = await ethers.getContractFactory("VaultCore");
  const vault = VaultCore.attach(vaultAddress);
  const AIRiskManager = await ethers.getContractFactory("AIRiskManager");
  const riskManager = AIRiskManager.attach(riskManagerAddress);

  // Set risk score for user (simulate Chainlink Functions/AWS)
  const tx1 = await riskManager.setRiskScore(user.address, 3); // A tier
  await tx1.wait();
  console.log("Set risk score for user", user.address);

  // Approve a large (unhealthy) loan for user
  const tx2 = await vault.receiveLoanApproval(2, ethers.parseEther("2.5"));
  await tx2.wait();
  console.log("Unhealthy loan approved and issued for user");
}

main().catch(console.error);
