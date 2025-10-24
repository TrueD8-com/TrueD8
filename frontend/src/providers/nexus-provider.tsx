"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { NexusSDK } from "@avail-project/nexus-core";
import type { NexusNetwork } from "@avail-project/nexus-core";
import { useAccount } from "wagmi";
import { toast } from "sonner";

interface NexusContextType {
  sdk: NexusSDK | null;
  isInitialized: boolean;
  isInitializing: boolean;
  initializeNexus: () => Promise<void>;
  error: Error | null;
}

const NexusContext = createContext<NexusContextType>({
  sdk: null,
  isInitialized: false,
  isInitializing: false,
  initializeNexus: async () => {},
  error: null,
});

export function useNexus() {
  const context = useContext(NexusContext);
  if (!context) {
    throw new Error("useNexus must be used within a NexusProvider");
  }
  return context;
}

interface NexusProviderProps {
  children: React.ReactNode;
  network?: NexusNetwork;
}

export function NexusProvider({ children, network = "testnet" }: NexusProviderProps) {
  const [sdk, setSdk] = useState<NexusSDK | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { connector, isConnected } = useAccount();

  const initializeNexus = useCallback(async () => {
    if (isInitialized || isInitializing) {
      console.log("Nexus SDK already initialized or initializing");
      return;
    }

    if (!isConnected || !connector) {
      const err = new Error("Wallet not connected");
      setError(err);
      console.warn("Cannot initialize Nexus: Wallet not connected");
      return;
    }

    try {
      setIsInitializing(true);
      setError(null);

      console.log("Initializing Nexus SDK...");

      // Create SDK instance
      const nexusSDK = new NexusSDK({ network });

      // Get provider from connector
      const provider = await connector.getProvider();
      if (!provider) {
        throw new Error("Failed to get provider from connector");
      }

      // Initialize SDK with provider
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await nexusSDK.initialize(provider as any);

      // Set required hooks
      nexusSDK.setOnIntentHook(({ intent, allow, deny, refresh }) => {
        console.log("Intent approval requested:", intent);

        // In production, show a modal to user for approval
        // For now, auto-approve
        toast.info("Intent approval requested", {
          description: "Reviewing cross-chain transaction...",
        });

        // Auto-approve for demo purposes
        // In production, let user decide
        allow();
      });

      nexusSDK.setOnAllowanceHook(({ allow, deny, sources }) => {
        console.log("Allowance selection requested:", sources);

        // Allow minimum required allowance
        // Options: 'min', 'balance', 'infinite'
        allow(["min"]);
      });

      setSdk(nexusSDK);
      setIsInitialized(true);

      toast.success("Nexus SDK initialized", {
        description: "Cross-chain payments are now enabled!",
      });

      console.log("Nexus SDK initialized successfully");
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error("Failed to initialize Nexus SDK:", error);

      toast.error("Failed to initialize Nexus SDK", {
        description: error.message,
      });
    } finally {
      setIsInitializing(false);
    }
  }, [isConnected, connector, network, isInitialized, isInitializing]);

  // Auto-initialize when wallet connects
  useEffect(() => {
    if (isConnected && !isInitialized && !isInitializing) {
      initializeNexus();
    }
  }, [isConnected, isInitialized, isInitializing, initializeNexus]);

  const value = {
    sdk,
    isInitialized,
    isInitializing,
    initializeNexus,
    error,
  };

  return <NexusContext.Provider value={value}>{children}</NexusContext.Provider>;
}
