const { ethers } = require("hardhat");

async function main() {
  // Replace with your deployed addresses
  const registryAddress = "0xDc1Fd6267FB58A2c91B00ac4187fCd819Bf93bCb"; // TODO: Fill in actual Sepolia RWARegistry address
  const mockRWAAddress = "0x454A4226aB2Eee18d747D146f10cB432c2Cf9a67"; // TODO: Fill in actual Sepolia MockRealEstate address

  const [deployer] = await ethers.getSigners();
  const RWARegistry = await ethers.getContractFactory("RWARegistry");
  const registry = RWARegistry.attach(registryAddress);
  const MockRealEstate = await ethers.getContractFactory("MockRealEstate");
  const mockRWA = MockRealEstate.attach(mockRWAAddress);

  // Register a mock asset
  const tx1 = await registry.registerAsset("ipfs://mock-metadata-uri", 1000000);
  const receipt1 = await tx1.wait();
  const assetId = receipt1.logs[0].args.id;
  console.log("Registered asset with ID:", assetId.toString());

  // Mint a mock real estate NFT
  const tx2 = await mockRWA.mint(deployer.address);
  const receipt2 = await tx2.wait();
  const tokenId = receipt2.logs[0].args.tokenId;
  console.log("Minted MockRealEstate NFT with tokenId:", tokenId.toString());
}

main().catch(console.error);
