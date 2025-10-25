"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAvailExecute } from "@/hooks/useAvailExecute";
import { useAccount, useChainId, useBalance } from "wagmi";
import { SUPPORTED_CHAINS } from "@/config/contracts";
import type { SUPPORTED_CHAINS_IDS } from "@avail-project/nexus-core";
import {
  Fuel,
  Loader2,
  CheckCircle2,
  XCircle,
  Zap,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { formatEther } from "viem";

export function GasRefuel() {
  const { address } = useAccount();
  const sourceChainId = useChainId();
  const [targetChainId, setTargetChainId] = useState<number>(84532); // Base Sepolia default
  const [amount, setAmount] = useState("");

  const { transfer, isExecuting, executionError, executionHash, executionSteps } = useAvailExecute();

  const [isSuccess, setIsSuccess] = useState(false);

  // Get ETH balance on source chain
  const { data: sourceBalance } = useBalance({
    address,
    chainId: sourceChainId,
  });

  // Get ETH balance on target chain (for display)
  const { data: targetBalance, refetch: refetchTargetBalance } = useBalance({
    address,
    chainId: targetChainId as 1 | 11155111 | 8453 | 84532,
  });

  // Estimate transactions the ETH will provide
  const estimateTransactions = (ethAmount: string) => {
    const amount = parseFloat(ethAmount);
    if (isNaN(amount) || amount <= 0) return 0;

    // Rough estimate: 0.001 ETH = ~50 transactions on most L2s
    // This is approximate and varies by network
    return Math.floor((amount / 0.001) * 50);
  };

  const handleRefuel = async () => {
    if (!targetChainId || !amount || !address) {
      toast.error("Please select a chain and enter an amount");
      return;
    }

    const refuelAmount = parseFloat(amount);
    if (isNaN(refuelAmount) || refuelAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!sourceBalance || refuelAmount > parseFloat(formatEther(sourceBalance.value))) {
      toast.error("Insufficient ETH balance");
      return;
    }

    try {
      // Use Avail Nexus to bridge ETH to target chain
      await transfer({
        token: "ETH",
        amount: amount,
        chainId: targetChainId as SUPPORTED_CHAINS_IDS,
        recipient: address, // Send to self
      });

      setIsSuccess(true);

      toast.success("Gas refueled successfully!", {
        description: `Sent ${amount} ETH to ${SUPPORTED_CHAINS.find(c => c.id === targetChainId)?.name}`,
      });

      // Refetch target balance after delay
      setTimeout(() => {
        refetchTargetBalance();
      }, 3000);

      // Reset form after delay
      setTimeout(() => {
        setAmount("");
        setIsSuccess(false);
      }, 5000);

    } catch (error) {
      console.error("Refuel failed:", error);
      toast.error("Refuel failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fuel className="w-5 h-5 text-blue-400" />
            Cross-Chain Gas Refuel
          </CardTitle>
          <CardDescription>
            Top up gas on any chain instantly using Avail Nexus
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span>
              Never run out of gas again - bridge ETH to any chain in seconds
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Current Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source Chain Balance */}
        <Card className="border border-white/10 bg-white/5 backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-400">
                Available on {SUPPORTED_CHAINS.find(c => c.id === sourceChainId)?.name}
              </p>
              <p className="text-2xl font-bold text-white">
                {sourceBalance ? parseFloat(formatEther(sourceBalance.value)).toFixed(4) : "0.0000"} ETH
              </p>
              <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30">
                Source Chain
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Target Chain Balance */}
        <Card className="border border-white/10 bg-white/5 backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-400">
                Available on {SUPPORTED_CHAINS.find(c => c.id === targetChainId)?.name}
              </p>
              <p className="text-2xl font-bold text-white">
                {targetBalance ? parseFloat(formatEther(targetBalance.value)).toFixed(4) : "0.0000"} ETH
              </p>
              <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                Target Chain
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Refuel Form */}
      <Card className="border border-blue-500/30 bg-white/5 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-lg">Refuel Gas</CardTitle>
          <CardDescription>
            Bridge ETH from {SUPPORTED_CHAINS.find(c => c.id === sourceChainId)?.name} to another chain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Target Chain Selector */}
          <div className="space-y-2">
            <Label htmlFor="target-chain">Target Chain</Label>
            <Select
              value={targetChainId.toString()}
              onValueChange={(value) => setTargetChainId(parseInt(value))}
              disabled={isExecuting || isSuccess}
            >
              <SelectTrigger id="target-chain">
                <SelectValue placeholder="Select chain" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_CHAINS
                  .filter(chain => chain.id !== sourceChainId)
                  .map((chain) => (
                    <SelectItem key={chain.id} value={chain.id.toString()}>
                      {chain.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="refuel-amount">Amount (ETH)</Label>
            <div className="relative">
              <Input
                id="refuel-amount"
                type="number"
                step="0.001"
                placeholder="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isExecuting || isSuccess}
                className="pr-20"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7"
                onClick={() => {
                  if (sourceBalance) {
                    // Leave 0.001 ETH for gas on source chain
                    const maxAmount = Math.max(0, parseFloat(formatEther(sourceBalance.value)) - 0.001);
                    setAmount(maxAmount.toFixed(4));
                  }
                }}
                disabled={isExecuting || isSuccess}
              >
                Max
              </Button>
            </div>
            <p className="text-xs text-gray-400">
              Recommended: 0.01 - 0.05 ETH for regular usage
            </p>
          </div>

          {/* Transaction Estimate */}
          {amount && parseFloat(amount) > 0 && (
            <div className="rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Estimated Transactions</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    ~{estimateTransactions(amount)} txns
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-yellow-400" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                On {SUPPORTED_CHAINS.find(c => c.id === targetChainId)?.name} (approximate)
              </p>
            </div>
          )}

          {/* Bridge Progress */}
          {isExecuting && executionSteps.length > 0 && (
            <div className="space-y-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 p-4">
              <div className="flex items-center gap-2 text-blue-900 dark:text-blue-100 mb-3">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm font-medium">Bridging ETH...</span>
              </div>
              <div className="space-y-2">
                {executionSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-xs"
                  >
                    {step.status === "completed" ? (
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                    ) : (
                      <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                    )}
                    <span className="flex-1">{step.label || step.typeID}</span>
                    {step.detail && (
                      <span className="text-gray-500">{step.detail}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success State */}
          {isSuccess && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950 p-3 text-green-900 dark:text-green-100">
                <CheckCircle2 className="h-4 w-4" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Gas refuel successful!</p>
                  {executionHash && (
                    <p className="text-xs mt-1 font-mono truncate">
                      Tx: {executionHash.slice(0, 10)}...{executionHash.slice(-8)}
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 p-4 text-center">
                <Zap className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="font-bold text-lg text-blue-900 dark:text-blue-100">
                  Fueled up and ready!
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Your {amount} ETH is now on {SUPPORTED_CHAINS.find(c => c.id === targetChainId)?.name}
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {executionError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950 p-3 text-red-900 dark:text-red-100">
              <XCircle className="h-4 w-4" />
              <span className="text-sm">
                Refuel failed: {executionError.message}
              </span>
            </div>
          )}

          {/* Info Box */}
          <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/50 border border-yellow-200 dark:border-yellow-800 p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-xs text-yellow-900 dark:text-yellow-100">
                <p className="font-medium mb-1">Gas Refuel Tips:</p>
                <ul className="text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• Always keep some ETH on your source chain for gas</li>
                  <li>• 0.01 ETH usually covers ~50 transactions on L2s</li>
                  <li>• Refuel before staking dates or minting NFTs</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setAmount("");
                setIsSuccess(false);
              }}
              disabled={isExecuting}
            >
              {isSuccess ? "Refuel Again" : "Clear"}
            </Button>
            {!isSuccess && (
              <Button
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                onClick={handleRefuel}
                disabled={!amount || !targetChainId || isExecuting || !address}
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Refueling...
                  </>
                ) : (
                  <>
                    <Fuel className="mr-2 h-4 w-4" />
                    Refuel {amount || "0"} ETH
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Common Use Cases */}
      <Card className="border border-white/10 bg-white/5 backdrop-blur-xl">
        <CardContent className="pt-6">
          <h4 className="font-semibold text-white mb-3">When to Refuel Gas?</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-start gap-2 text-sm">
              <span className="text-blue-400 mt-0.5">•</span>
              <div>
                <p className="text-white font-medium">Before Staking Dates</p>
                <p className="text-gray-400 text-xs">Ensure you have gas to stake commitments</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <span className="text-blue-400 mt-0.5">•</span>
              <div>
                <p className="text-white font-medium">Minting NFTs</p>
                <p className="text-gray-400 text-xs">Mint achievement NFTs on your preferred chain</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <span className="text-blue-400 mt-0.5">•</span>
              <div>
                <p className="text-white font-medium">Claiming Rewards</p>
                <p className="text-gray-400 text-xs">Claim PYUSD rewards on any chain you want</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <span className="text-blue-400 mt-0.5">•</span>
              <div>
                <p className="text-white font-medium">Premium Subscriptions</p>
                <p className="text-gray-400 text-xs">Pay for premium from any chain with gas</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
