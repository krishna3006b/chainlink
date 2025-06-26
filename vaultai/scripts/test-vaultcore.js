const { ethers } = require("hardhat");

async function main() {
  // Use deployed addresses from last deployment
  const vaultAddress = "0x454A4226aB2Eee18d747D146f10cB432c2Cf9a67";
  const riskManagerAddress = "0xDc1Fd6267FB58A2c91B00ac4187fCd819Bf93bCb";

  const [user] = await ethers.getSigners();
  const VaultCore = await ethers.getContractFactory("VaultCore");
  const vault = VaultCore.attach(vaultAddress);
  const AIRiskManager = await ethers.getContractFactory("AIRiskManager");
  const riskManager = AIRiskManager.attach(riskManagerAddress);

  // Set risk score for user (simulate Chainlink Functions/AWS)
  const tx1 = await riskManager.setRiskScore(user.address, 3); // A tier
  await tx1.wait();
  console.log("Set risk score for user", user.address);

  // Approve a loan for user
  const tx2 = await vault.receiveLoanApproval(1, ethers.parseEther("0.5"));
  await tx2.wait();
  console.log("Loan approved and issued for user");

  // Check loan health
  const healthy = await vault.checkHealth();
  console.log("Loan health:", healthy);

  // Simulate liquidation (should not liquidate healthy loan)
  try {
    await vault.liquidateLoan(0);
    console.log("Loan liquidated (should only happen if unhealthy)");
  } catch (e) {
    console.log("Liquidation failed as expected for healthy loan");
  }
}

main().catch(console.error);
