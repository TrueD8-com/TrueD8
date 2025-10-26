"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAvailExecute } from "@/hooks/useAvailExecute";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Lock,
  Calendar,
  Trophy,
  Coins,
} from "lucide-react";
import { useAccount, useChainId } from "wagmi";
import { ChainId } from "@/config/contracts";
import { useNotification } from "@blockscout/app-sdk";

interface StakingCommitmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateDetails?: {
    matchId: string;
    matchName: string;
    dateTime: Date;
  };
}

import type { SUPPORTED_TOKENS as AVAIL_TOKENS } from "@avail-project/nexus-core";

type TokenType = AVAIL_TOKENS; // "ETH" | "USDC" | "USDT"

const SUPPORTED_STAKE_TOKENS: {
  value: TokenType;
  label: string;
  description: string;
}[] = [
  {
    value: "USDC",
    label: "USDC",
    description: "USD Coin - Most widely accepted",
  },
  {
    value: "USDT",
    label: "USDT",
    description: "Tether USD - Highest liquidity",
  },
];

export function StakingCommitmentModal({
  isOpen,
  onClose,
  dateDetails,
}: StakingCommitmentModalProps) {
  const { address } = useAccount();
  const chainId = useChainId() as ChainId;
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState<TokenType>("USDC");

  const {
    stakeAcrossChains,
    isExecuting,
    executionError,
    executionHash,
    executionSteps,
  } = useAvailExecute();
  const { formattedBalance, refetch } = useTokenBalance();
  const { openTxToast } = useNotification();

  const [isSuccess, setIsSuccess] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);

  const handleStake = async () => {
    if (!amount || !dateDetails) return;

    const amountNum = Number(amount);
    if (amountNum <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      const dateCommitmentId = `${dateDetails.matchId}-${Date.now()}`;

      // Use selected token for staking (all supported by Avail Nexus)
      await stakeAcrossChains(chainId, selectedToken, amount, dateCommitmentId);

      // Show Blockscout transaction notification with real-time status
      if (executionHash) {
        openTxToast(String(chainId), executionHash);
      }

      // Calculate points based on stake amount
      const points = Math.floor(amountNum * 10); // 10 points per token
      setPointsEarned(points);
      setIsSuccess(true);

      // In production, this would call backend API to record the stake
      console.log("Stake recorded:", {
        matchId: dateDetails.matchId,
        amount,
        points,
        dateCommitmentId,
      });
    } catch (error) {
      console.error("Staking failed:", error);
    }
  };

  const handleClose = () => {
    setAmount("");
    setIsSuccess(false);
    setPointsEarned(0);
    onClose();
    if (isSuccess) {
      refetch();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 border border-purple-500/30">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <Lock className="h-5 w-5 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Stake Your Commitment
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-400">
            Lock tokens to prove you&apos;re serious about this date. Both
            parties stake, both win when you show up.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Date Details */}
          {dateDetails && (
            <div className="rounded-xl border border-pink-500/30 bg-gradient-to-r from-pink-500/10 to-purple-500/10 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-pink-400" />
                <span className="font-semibold text-white">
                  {dateDetails.matchName}
                </span>
              </div>
              <p className="text-sm text-gray-300">
                📅 {dateDetails.dateTime.toLocaleDateString()} at{" "}
                {dateDetails.dateTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          )}

          {/* Balance Display */}
          <div className="rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-blue-400" />
                <p className="text-sm text-gray-300">Available Balance</p>
              </div>
              <Select
                value={selectedToken}
                onValueChange={(value) => setSelectedToken(value as TokenType)}
                disabled={isExecuting || isSuccess}
              >
                <SelectTrigger className="w-32 bg-white/5 border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_STAKE_TOKENS.map((token) => (
                    <SelectItem key={token.value} value={token.value}>
                      {token.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-3xl font-bold text-white">
              {formattedBalance}{" "}
              <span className="text-xl text-gray-400">{selectedToken}</span>
            </p>
            <p className="text-xs text-gray-400 mt-2">
              💎 Cross-chain stablecoin staking via Avail Nexus
            </p>
          </div>

          {/* Stake Amount */}
          <div className="space-y-3">
            <Label
              htmlFor="stake-amount"
              className="text-base font-semibold text-white"
            >
              How much do you want to stake?
            </Label>
            <div className="relative">
              <Input
                id="stake-amount"
                type="number"
                step="0.01"
                placeholder="Enter amount..."
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isExecuting || isSuccess}
                className="text-2xl h-16 pr-24 bg-white/5 border-white/20 text-white placeholder:text-gray-500"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300"
                onClick={() =>
                  setAmount((Number(formattedBalance) * 0.1).toFixed(2))
                }
                disabled={isExecuting || isSuccess}
              >
                10%
              </Button>
            </div>
            <div className="flex gap-2">
              {[5, 10, 20, 50].map((percent) => (
                <Button
                  key={percent}
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-white/5 border-white/10 hover:bg-white/10"
                  onClick={() =>
                    setAmount(
                      (Number(formattedBalance) * (percent / 100)).toFixed(2)
                    )
                  }
                  disabled={isExecuting || isSuccess}
                >
                  {percent}%
                </Button>
              ))}
            </div>
            <p className="text-xs text-gray-400">
              💡 Higher stakes show stronger commitment and earn more points
            </p>
          </div>

          {/* Points Preview */}
          {amount && Number(amount) > 0 && (
            <div className="rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/40 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-500/30">
                    <Trophy className="h-6 w-6 text-yellow-300" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-300">
                      You&apos;ll Earn
                    </p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                      +{Math.floor(Number(amount) * 10)} Points
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-yellow-500/20">
                <p className="text-xs text-gray-300">
                  ✨ <strong>Win-win</strong>: Both of you earn points when the
                  date completes successfully!
                </p>
              </div>
            </div>
          )}

          {/* Bridge & Execute Progress Visualization */}
          {isExecuting && executionSteps.length > 0 && (
            <div className="space-y-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 p-4">
              <div className="flex items-center gap-2 text-blue-900 dark:text-blue-100 mb-3">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm font-medium">
                  Bridge & Execute in Progress
                </span>
              </div>
              <div className="space-y-2">
                {executionSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
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

          {/* Transaction Status */}
          {isExecuting && executionSteps.length === 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-950 p-3 text-blue-900 dark:text-blue-100">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Processing stake commitment...</span>
            </div>
          )}

          {isSuccess && (
            <div className="space-y-4">
              {/* Success Header */}
              <div className="text-center space-y-3 py-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="h-9 w-9 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    Stake Locked!
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Your commitment has been recorded on-chain
                  </p>
                </div>
              </div>

              {/* Transaction Hash */}
              {executionHash && (
                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <p className="text-xs text-gray-400 mb-2">Transaction Hash</p>
                  <p className="font-mono text-xs text-blue-400 break-all">
                    {executionHash}
                  </p>
                </div>
              )}

              {/* Points Earned */}
              <div className="rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/40 p-6 text-center">
                <Trophy className="h-12 w-12 mx-auto mb-3 text-yellow-400" />
                <p className="text-4xl font-bold bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent mb-2">
                  +{pointsEarned} Points
                </p>
                <p className="text-sm text-gray-300">
                  Locked and ready to earn when your date succeeds! 🎉
                </p>
              </div>

              {/* Next Steps */}
              <div className="rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 p-4">
                <p className="font-semibold text-white mb-2 text-sm">
                  What&apos;s Next?
                </p>
                <ul className="text-xs text-gray-300 space-y-1.5">
                  <li>📅 Confirm your date details with your match</li>
                  <li>💬 Keep the conversation going until the date</li>
                  <li>✨ Show up and have a great time together</li>
                  <li>🏆 Both confirm afterward to unlock your rewards!</li>
                </ul>
              </div>
            </div>
          )}

          {executionError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950 p-3 text-red-900 dark:text-red-100">
              <XCircle className="h-4 w-4" />
              <span className="text-sm">
                Staking failed: {executionError.message}
              </span>
            </div>
          )}

          {/* Info Box */}
          {!isSuccess && (
            <div className="rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 p-4">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-purple-500/20">
                  <Lock className="h-4 w-4 text-purple-300" />
                </div>
                <div className="text-xs text-gray-300 space-y-2">
                  <p className="font-semibold text-white">How Staking Works:</p>
                  <ul className="space-y-1.5">
                    <li>🔒 Your tokens lock until the date completes</li>
                    <li>
                      ✅ Both show up → Both get stake back + bonus points
                    </li>
                    <li>
                      ❌ Someone ghosts → They forfeit their stake to the other
                      person
                    </li>
                    <li>
                      ⚡ Powered by Avail Nexus cross-chain Bridge & Execute
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            {!isSuccess && (
              <Button
                variant="outline"
                className="flex-1 bg-white/5 border-white/20 hover:bg-white/10"
                onClick={handleClose}
              >
                Cancel
              </Button>
            )}
            {!isSuccess ? (
              <Button
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold h-12"
                onClick={handleStake}
                disabled={
                  !amount || isExecuting || Number(amount) <= 0 || !address
                }
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Staking...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-5 w-5" />
                    Stake {amount || "0"} {selectedToken}
                  </>
                )}
              </Button>
            ) : (
              <Button
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold h-12"
                onClick={handleClose}
              >
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Done
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
