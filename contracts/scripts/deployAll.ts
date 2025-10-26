import { network } from "hardhat";
import fs from "fs";
import path from "path";

// ABI & Bytecode imports from Hardhat artifacts
import D8FiArtifact from "../artifacts/contracts/D8Fi.sol/TrueD8.json";
import D8FiStakingArtifact from "../artifacts/contracts/D8FiStaking.sol/D8FiStaking.json";
import TrueD8ProfileArtifact from "../artifacts/contracts/TrueD8Profile.sol/TrueD8Profile.json";

async function main() {
  // Connect to network via Hardhat Viem plugin
  const { viem } = await network.connect({ network: "hardhatMainnet", chainType: "l1" });

  const publicClient = await viem.getPublicClient();
  const [deployerClient] = await viem.getWalletClients();

  console.log("Deploying contracts from address:", deployerClient.account.address);

  const deployed: Record<string, string> = {};

  // -------------------------------
  // 1️⃣ Deploy D8Fi ERC20
  // -------------------------------
  const d8fiAddress = await deployContract(deployerClient, D8FiArtifact, []);
  console.log("D8Fi deployed to:", d8fiAddress);
  deployed.D8Fi = d8fiAddress;

  // -------------------------------
  // 2️⃣ Deploy D8FiStaking
  // -------------------------------
  const stakingAddress = await deployContract(deployerClient, D8FiStakingArtifact, [d8fiAddress]);
  console.log("D8FiStaking deployed to:", stakingAddress);
  deployed.D8FiStaking = stakingAddress;

  // -------------------------------
  // 3️⃣ Deploy TrueD8Profile
  // -------------------------------
  // default royalty: deployer 5% = 500 bps
  const profileAddress = await deployContract(deployerClient, TrueD8ProfileArtifact, [deployerClient.account.address, 500]);
  console.log("TrueD8Profile deployed to:", profileAddress);
  deployed.TrueD8Profile = profileAddress;

  // -------------------------------
  // Save deployed addresses
  // -------------------------------
  const deploymentsFile = path.join(__dirname, "../deployments.json");
  fs.writeFileSync(deploymentsFile, JSON.stringify(deployed, null, 2));
  console.log("All deployed addresses saved to deployments.json");

  // Helper function
  async function deployContract(walletClient: any, artifact: any, args: any[]): Promise<string> {
    const contract = await walletClient.deployContract({
      abi: artifact.abi,
      bytecode: artifact.bytecode,
      args,
    });

    // wait for deployment
    await publicClient.waitForTransactionReceipt({ hash: contract });
    return contract.toString(); // contract address
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
