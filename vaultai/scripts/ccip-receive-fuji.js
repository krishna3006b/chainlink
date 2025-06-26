const { ethers } = require("hardhat");

async function main() {
  const fujiRouter = "0xfa0DA9602CFfe09e2860caa7ec01b94b0aDd4458";
  const CCIPRouter = await ethers.getContractFactory("CCIPRouter");
  const router = CCIPRouter.attach(fujiRouter);
  const tx = await router.receiveMessage("Hello from Sepolia!");
  await tx.wait();
  console.log("Message received on Fuji from Sepolia");
}

main().catch(console.error);
