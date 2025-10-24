"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTokenTransfer } from "@/hooks/useTokenTransfer";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { Loader2, CheckCircle2, XCircle, Send } from "lucide-react";
import { isAddress } from "viem";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenAddress?: `0x${string}`;
}

export function TransferModal({ isOpen, onClose, tokenAddress }: TransferModalProps) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const { transfer, isPending, isConfirmed, isError, hash } = useTokenTransfer(tokenAddress);
  const { formattedBalance, symbol, decimals, refetch } = useTokenBalance(tokenAddress);

  const handleTransfer = async () => {
    if (!recipient || !amount) return;

    if (!isAddress(recipient)) {
      alert("Invalid recipient address");
      return;
    }

    try {
      await transfer(recipient as `0x${string}`, amount, decimals);
    } catch (error) {
      console.error("Transfer failed:", error);
    }
  };

  const handleClose = () => {
    setRecipient("");
    setAmount("");
    onClose();
    if (isConfirmed) {
      refetch();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send {symbol}
          </DialogTitle>
          <DialogDescription>
            Transfer tokens to another wallet address
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Balance Display */}
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">Available Balance</p>
            <p className="text-2xl font-bold">{formattedBalance} {symbol}</p>
          </div>

          {/* Recipient Address */}
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              disabled={isPending || isConfirmed}
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isPending || isConfirmed}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7"
                onClick={() => setAmount(formattedBalance)}
                disabled={isPending || isConfirmed}
              >
                Max
              </Button>
            </div>
          </div>

          {/* Transaction Status */}
          {isPending && (
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-950 p-3 text-blue-900 dark:text-blue-100">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Transaction pending...</span>
            </div>
          )}

          {isConfirmed && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950 p-3 text-green-900 dark:text-green-100">
              <CheckCircle2 className="h-4 w-4" />
              <div className="flex-1">
                <p className="text-sm font-medium">Transfer successful!</p>
                {hash && (
                  <p className="text-xs mt-1 font-mono truncate">
                    Tx: {hash.slice(0, 10)}...{hash.slice(-8)}
                  </p>
                )}
              </div>
            </div>
          )}

          {isError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950 p-3 text-red-900 dark:text-red-100">
              <XCircle className="h-4 w-4" />
              <span className="text-sm">Transaction failed. Please try again.</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleClose}
            >
              {isConfirmed ? "Close" : "Cancel"}
            </Button>
            {!isConfirmed && (
              <Button
                className="flex-1"
                onClick={handleTransfer}
                disabled={!recipient || !amount || isPending || Number(amount) <= 0}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send"
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
