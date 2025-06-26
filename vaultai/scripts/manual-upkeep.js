const { ethers } = require("hardhat");

async function main() {
  const vaultAddress = "0x454A4226aB2Eee18d747D146f10cB432c2Cf9a67";
  const VaultCore = await ethers.getContractFactory("VaultCore");
  const vault = VaultCore.attach(vaultAddress);

  // Manually call checkUpkeep
  const [upkeepNeeded, performData] = await vault.checkUpkeep("0x");
  console.log("Upkeep needed:", upkeepNeeded);

  if (upkeepNeeded) {
    const tx = await vault.performUpkeep(performData);
    await tx.wait();
    console.log("performUpkeep executed (liquidation triggered)");
  } else {
    console.log("No upkeep needed (no unhealthy loans)");
  }
}

main().catch(console.error);
