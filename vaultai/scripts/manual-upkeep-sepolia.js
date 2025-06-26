const { ethers } = require("hardhat");

async function main() {
  const vaultAddress = "0xb22C345F372217b16E54E46394C75d8296Ea95B1";
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
