const { ethers } = require("hardhat");

async function main() {
  // Sepolia VaultCore address (update if needed)
  const vaultAddress = "0xb22C345F372217b16E54E46394C75d8296Ea95B1";
  const VaultCore = await ethers.getContractFactory("VaultCore");
  const vault = VaultCore.attach(vaultAddress);

  // Get the filter for LoanLiquidated events
  const filter = vault.filters.LoanLiquidated();
  const events = await vault.queryFilter(filter, -1000); // last 1000 blocks

  if (events.length === 0) {
    console.log("No recent liquidations found on Sepolia.");
    return;
  }

  for (const event of events) {
    console.log(`LoanLiquidated: loanId=${event.args.loanId.toString()} block=${event.blockNumber}`);
  }
}

main().catch(console.error);
