"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNexus } from "@/providers/nexus-provider";
import { useAvailExecute } from "@/hooks/useAvailExecute";
import { SUPPORTED_CHAINS } from "@/config/contracts";
import {
  DollarSign,
  TrendingUp,
  Layers,
  ArrowDownUp,
  Calendar,
  Filter,
  Download,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";

// Mock payment data - In production, fetch from backend
interface Payment {
  id: string;
  date: Date;
  amount: number;
  token: string;
  chainId: number;
  from: string;
  txHash: string;
  purpose: "event" | "subscription" | "stake";
  status: "completed" | "pending";
}

const MOCK_PAYMENTS: Payment[] = [
  {
    id: "1",
    date: new Date(Date.now() - 86400000),
    amount: 25,
    token: "USDC",
    chainId: 84532,
    from: "0x742d...1F6C",
    txHash: "0xabc123",
    purpose: "event",
    status: "completed",
  },
  {
    id: "2",
    date: new Date(Date.now() - 172800000),
    amount: 10,
    token: "USDT",
    chainId: 80002,
    from: "0x123a...9F2D",
    txHash: "0xdef456",
    purpose: "subscription",
    status: "completed",
  },
  {
    id: "3",
    date: new Date(Date.now() - 259200000),
    amount: 50,
    token: "ETH",
    chainId: 11155111,
    from: "0x9876...4B3C",
    txHash: "0xghi789",
    purpose: "stake",
    status: "completed",
  },
  {
    id: "4",
    date: new Date(Date.now() - 345600000),
    amount: 15,
    token: "USDC",
    chainId: 421614,
    from: "0x456c...7A8B",
    txHash: "0xjkl012",
    purpose: "event",
    status: "completed",
  },
];

export default function BusinessDashboard() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChain, setSelectedChain] = useState<number | "all">("all");
  const [consolidating, setConsolidating] = useState(false);
  const { sdk, isInitialized } = useNexus();
  const { transfer } = useAvailExecute();

  useEffect(() => {
    // Simulate loading payments
    setTimeout(() => {
      setPayments(MOCK_PAYMENTS);
      setLoading(false);
    }, 1000);
  }, []);

  // Calculate statistics
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const revenueByChain = payments.reduce((acc, p) => {
    const chain = SUPPORTED_CHAINS.find(c => c.id === p.chainId);
    const chainName = chain?.name || "Unknown";
    acc[chainName] = (acc[chainName] || 0) + p.amount;
    return acc;
  }, {} as Record<string, number>);

  const revenueByToken = payments.reduce((acc, p) => {
    acc[p.token] = (acc[p.token] || 0) + p.amount;
    return acc;
  }, {} as Record<string, number>);

  // Filter payments
  const filteredPayments = selectedChain === "all"
    ? payments
    : payments.filter(p => p.chainId === selectedChain);

  // Consolidate funds to one chain
  const handleConsolidate = async () => {
    if (!isInitialized) {
      alert("Please connect wallet first");
      return;
    }

    setConsolidating(true);
    try {
      // In production: loop through all chains and consolidate to target chain
      // For demo: just show the concept

      const targetChain = 84532; // Base Sepolia

      // Example: Transfer USDC from Polygon Amoy to Base Sepolia
      await transfer({
        token: "USDC",
        amount: "10",
        chainId: targetChain,
        recipient: "0xYourBusinessWallet", // Your business wallet
      });

      alert("Revenue consolidation initiated! Check transactions.");
    } catch (error) {
      console.error("Consolidation failed:", error);
      alert("Consolidation failed. See console for details.");
    } finally {
      setConsolidating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto pb-20 md:pb-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-16 h-16 animate-spin text-purple-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-20 md:pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            Business Revenue Dashboard
          </h1>
          <p className="text-gray-400">
            Unified view of all payments across {Object.keys(revenueByChain).length} chains
          </p>
          <div className="mt-2 flex items-center gap-2 text-sm text-purple-400">
            <Layers className="w-4 h-4" />
            <span>Powered by Avail Nexus - Omnichain Revenue Unification</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border border-white/10 bg-white/5 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    ${totalRevenue.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-white/10 bg-white/5 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Transactions</p>
                  <p className="text-2xl font-bold text-white mt-1">{payments.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-white/10 bg-white/5 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Chains</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {Object.keys(revenueByChain).length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Layers className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-white/10 bg-white/5 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Avg Transaction</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    ${(totalRevenue / payments.length).toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Breakdown */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border border-white/10 bg-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg">Revenue by Chain</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(revenueByChain).map(([chain, amount]) => (
                  <div key={chain} className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">{chain}</span>
                    <Badge variant="secondary">${amount.toFixed(2)}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-white/10 bg-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg">Revenue by Token</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(revenueByToken).map(([token, amount]) => (
                  <div key={token} className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">{token}</span>
                    <Badge variant="secondary">${amount.toFixed(2)}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Consolidate Button */}
        <Card className="border border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-xl mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">
                  Consolidate Revenue
                </h3>
                <p className="text-sm text-gray-400">
                  Use Avail Nexus to consolidate all revenue to your preferred chain in one click
                </p>
              </div>
              <Button
                onClick={handleConsolidate}
                disabled={consolidating || !isInitialized}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {consolidating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Consolidating...
                  </>
                ) : (
                  <>
                    <ArrowDownUp className="mr-2 h-4 w-4" />
                    Consolidate to Base
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card className="border border-white/10 bg-white/5 backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>All payments received across chains</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Token</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Chain</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">From</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Purpose</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => {
                    const chain = SUPPORTED_CHAINS.find(c => c.id === payment.chainId);
                    return (
                      <tr key={payment.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4 text-sm text-gray-300">
                          {payment.date.toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-white">
                          ${payment.amount}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <Badge variant="outline">{payment.token}</Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-300">
                          {chain?.icon} {chain?.name}
                        </td>
                        <td className="py-3 px-4 text-sm font-mono text-gray-400">
                          {payment.from}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <Badge variant={payment.purpose === "event" ? "default" : "secondary"}>
                            {payment.purpose}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <Badge variant={payment.status === "completed" ? "default" : "secondary"}>
                            {payment.status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
