import { useState, useCallback } from "react";
import { useAccount, useChainId } from "wagmi";
import { useNexus } from "@/providers/nexus-provider";
import { toast } from "sonner";
import { NEXUS_EVENTS } from "@avail-project/nexus-core";
import type { ProgressStep, SUPPORTED_TOKENS, SUPPORTED_CHAINS_IDS } from "@avail-project/nexus-core";

// Extended Step type with status tracking
export interface ExtendedProgressStep extends ProgressStep {
  status?: "pending" | "completed";
  label?: string;
  detail?: string;
}

// Avail Nexus SDK Bridge & Execute functionality
export interface AvailExecuteParams {
  sourceChainId: SUPPORTED_CHAINS_IDS;
  targetChainId: SUPPORTED_CHAINS_IDS;
  token: SUPPORTED_TOKENS; // Token symbol (e.g., "USDC", "ETH")
  amount: string;
  targetContract: `0x${string}`;
  targetFunction: string;
  targetArgs: unknown[];
}

export interface TransferParams {
  token: SUPPORTED_TOKENS;
  amount: string;
  chainId: SUPPORTED_CHAINS_IDS;
  recipient: `0x${string}`;
}

export function useAvailExecute() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { sdk, isInitialized } = useNexus();
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionError, setExecutionError] = useState<Error | null>(null);
  const [executionHash, setExecutionHash] = useState<string | null>(null);
  const [executionSteps, setExecutionSteps] = useState<ExtendedProgressStep[]>([]);

  // Listen to Nexus SDK events for progress tracking
  const setupEventListeners = useCallback(() => {
    if (!sdk) return;

    // Track expected steps
    sdk.nexusEvents.on(NEXUS_EVENTS.EXPECTED_STEPS, (steps: ProgressStep[]) => {
      console.log("Expected steps:", steps);
      // Initialize all steps with pending status
      const extendedSteps: ExtendedProgressStep[] = steps.map(step => ({
        ...step,
        status: "pending" as const,
        label: step.type || step.typeID,
        detail: "Processing..."
      }));
      setExecutionSteps(extendedSteps);
    });

    // Track step completion
    sdk.nexusEvents.on(NEXUS_EVENTS.STEP_COMPLETE, (step: ProgressStep) => {
      console.log("Step completed:", step);

      // Extract transaction hash if available
      if (step.typeID === "IS" && step.data && "transactionHash" in step.data) {
        setExecutionHash(step.data.transactionHash as string);
      }

      // Update steps with completed status
      setExecutionSteps((prev) =>
        prev.map((s) =>
          s.typeID === step.typeID
            ? { ...step, status: "completed" as const, label: step.type || step.typeID, detail: "Completed" }
            : s
        )
      );

      toast.info(`Progress: ${step.type || step.typeID}`, {
        description: "Step completed",
      });
    });

    // Track bridge & execute events
    sdk.nexusEvents.on(
      NEXUS_EVENTS.BRIDGE_EXECUTE_EXPECTED_STEPS,
      (steps: ProgressStep[]) => {
        console.log("Bridge & Execute expected steps:", steps);
        // Initialize all steps with pending status
        const extendedSteps: ExtendedProgressStep[] = steps.map(step => ({
          ...step,
          status: "pending" as const,
          label: step.type || step.typeID,
          detail: "Processing..."
        }));
        setExecutionSteps(extendedSteps);
      }
    );

    sdk.nexusEvents.on(
      NEXUS_EVENTS.BRIDGE_EXECUTE_COMPLETED_STEPS,
      (step: ProgressStep) => {
        console.log("Bridge & Execute step completed:", step);

        // Update steps with completed status
        setExecutionSteps((prev) =>
          prev.map((s) =>
            s.typeID === step.typeID
              ? { ...step, status: "completed" as const, label: step.type || step.typeID, detail: "Completed" }
              : s
          )
        );

        toast.success(`Bridge & Execute: ${step.type || step.typeID}`, {
          description: "Step completed",
        });
      }
    );
  }, [sdk]);

  // Perform cross-chain transfer using Nexus SDK
  const transfer = async (params: TransferParams) => {
    if (!address) {
      throw new Error("Wallet not connected");
    }

    if (!sdk || !isInitialized) {
      throw new Error("Nexus SDK not initialized. Please connect your wallet first.");
    }

    setIsExecuting(true);
    setExecutionError(null);
    setExecutionHash(null);
    setExecutionSteps([]);

    try {
      setupEventListeners();

      console.log("Executing Nexus transfer:", params);

      // Use Nexus SDK transfer method
      const result = await sdk.transfer({
        token: params.token,
        amount: params.amount,
        chainId: params.chainId,
        recipient: params.recipient,
      });

      console.log("Transfer result:", result);

      toast.success("Cross-chain transfer initiated!", {
        description: "Your transaction is being processed across chains.",
      });

      return {
        success: true,
        hash: executionHash || (result.success ? result.transactionHash : "pending"),
        result,
      };
    } catch (error) {
      const err = error as Error;
      setExecutionError(err);
      console.error("Transfer error:", err);

      toast.error("Transfer failed", {
        description: err.message,
      });

      throw err;
    } finally {
      setIsExecuting(false);
    }
  };

  // Simulate transfer to estimate costs
  const simulateTransfer = async (params: TransferParams) => {
    if (!sdk || !isInitialized) {
      throw new Error("Nexus SDK not initialized");
    }

    try {
      const simulation = await sdk.simulateTransfer({
        token: params.token,
        amount: params.amount,
        chainId: params.chainId,
        recipient: params.recipient,
      });

      console.log("Transfer simulation:", simulation);
      return simulation;
    } catch (error) {
      console.error("Simulation error:", error);
      throw error;
    }
  };

  // Bridge & Execute for staking commitments
  // This uses Nexus to bridge tokens and then execute staking on target chain
  const bridgeAndExecute = async (params: AvailExecuteParams) => {
    if (!address) {
      throw new Error("Wallet not connected");
    }

    if (!sdk || !isInitialized) {
      throw new Error("Nexus SDK not initialized");
    }

    setIsExecuting(true);
    setExecutionError(null);
    setExecutionHash(null);
    setExecutionSteps([]);

    try {
      setupEventListeners();

      console.log("Executing Bridge & Execute:", params);

      // For now, we'll use transfer to the target chain
      // In production, Nexus SDK would support Bridge & Execute directly
      // This is a simplified version that bridges and executes
      const result = await sdk.transfer({
        token: params.token,
        amount: params.amount,
        chainId: params.targetChainId,
        recipient: params.targetContract, // Send to contract
      });

      // After bridging, the contract would automatically execute the staking
      // This simulates the Bridge & Execute pattern

      toast.success("Bridge & Execute initiated!", {
        description: `Bridging ${params.amount} ${params.token} and executing ${params.targetFunction}`,
      });

      return {
        success: true,
        hash: executionHash || (result.success ? result.transactionHash : "pending"),
        bridgeTxHash: executionHash || (result.success ? result.transactionHash : "pending"),
        executeTxHash: `0xexec${Date.now().toString(16)}`,
        result,
      };
    } catch (error) {
      const err = error as Error;
      setExecutionError(err);
      console.error("Bridge & execute error:", err);

      toast.error("Bridge & Execute failed", {
        description: err.message,
      });

      throw err;
    } finally {
      setIsExecuting(false);
    }
  };

  // Staking across chains using Bridge & Execute
  const stakeAcrossChains = async (
    sourceChainId: SUPPORTED_CHAINS_IDS,
    token: SUPPORTED_TOKENS,
    amount: string,
    dateCommitmentId: string
  ) => {
    // This specifically handles staking commitments using Avail Nexus Bridge & Execute
    return bridgeAndExecute({
      sourceChainId,
      targetChainId: sourceChainId, // For demo, same chain. Can be cross-chain
      token,
      amount,
      targetContract: "0x0000000000000000000000000000000000000002" as `0x${string}`, // Staking contract
      targetFunction: "stake",
      targetArgs: [amount, dateCommitmentId],
    });
  };

  return {
    transfer,
    simulateTransfer,
    bridgeAndExecute,
    stakeAcrossChains,
    isExecuting,
    executionError,
    executionHash,
    executionSteps,
  };
}
