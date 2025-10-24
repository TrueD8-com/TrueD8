"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTransactionPopup } from "@blockscout/app-sdk";
import { useAccount, useChainId } from "wagmi";
import { History, ExternalLink, AlertCircle } from "lucide-react";

export function BlockscoutTransactionList() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { openPopup } = useTransactionPopup();

  const handleViewTransactions = () => {
    if (!address) return;

    openPopup({
      chainId: chainId.toString(),
      address: address,
    });
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
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-purple-400" />
          My Transaction History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-purple-500/10 border border-purple-500/30 p-3">
          <p className="text-sm text-gray-300 mb-2">
            View all your PYUSD transactions including:
          </p>
          <ul className="text-xs text-gray-400 space-y-1 ml-4">
            <li>• Date commitment stakes</li>
            <li>• Event payments</li>
            <li>• Transfers to other users</li>
            <li>• Rewards received</li>
          </ul>
        </div>

        <Button
          onClick={handleViewTransactions}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          size="lg"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          View My Transaction History
        </Button>

        <div className="flex items-start gap-2 rounded-lg bg-blue-500/10 border border-blue-500/30 p-3">
          <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-gray-400">
            <p className="font-medium text-blue-300 mb-1">Note about popup theme</p>
            <p>
              The Blockscout popup opens in a light theme (SDK default). This shows your
              real on-chain transactions with detailed information and direct links to the explorer.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
            Powered by Blockscout SDK
          </Badge>
          <span className="text-muted-foreground">Chain ID: {chainId}</span>
        </div>
      </CardContent>
    </Card>
  );
}
