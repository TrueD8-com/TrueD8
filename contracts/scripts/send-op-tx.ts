import fs from "fs";
import path from "path";
import hre from "hardhat";

async function main() {
  const { ethers } = hre;
  console.log("Compiling contracts...");
  await hre.run("compile");

  const deployed: Record<string, string> = {};

  // -------------------------------
  // 1️⃣ Deploy D8Fi ERC20
  // -------------------------------
  const D8FiFactory = await ethers.getContractFactory("TrueD8");
  const d8fi = await D8FiFactory.deploy();
  await d8fi.waitForDeployment();
  console.log("D8Fi deployed to:", await d8fi.getAddress());
  deployed.D8Fi = await d8fi.getAddress();

  // -------------------------------
  // 2️⃣ Deploy D8FiStaking
  // -------------------------------
  const D8FiStakingFactory = await ethers.getContractFactory("D8FiStaking");
  const staking = await D8FiStakingFactory.deploy(await d8fi.getAddress());
  await staking.waitForDeployment();
  console.log("D8FiStaking deployed to:", await staking.getAddress());
  deployed.D8FiStaking = await staking.getAddress();

  // -------------------------------
  // 3️⃣ Deploy TrueD8Profile
  // -------------------------------
  const TrueD8ProfileFactory = await ethers.getContractFactory("TrueD8Profile");
  // default royalty: deployer 5% = 500 bps
  const [deployer] = await ethers.getSigners(); // for default royalty
  const profile = await TrueD8ProfileFactory.deploy(deployer.address, 500);
  await profile.waitForDeployment();
  console.log("TrueD8Profile deployed to:", await profile.getAddress());
  deployed.TrueD8Profile = await profile.getAddress();

  // -------------------------------
  // Save deployed addresses
  // -------------------------------
  const deploymentsFile = path.join(__dirname, "../deployments.json");
  fs.writeFileSync(deploymentsFile, JSON.stringify(deployed, null, 2));
  console.log("All deployed addresses saved to deployments.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
