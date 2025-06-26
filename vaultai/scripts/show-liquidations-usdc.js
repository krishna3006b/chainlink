import { ethers } from "hardhat";

async function main() {
  const vaultAddress = process.argv[2];
  if (!vaultAddress) {
    console.error("Usage: npx hardhat run scripts/show-liquidations-usdc.js --network <network> <vaultAddress>");
    process.exit(1);
  }
  const VaultCoreUSDC = await ethers.getContractFactory("VaultCoreUSDC");
  const vault = VaultCoreUSDC.attach(vaultAddress);
  const filter = vault.filters.LoanLiquidated();
  const events = await vault.queryFilter(filter, -10000); // last 10k blocks
  console.log("Recent USDC/ETH liquidations:");
  for (const e of events) {
    console.log(`Loan ID: ${e.args.loanId}, Block: ${e.blockNumber}`);
  }
}

main().catch(console.error);
