"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUPPORTED_CHAINS, SUPPORTED_TOKENS } from "@/config/contracts";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { Loader2, Wallet } from "lucide-react";

interface OmnichainPaymentSelectorProps {
  amount: string;
  purpose: "subscription" | "event" | "stake";
  onConfirm: (chainId: number, tokenAddress: `0x${string}`, amount: string) => void;
  disabled?: boolean;
}

export function OmnichainPaymentSelector({
  amount,
  purpose,
  onConfirm,
  disabled,
}: OmnichainPaymentSelectorProps) {
  const { address, isConnected } = useAccount();
  const currentChainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const [selectedChainId, setSelectedChainId] = useState<number>(currentChainId);
  const [selectedTokenSymbol, setSelectedTokenSymbol] = useState<string>("PYUSD");

  const selectedToken = SUPPORTED_TOKENS.find((t) => t.symbol === selectedTokenSymbol);
  const tokenAddress = selectedToken?.addresses[selectedChainId as keyof typeof selectedToken.addresses] as `0x${string}` | undefined;

  // Get balance for the currently connected chain, not the selected chain
  const currentChainTokenAddress = selectedToken?.addresses[currentChainId as keyof typeof selectedToken.addresses] as `0x${string}` | undefined;
  const { formattedBalance, symbol, isLoading } = useTokenBalance(currentChainTokenAddress);

  const handleSwitchChain = async (chainId: number) => {
    if (chainId !== currentChainId) {
      switchChain({ chainId: chainId as 1 | 11155111 | 8453 | 84532 });
    }
  };

  const handleConfirm = () => {
    if (!tokenAddress) return;
    onConfirm(selectedChainId, tokenAddress, amount);
  };

  const getPurposeLabel = () => {
    switch (purpose) {
      case "subscription":
        return "Subscription Payment";
      case "event":
        return "Event Registration";
      case "stake":
        return "Date Commitment Stake";
      default:
        return "Payment";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          {getPurposeLabel()}
        </CardTitle>
        <CardDescription>
          Select your preferred chain and token for payment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Amount Display */}
        <div className="rounded-lg bg-muted p-4">
          <p className="text-sm text-muted-foreground">Payment Amount</p>
          <p className="text-2xl font-bold">{amount} {selectedTokenSymbol}</p>
        </div>

        {/* Chain Selector */}
        <div className="space-y-2">
          <Label>Select Chain</Label>
          <Select
            value={selectedChainId.toString()}
            onValueChange={(value) => setSelectedChainId(Number(value))}
            disabled={disabled || isSwitching}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_CHAINS.map((chain) => (
                <SelectItem key={chain.id} value={chain.id.toString()}>
                  <span className="flex items-center gap-2">
                    <span>{chain.icon}</span>
                    <span>{chain.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Token Selector */}
        <div className="space-y-2">
          <Label>Select Token</Label>
          <Select
            value={selectedTokenSymbol}
            onValueChange={setSelectedTokenSymbol}
            disabled={disabled || isSwitching}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_TOKENS.map((token) => (
                <SelectItem key={token.symbol} value={token.symbol}>
                  <span className="flex items-center gap-2">
                    <span>{token.icon}</span>
                    <span>{token.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Balance Display */}
        {isConnected && (
          <div className="rounded-lg border p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Your Balance</span>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span className="font-semibold">
                  {formattedBalance} {symbol}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Chain Switch Warning */}
        {currentChainId !== selectedChainId && (
          <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950 p-3 text-yellow-900 dark:text-yellow-100">
            <p className="text-sm">
              You need to switch to {SUPPORTED_CHAINS.find((c) => c.id === selectedChainId)?.name}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => handleSwitchChain(selectedChainId)}
              disabled={isSwitching}
            >
              {isSwitching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Switching...
                </>
              ) : (
                "Switch Chain"
              )}
            </Button>
          </div>
        )}

        {/* Confirm Button */}
        <Button
          className="w-full"
          onClick={handleConfirm}
          disabled={
            disabled ||
            !isConnected ||
            !tokenAddress ||
            currentChainId !== selectedChainId ||
            Number(formattedBalance) < Number(amount)
          }
        >
          {!isConnected
            ? "Connect Wallet"
            : currentChainId !== selectedChainId
            ? "Switch Chain First"
            : Number(formattedBalance) < Number(amount)
            ? "Insufficient Balance"
            : `Confirm Payment`}
        </Button>

        {/* Avail Info */}
        <div className="text-xs text-muted-foreground text-center p-2 rounded-lg bg-muted/50">
          Powered by Avail Omnichain - Pay from any supported chain
        </div>
      </CardContent>
    </Card>
  );
}
