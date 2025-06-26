const { ethers } = require("hardhat");

async function main() {
    // Fuji VaultCore address
    const vaultAddress = "0x454A4226aB2Eee18d747D146f10cB432c2Cf9a67";
    const riskManagerAddress = "0xDc1Fd6267FB58A2c91B00ac4187fCd819Bf93bCb";

    const [user] = await ethers.getSigners();
    const VaultCore = await ethers.getContractFactory("contracts/VaultCore.sol:VaultCore");
    const vault = VaultCore.attach(vaultAddress);
    const AIRiskManager = await ethers.getContractFactory("contracts/AIRiskManager.sol:AIRiskManager");
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
