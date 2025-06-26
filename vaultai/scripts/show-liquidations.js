const { ethers } = require("hardhat");

async function main() {
  const vaultAddress = "0x454A4226aB2Eee18d747D146f10cB432c2Cf9a67";
  const VaultCore = await ethers.getContractFactory("contracts/VaultCore.sol:VaultCore");
  const vault = VaultCore.attach(vaultAddress);

  // Get the filter for LoanLiquidated events
  const filter = vault.filters.LoanLiquidated();
  const events = await vault.queryFilter(filter, -1000); // last 1000 blocks

  if (events.length === 0) {
    console.log("No recent liquidations found.");
    return;
  }

  for (const event of events) {
    console.log(`LoanLiquidated: loanId=${event.args.loanId.toString()} block=${event.blockNumber}`);
  }
}

main().catch(console.error);
