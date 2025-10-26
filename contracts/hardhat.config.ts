import type { HardhatUserConfig } from "hardhat/config";
import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import "@nomicfoundation/hardhat-etherscan"; // for contract verification
import * as dotenv from "dotenv";
import { configVariable } from "hardhat/config";

dotenv.config();

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    },
    hederaTestnet: {
      type: "http",
      chainType: "l1",
      url: configVariable("HEDERA_TESTNET_RPC"),
      accounts: [configVariable("HEDERA_TESTNET_PRIVATE_KEY")],
    },
    hederaMainnet: {
      type: "http",
      chainType: "l1",
      url: configVariable("HEDERA_MAINNET_RPC"),
      accounts: [configVariable("HEDERA_MAINNET_PRIVATE_KEY")],
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || "",
      hederaTestnet: process.env.HEDERA_EXPLORER_API_KEY || "",
      hederaMainnet: process.env.HEDERA_EXPLORER_API_KEY || "",
    },
  },
};

export default config;
