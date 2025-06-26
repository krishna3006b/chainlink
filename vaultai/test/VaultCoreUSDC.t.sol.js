import { expect } from "chai";
import { ethers } from "hardhat";

describe("VaultCoreUSDC", function () {
  let vault, riskManager, ccipRouter, owner, user;
  const ethPriceFeed = "0x694AA1769357215DE4FAC081bf1f309aDC325306";
  const usdcPriceFeed = "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e";

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    const AIRiskManager = await ethers.getContractFactory("AIRiskManager");
    riskManager = await AIRiskManager.deploy();
    await riskManager.waitForDeployment();
    const CCIPRouter = await ethers.getContractFactory("CCIPRouter");
    ccipRouter = await CCIPRouter.deploy();
    await ccipRouter.waitForDeployment();
    const VaultCoreUSDC = await ethers.getContractFactory("VaultCoreUSDC");
    vault = await VaultCoreUSDC.deploy(ethPriceFeed, usdcPriceFeed, await riskManager.getAddress(), await ccipRouter.getAddress());
    await vault.waitForDeployment();
  });

  it("should issue and liquidate ETH and USDC loans", async function () {
    await vault.connect(owner).receiveLoanApproval(1, ethers.parseEther("2"), ethers.ZeroAddress); // ETH
    await vault.connect(owner).receiveLoanApproval(2, 2000 * 1e6, "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"); // USDC
    expect(await vault.loanId()).to.equal(2n);
    await vault.liquidateLoan(0);
    await vault.liquidateLoan(1);
    const loan0 = await vault.loans(0);
    const loan1 = await vault.loans(1);
    expect(loan0.repaid).to.be.true;
    expect(loan1.repaid).to.be.true;
  });
});
