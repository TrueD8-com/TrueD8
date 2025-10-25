"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAvailExecute } from "@/hooks/useAvailExecute";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { Loader2, CheckCircle2, XCircle, Lock, Calendar, Trophy, Coins } from "lucide-react";
import { useAccount, useChainId } from "wagmi";
import { PYUSD_ADDRESSES, ChainId } from "@/config/contracts";
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

const SUPPORTED_STAKE_TOKENS: { value: TokenType; label: string; description: string }[] = [
  { value: "USDC", label: "USDC", description: "USD Coin - Most widely accepted" },
  { value: "USDT", label: "USDT", description: "Tether USD - Highest liquidity" },
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

  const { stakeAcrossChains, isExecuting, executionError, executionHash, executionSteps } = useAvailExecute();
  const { formattedBalance, symbol, decimals, refetch } = useTokenBalance();
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Stake Commitment
          </DialogTitle>
          <DialogDescription>
            Show your commitment to this date by staking tokens
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Date Details */}
          {dateDetails && (
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{dateDetails.matchName}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {dateDetails.dateTime.toLocaleDateString()} at{" "}
                {dateDetails.dateTime.toLocaleTimeString()}
              </p>
            </div>
          )}

          {/* Token Selector */}
          <div className="space-y-2">
            <Label htmlFor="token-select" className="flex items-center gap-2">
              <Coins className="w-4 h-4" />
              Select Token
            </Label>
            <Select
              value={selectedToken}
              onValueChange={(value) => setSelectedToken(value as TokenType)}
              disabled={isExecuting || isSuccess}
            >
              <SelectTrigger id="token-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_STAKE_TOKENS.map((token) => (
                  <SelectItem key={token.value} value={token.value}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{token.label}</span>
                      <span className="text-xs text-gray-500">- {token.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-400">
              Stablecoins supported by Avail Nexus for cross-chain commitments
            </p>
          </div>

          {/* Balance Display */}
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">Available {selectedToken} Balance</p>
            <p className="text-2xl font-bold">
              {formattedBalance} {selectedToken}
            </p>
          </div>

          {/* Stake Amount */}
          <div className="space-y-2">
            <Label htmlFor="stake-amount">Stake Amount</Label>
            <div className="relative">
              <Input
                id="stake-amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isExecuting || isSuccess}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7"
                onClick={() => setAmount((Number(formattedBalance) * 0.1).toFixed(2))}
                disabled={isExecuting || isSuccess}
              >
                10%
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Recommended: 10-20% of your balance for meaningful commitment
            </p>
          </div>

          {/* Points Preview */}
          {amount && Number(amount) > 0 && (
            <div className="rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 p-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium text-sm">Potential Points</p>
                  <p className="text-lg font-bold text-purple-600">
                    +{Math.floor(Number(amount) * 10)} Points
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Complete the date successfully to earn these points!
              </p>
            </div>
          )}

          {/* Bridge & Execute Progress Visualization */}
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

          {/* Transaction Status */}
          {isExecuting && executionSteps.length === 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-950 p-3 text-blue-900 dark:text-blue-100">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Processing stake commitment...</span>
            </div>
          )}

          {isSuccess && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950 p-3 text-green-900 dark:text-green-100">
                <CheckCircle2 className="h-4 w-4" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Stake successful!</p>
                  {executionHash && (
                    <p className="text-xs mt-1 font-mono truncate">
                      Tx: {executionHash.slice(0, 10)}...{executionHash.slice(-8)}
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 p-4 text-center">
                <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                <p className="font-bold text-lg text-yellow-900 dark:text-yellow-100">
                  {pointsEarned} Points Locked!
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Complete your date to unlock and earn these points
                </p>
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
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground">
              How it works: Your staked tokens will be locked until the date is
              completed. If both parties confirm the date happened, you&apos;ll get your
              stake back plus bonus points. No-shows forfeit their stake.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleClose}>
              {isSuccess ? "Close" : "Cancel"}
            </Button>
            {!isSuccess && (
              <Button
                className="flex-1"
                onClick={handleStake}
                disabled={
                  !amount || isExecuting || Number(amount) <= 0 || !address
                }
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Staking...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Stake {amount || "0"} {selectedToken}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
