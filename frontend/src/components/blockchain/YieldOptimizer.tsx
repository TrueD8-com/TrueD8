"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAvailExecute } from "@/hooks/useAvailExecute";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { useAccount, useChainId } from "wagmi";
import { SUPPORTED_CHAINS } from "@/config/contracts";
import type { SUPPORTED_CHAINS_IDS } from "@avail-project/nexus-core";
import {
  TrendingUp,
  Loader2,
  CheckCircle2,
  XCircle,
  Sparkles,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

// Mock APY data from different DeFi protocols across chains
const YIELD_OPPORTUNITIES = [
  {
    protocol: "Aave V3",
    chain: "Sepolia Testnet",
    chainId: 11155111 as SUPPORTED_CHAINS_IDS,
    token: "USDC",
    apy: 3.8,
    tvl: "$2.4M",
    risk: "Low" as const,
    contractAddress: "0x0000000000000000000000000000000000000001" as `0x${string}`,
  },
  {
    protocol: "Morpho",
    chain: "Polygon Amoy",
    chainId: 80002 as SUPPORTED_CHAINS_IDS,
    token: "USDC",
    apy: 5.1,
    tvl: "$1.8M",
    risk: "Medium" as const,
    contractAddress: "0x0000000000000000000000000000000000000002" as `0x${string}`,
  },
  {
    protocol: "Aave V3",
    chain: "Base Sepolia",
    chainId: 84532 as SUPPORTED_CHAINS_IDS,
    token: "USDC",
    apy: 4.2,
    tvl: "$3.1M",
    risk: "Low" as const,
    contractAddress: "0x0000000000000000000000000000000000000003" as `0x${string}`,
  },
];

export function YieldOptimizer() {
  const { address } = useAccount();
  const chainId = useChainId();
  const [amount, setAmount] = useState("");
  const [selectedOpportunity, setSelectedOpportunity] = useState<typeof YIELD_OPPORTUNITIES[0] | null>(null);

  const { bridgeAndExecute, isExecuting, executionError, executionHash, executionSteps } = useAvailExecute();
  const { formattedBalance, symbol } = useTokenBalance();

  const [isSuccess, setIsSuccess] = useState(false);

  // Find the best APY
  const bestOpportunity = YIELD_OPPORTUNITIES.reduce((best, current) =>
    current.apy > best.apy ? current : best
  );

  const getRiskColor = (risk: "Low" | "Medium" | "High") => {
    switch (risk) {
      case "Low":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "Medium":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "High":
        return "bg-red-500/20 text-red-300 border-red-500/30";
    }
  };

  const calculateEarnings = (depositAmount: string, apy: number) => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) return 0;

    // Calculate monthly earnings
    const monthlyRate = apy / 100 / 12;
    return (amount * monthlyRate).toFixed(2);
  };

  const handleDeposit = async () => {
    if (!selectedOpportunity || !amount || !address) {
      toast.error("Please select a protocol and enter an amount");
      return;
    }

    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      // Use Avail Nexus Bridge & Execute to:
      // 1. Bridge USDC to target chain
      // 2. Execute deposit in lending protocol
      await bridgeAndExecute({
        sourceChainId: chainId as SUPPORTED_CHAINS_IDS,
        targetChainId: selectedOpportunity.chainId,
        token: "USDC",
        amount: amount,
        targetContract: selectedOpportunity.contractAddress,
        targetFunction: "deposit",
        targetArgs: [amount, address],
      });

      setIsSuccess(true);

      toast.success("Funds deposited successfully!", {
        description: `Earning ${selectedOpportunity.apy}% APY on ${selectedOpportunity.protocol}`,
      });

      // Reset form after delay
      setTimeout(() => {
        setAmount("");
        setSelectedOpportunity(null);
        setIsSuccess(false);
      }, 3000);

    } catch (error) {
      console.error("Deposit failed:", error);
      toast.error("Deposit failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            Unified Yield Optimizer
          </CardTitle>
          <CardDescription>
            Optimize your idle USDC across chains for the best APY. Powered by Avail Nexus Bridge & Execute.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>
              Automatically bridge and deposit in one transaction across {YIELD_OPPORTUNITIES.length} chains
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Available Balance */}
      <Card className="border border-white/10 bg-white/5 backdrop-blur-xl">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Available Balance</p>
              <p className="text-2xl font-bold text-white">
                {formattedBalance} {symbol}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAmount(formattedBalance)}
              disabled={isExecuting || isSuccess}
              className="border-purple-500/30"
            >
              Max
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Yield Opportunities */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Available Opportunities</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {YIELD_OPPORTUNITIES.map((opportunity) => {
            const isBest = opportunity.chainId === bestOpportunity.chainId;
            const isSelected = selectedOpportunity?.chainId === opportunity.chainId;

            return (
              <motion.div
                key={opportunity.chainId}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`cursor-pointer transition-all ${
                    isSelected
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  } backdrop-blur-xl`}
                  onClick={() => setSelectedOpportunity(opportunity)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{opportunity.protocol}</CardTitle>
                        <p className="text-xs text-gray-400 mt-1">{opportunity.chain}</p>
                      </div>
                      {isBest && (
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                          Best Rate
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* APY */}
                    <div>
                      <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {opportunity.apy}%
                      </p>
                      <p className="text-xs text-gray-400">Annual Percentage Yield</p>
                    </div>

                    {/* Details */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">TVL</span>
                        <span className="text-white font-medium">{opportunity.tvl}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Token</span>
                        <span className="text-white font-medium">{opportunity.token}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Risk</span>
                        <Badge variant="outline" className={getRiskColor(opportunity.risk)}>
                          {opportunity.risk}
                        </Badge>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="pt-2 border-t border-white/10">
                        <div className="flex items-center gap-1 text-xs text-purple-300">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Selected</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Deposit Form */}
      {selectedOpportunity && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border border-purple-500/30 bg-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg">
                Deposit to {selectedOpportunity.protocol}
              </CardTitle>
              <CardDescription>
                Bridge from {SUPPORTED_CHAINS.find(c => c.id === chainId)?.name} to {selectedOpportunity.chain}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="deposit-amount">Amount ({symbol})</Label>
                <Input
                  id="deposit-amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isExecuting || isSuccess}
                  className="text-lg"
                />
              </div>

              {/* Earnings Projection */}
              {amount && parseFloat(amount) > 0 && (
                <div className="rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Estimated Monthly Earnings</p>
                      <p className="text-2xl font-bold text-green-400">
                        +{calculateEarnings(amount, selectedOpportunity.apy)} {symbol}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Based on {selectedOpportunity.apy}% APY
                  </p>
                </div>
              )}

              {/* Bridge & Execute Progress */}
              {isExecuting && executionSteps.length > 0 && (
                <div className="space-y-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 p-4">
                  <div className="flex items-center gap-2 text-blue-900 dark:text-blue-100 mb-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm font-medium">Bridge & Execute in Progress</span>
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
                      <p className="text-sm font-medium">Deposit successful!</p>
                      {executionHash && (
                        <p className="text-xs mt-1 font-mono truncate">
                          Tx: {executionHash.slice(0, 10)}...{executionHash.slice(-8)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 p-4 text-center">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <p className="font-bold text-lg text-purple-900 dark:text-purple-100">
                      Now earning {selectedOpportunity.apy}% APY!
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Your funds are working for you on {selectedOpportunity.chain}
                    </p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {executionError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950 p-3 text-red-900 dark:text-red-100">
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm">
                    Deposit failed: {executionError.message}
                  </span>
                </div>
              )}

              {/* Info Box */}
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-xs text-blue-900 dark:text-blue-100">
                    <p className="font-medium mb-1">How Bridge & Execute Works:</p>
                    <p className="text-blue-700 dark:text-blue-300">
                      Avail Nexus will bridge your {symbol} from {SUPPORTED_CHAINS.find(c => c.id === chainId)?.name} to {selectedOpportunity.chain} and automatically deposit it into {selectedOpportunity.protocol} - all in one transaction!
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSelectedOpportunity(null);
                    setAmount("");
                  }}
                  disabled={isExecuting}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  onClick={handleDeposit}
                  disabled={!amount || isExecuting || isSuccess || !address}
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Depositing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Deposit {amount || "0"} {symbol}
                    </>
                  )}
                </Button>
              </div>

              {/* View Protocol Link */}
              {isSuccess && (
                <div className="text-center">
                  <Button
                    variant="link"
                    className="text-purple-400 hover:text-purple-300"
                    onClick={() => window.open(`https://${selectedOpportunity.chain.toLowerCase()}.etherscan.io`, "_blank")}
                  >
                    View Position on Explorer
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Educational Info */}
      <Card className="border border-white/10 bg-white/5 backdrop-blur-xl">
        <CardContent className="pt-6">
          <h4 className="font-semibold text-white mb-2">Why Optimize Yield While Dating?</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-0.5">•</span>
              <span>Your idle USDC can earn passive income while you wait for dates</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-0.5">•</span>
              <span>Withdraw anytime to stake for date commitments or claim rewards</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-0.5">•</span>
              <span>Avail Nexus ensures you always get the best rate across all chains</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-0.5">•</span>
              <span>Low risk, stable returns with battle-tested DeFi protocols</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
