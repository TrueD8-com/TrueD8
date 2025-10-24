"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, ExternalLink, Loader2, History, RefreshCw } from "lucide-react";
import { useAccount, useChainId } from "wagmi";

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  status: "success" | "failed" | "pending";
  type: "send" | "receive";
  purpose?: string;
}

// Mock data for demo - In production, integrate with Blockscout API
const getMockTransactions = (address?: string): Transaction[] => {
  if (!address) return [];

  return [
    {
      hash: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890",
      from: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      to: address,
      value: "0.50",
      timestamp: Date.now() - 3600000,
      status: "success",
      type: "receive",
      purpose: "Date completion reward",
    },
    {
      hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      from: address,
      to: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
      value: "5.00",
      timestamp: Date.now() - 7200000,
      status: "success",
      type: "send",
      purpose: "Date commitment stake",
    },
    {
      hash: "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
      from: address,
      to: "0x1234567890123456789012345678901234567890",
      value: "10.00",
      timestamp: Date.now() - 86400000,
      status: "success",
      type: "send",
      purpose: "Event payment",
    },
    {
      hash: "0xdef123456789abcdef123456789abcdef123456789abcdef123456789abcdef12",
      from: "0x9abc123def456789012345678901234567890abc",
      to: address,
      value: "5.00",
      timestamp: Date.now() - 172800000,
      status: "success",
      type: "receive",
      purpose: "Stake returned",
    },
  ];
};

export function CustomTransactionHistory() {
  const { address } = useAccount();
  const chainId = useChainId();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadTransactions = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setTransactions(getMockTransactions(address));
    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setTransactions(getMockTransactions(address));
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadTransactions();
  }, [address]);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return "Just now";
  };

  if (!address) {
    return (
      <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Connect your wallet to view your PYUSD transaction history
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-purple-400" />
            Transaction History
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No transactions found
          </p>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.hash}
                className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className={`p-2 rounded-full ${
                      tx.type === "receive"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {tx.type === "receive" ? (
                      <ArrowDownRight className="h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-white">
                        {tx.type === "receive" ? "Received" : "Sent"}
                      </p>
                      <Badge
                        variant={tx.status === "success" ? "default" : "secondary"}
                        className="h-5"
                      >
                        {tx.status}
                      </Badge>
                    </div>
                    {tx.purpose && (
                      <p className="text-xs text-gray-400 mb-1">{tx.purpose}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {tx.type === "receive" ? "From" : "To"}{" "}
                      {formatAddress(tx.type === "receive" ? tx.from : tx.to)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`font-semibold mb-1 ${
                      tx.type === "receive" ? "text-green-400" : "text-blue-400"
                    }`}
                  >
                    {tx.type === "receive" ? "+" : "-"}
                    {tx.value} PYUSD
                  </p>
                  <div className="flex items-center gap-2 justify-end">
                    <p className="text-xs text-muted-foreground">
                      {formatTime(tx.timestamp)}
                    </p>
                    <a
                      href={`https://basescan.org/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-purple-400 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-xs">
            <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              Chain ID: {chainId}
            </Badge>
            <span className="text-muted-foreground">
              Showing {transactions.length} transactions
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
