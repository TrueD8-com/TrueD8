import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia, base, baseSepolia } from "wagmi/chains";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

if (!projectId) {
  console.warn(
    "⚠️ WalletConnect Project ID is not set. Get one at https://cloud.walletconnect.com"
  );
}

export const config = getDefaultConfig({
  appName: "TrueD8",
  projectId: projectId,
  chains: [mainnet, sepolia, base, baseSepolia],
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
