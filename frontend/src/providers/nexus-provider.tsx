"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
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
  const { connector, isConnected, address } = useAccount();

  // Track initialization per wallet address to prevent re-initialization on refresh
  const initializationAttempted = useRef<Set<string>>(new Set());
  const sdkInstanceRef = useRef<NexusSDK | null>(null);

  const initializeNexus = useCallback(async () => {
    // Skip if already initialized or initializing
    if (isInitialized || isInitializing) {
      console.log("Nexus SDK already initialized or initializing");
      return;
    }

    // Check wallet connection
    if (!isConnected || !connector || !address) {
      const err = new Error("Wallet not connected");
      setError(err);
      console.warn("Cannot initialize Nexus: Wallet not connected");
      return;
    }

    // Check if we already attempted initialization for this address
    if (initializationAttempted.current.has(address.toLowerCase())) {
      console.log("Nexus SDK already initialized for this wallet address");
      if (sdkInstanceRef.current) {
        setSdk(sdkInstanceRef.current);
        setIsInitialized(true);
      }
      return;
    }

    try {
      setIsInitializing(true);
      setError(null);

      console.log("Initializing Nexus SDK for address:", address);

      // Create SDK instance
      const nexusSDK = new NexusSDK({ network });

      // Set hooks BEFORE initialization to ensure they're ready
      nexusSDK.setOnIntentHook(({ intent, allow, deny, refresh }) => {
        console.log("Intent approval requested:", intent);

        // Auto-approve intents silently to prevent repeated popups
        // The actual transaction signature will still require user approval
        allow();
      });

      nexusSDK.setOnAllowanceHook(({ allow, deny, sources }) => {
        console.log("Allowance selection requested:", sources);

        // Auto-approve minimum allowance silently
        // This prevents repeated allowance approval popups
        allow(["min"]);
      });

      // Get provider from connector
      const provider = await connector.getProvider();
      if (!provider) {
        throw new Error("Failed to get provider from connector");
      }

      // Initialize SDK with provider - this will request ONE signature for login
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await nexusSDK.initialize(provider as any);

      // Store SDK instance and mark as initialized
      sdkInstanceRef.current = nexusSDK;
      initializationAttempted.current.add(address.toLowerCase());

      setSdk(nexusSDK);
      setIsInitialized(true);

      console.log("Nexus SDK initialized successfully for", address);

      // Only show success toast once
      toast.success("Nexus initialized", {
        description: "Cross-chain payments enabled",
        duration: 2000,
      });

    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error("Failed to initialize Nexus SDK:", error);

      // Remove from attempted set on error so user can retry
      if (address) {
        initializationAttempted.current.delete(address.toLowerCase());
      }

      toast.error("Nexus initialization failed", {
        description: error.message,
      });
    } finally {
      setIsInitializing(false);
    }
  }, [isConnected, connector, network, isInitialized, isInitializing, address]);

  // Auto-initialize when wallet connects
  useEffect(() => {
    if (isConnected && address && !isInitialized && !isInitializing) {
      initializeNexus();
    }
  }, [isConnected, address, isInitialized, isInitializing, initializeNexus]);

  // Clean up when wallet disconnects
  useEffect(() => {
    if (!isConnected && sdk) {
      console.log("Wallet disconnected, cleaning up Nexus SDK");
      sdkInstanceRef.current = null;
      setSdk(null);
      setIsInitialized(false);
      setError(null);
      // Don't clear initializationAttempted - keep the session cache
    }
  }, [isConnected, sdk]);

  const value = {
    sdk,
    isInitialized,
    isInitializing,
    initializeNexus,
    error,
  };

  return <NexusContext.Provider value={value}>{children}</NexusContext.Provider>;
}
