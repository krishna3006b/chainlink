import { ethers } from "hardhat";

async function main() {
  const vaultAddress = process.argv[2];
  if (!vaultAddress) {
    console.error("Usage: npx hardhat run scripts/monitor-liquidations-usdc.js --network <network> <vaultAddress>");
    process.exit(1);
  }
  const VaultCoreUSDC = await ethers.getContractFactory("VaultCoreUSDC");
  const vault = VaultCoreUSDC.attach(vaultAddress);
  vault.on("LoanLiquidated", (loanId, event) => {
    console.log(`Liquidation detected! Loan ID: ${loanId}, Block: ${event.blockNumber}`);
  });
  console.log("Monitoring for USDC/ETH liquidations...");
}

main().catch(console.error);
