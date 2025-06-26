const { ethers } = require("hardhat");

async function main() {
  const sepoliaRouter = "0x2123Ea08d2f2C7991a00ABCbEf5c9992159AF3A4";
  const fujiRouter = "0xfa0DA9602CFfe09e2860caa7ec01b94b0aDd4458";

  const [deployer] = await ethers.getSigners();
  const CCIPRouter = await ethers.getContractFactory("CCIPRouter");
  const router = CCIPRouter.attach(sepoliaRouter);
  const tx = await router.sendMessage(fujiRouter, "Hello from Sepolia!");
  await tx.wait();
  console.log("Message sent from Sepolia to Fuji");
}

main().catch(console.error);
