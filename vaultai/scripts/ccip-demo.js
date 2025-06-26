const { ethers } = require("hardhat");

async function main() {
  // Replace with your deployed CCIPRouter addresses
  const sepoliaRouter = "0x2123Ea08d2f2C7991a00ABCbEf5c9992159AF3A4";
  const fujiRouter = "0xfa0DA9602CFfe09e2860caa7ec01b94b0aDd4458";

  const [deployer] = await ethers.getSigners();
  const CCIPRouter = await ethers.getContractFactory("CCIPRouter");

  // Simulate sending a message from Sepolia to Fuji
  const router = CCIPRouter.attach(sepoliaRouter);
  const tx1 = await router.sendMessage(fujiRouter, "Hello from Sepolia!");
  await tx1.wait();
  console.log("Message sent from Sepolia to Fuji");

  // Simulate Fuji receiving the message (in real CCIP, this would be automatic)
  const routerFuji = CCIPRouter.attach(fujiRouter);
  const tx2 = await routerFuji.receiveMessage("Hello from Sepolia!");
  await tx2.wait();
  console.log("Message received on Fuji from Sepolia");
}

main().catch(console.error);
