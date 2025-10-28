"use client";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { NotificationProvider, TransactionPopupProvider } from "@blockscout/app-sdk";
import { NexusProvider } from "@/providers/nexus-provider";
import { NexusProvider as NexusWidgetsProvider } from "@avail-project/nexus-widgets";
import { config } from "@/config/wagmi";
import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            theme={darkTheme({
              accentColor: "#a855f7",
              accentColorForeground: "white",
              borderRadius: "large",
            })}
            modalSize="compact"
          >
            <NotificationProvider>
              <TransactionPopupProvider>
                <NexusProvider network="testnet">
                  <NexusWidgetsProvider network="testnet">
                    {children}
                  </NexusWidgetsProvider>
                </NexusProvider>
              </TransactionPopupProvider>
            </NotificationProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}
