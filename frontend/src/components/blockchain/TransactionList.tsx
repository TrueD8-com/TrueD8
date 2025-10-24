"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, ExternalLink, Loader2 } from "lucide-react";
import { useAccount } from "wagmi";

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  status: "success" | "failed" | "pending";
  type: "send" | "receive";
}

// Mock transaction data - In production, this would fetch from Blockscout/Explorer API
const getMockTransactions = (address?: string): Transaction[] => {
  if (!address) return [];

  return [
    {
      hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      from: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      to: address,
      value: "100.00",
      timestamp: Date.now() - 3600000,
      status: "success",
      type: "receive",
    },
    {
      hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      from: address,
      to: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
      value: "50.00",
      timestamp: Date.now() - 7200000,
      status: "success",
      type: "send",
    },
    {
      hash: "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
      from: address,
      to: "0x1234567890123456789012345678901234567890",
      value: "25.50",
      timestamp: Date.now() - 86400000,
      status: "pending",
      type: "send",
    },
  ];
};

export function TransactionList() {
  const { address } = useAccount();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const loadTransactions = async () => {
      setIsLoading(true);
      // In production, fetch from Blockscout API:
      // const response = await fetch(`https://blockscout.com/api/v1/addresses/${address}/transactions`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setTransactions(getMockTransactions(address));
      setIsLoading(false);
    };

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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Connect your wallet to view transactions
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No transactions found
            </p>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.hash}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    tx.type === "receive"
                      ? "bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400"
                      : "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                  }`}>
                    {tx.type === "receive" ? (
                      <ArrowDownRight className="h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {tx.type === "receive" ? "Received" : "Sent"}
                      </p>
                      <Badge
                        variant={
                          tx.status === "success"
                            ? "default"
                            : tx.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                        className="h-5"
                      >
                        {tx.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {tx.type === "receive" ? "From" : "To"}{" "}
                      {formatAddress(tx.type === "receive" ? tx.from : tx.to)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`font-semibold ${
                    tx.type === "receive" ? "text-green-600" : "text-blue-600"
                  }`}>
                    {tx.type === "receive" ? "+" : "-"}{tx.value} PYUSD
                  </p>
                  <div className="flex items-center gap-1 justify-end">
                    <p className="text-xs text-muted-foreground">
                      {formatTime(tx.timestamp)}
                    </p>
                    <a
                      href={`https://basescan.org/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
