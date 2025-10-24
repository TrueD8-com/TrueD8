"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNexus } from "@/providers/nexus-provider";
import { SUPPORTED_CHAINS } from "@/config/contracts";
import {
  Search,
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Loader2
} from "lucide-react";

// Mock intent data - In production, fetch from Nexus SDK or backend
interface Intent {
  id: string;
  type: "transfer" | "bridge_execute" | "swap";
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: Date;
  sourceChain: number;
  targetChain: number;
  token: string;
  amount: string;
  sender: string;
  recipient: string;
  txHash?: string;
  steps: {
    name: string;
    status: "pending" | "processing" | "completed" | "failed";
    txHash?: string;
  }[];
}

const MOCK_INTENTS: Intent[] = [
  {
    id: "intent_1",
    type: "bridge_execute",
    status: "completed",
    createdAt: new Date(Date.now() - 3600000),
    sourceChain: 80002,
    targetChain: 84532,
    token: "USDC",
    amount: "10",
    sender: "0x742d...1F6C",
    recipient: "0x0000...0002", // Staking contract
    txHash: "0xabc123",
    steps: [
      { name: "Approve", status: "completed", txHash: "0xabc111" },
      { name: "Bridge", status: "completed", txHash: "0xabc222" },
      { name: "Execute", status: "completed", txHash: "0xabc333" },
    ],
  },
  {
    id: "intent_2",
    type: "transfer",
    status: "completed",
    createdAt: new Date(Date.now() - 7200000),
    sourceChain: 11155111,
    targetChain: 84532,
    token: "USDT",
    amount: "25",
    sender: "0x123a...9F2D",
    recipient: "0x456c...7A8B",
    txHash: "0xdef456",
    steps: [
      { name: "Approve", status: "completed", txHash: "0xdef111" },
      { name: "Bridge", status: "completed", txHash: "0xdef222" },
    ],
  },
  {
    id: "intent_3",
    type: "transfer",
    status: "processing",
    createdAt: new Date(Date.now() - 300000),
    sourceChain: 421614,
    targetChain: 80002,
    token: "ETH",
    amount: "0.5",
    sender: "0x9876...4B3C",
    recipient: "0x111d...2E4F",
    steps: [
      { name: "Approve", status: "completed", txHash: "0xghi111" },
      { name: "Bridge", status: "processing" },
    ],
  },
];

export function IntentExplorer() {
  const [intents, setIntents] = useState<Intent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIntent, setSelectedIntent] = useState<Intent | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { isInitialized } = useNexus();

  useEffect(() => {
    // Simulate loading intents
    setTimeout(() => {
      setIntents(MOCK_INTENTS);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredIntents = intents.filter(intent =>
    intent.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    intent.txHash?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: Intent["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "processing":
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Intent["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-300";
      case "processing":
        return "bg-blue-500/20 text-blue-300";
      case "failed":
        return "bg-red-500/20 text-red-300";
      default:
        return "bg-gray-500/20 text-gray-300";
    }
  };

  const viewDetails = (intent: Intent) => {
    setSelectedIntent(intent);
    setDetailsOpen(true);
  };

  if (loading) {
    return (
      <Card className="border border-white/10 bg-white/5 backdrop-blur-xl">
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border border-white/10 bg-white/5 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Nexus Intent Explorer</CardTitle>
              <CardDescription>Track all cross-chain intents and their status</CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              {intents.length} Intents
            </Badge>
          </div>

          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by intent ID or tx hash..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>

        <CardContent>
          {!isInitialized && (
            <div className="mb-4 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-sm">
              Connect your wallet to see your intents
            </div>
          )}

          <div className="space-y-3">
            {filteredIntents.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No intents found</p>
              </div>
            ) : (
              filteredIntents.map((intent) => {
                const sourceChain = SUPPORTED_CHAINS.find(c => c.id === intent.sourceChain);
                const targetChain = SUPPORTED_CHAINS.find(c => c.id === intent.targetChain);

                return (
                  <div
                    key={intent.id}
                    className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => viewDetails(intent)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(intent.status)}
                        <span className="font-mono text-sm text-gray-300">{intent.id}</span>
                        <Badge variant="outline" className="text-xs">
                          {intent.type}
                        </Badge>
                      </div>
                      <Badge className={getStatusColor(intent.status)}>
                        {intent.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                      <span>{sourceChain?.icon} {sourceChain?.name}</span>
                      <ArrowRight className="w-4 h-4" />
                      <span>{targetChain?.icon} {targetChain?.name}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white font-medium">
                        {intent.amount} {intent.token}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {intent.createdAt.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Intent Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Intent Details</DialogTitle>
          </DialogHeader>

          {selectedIntent && (
            <div className="space-y-4">
              {/* Intent ID & Status */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Intent ID</p>
                  <p className="font-mono text-sm">{selectedIntent.id}</p>
                </div>
                <Badge className={getStatusColor(selectedIntent.status)}>
                  {selectedIntent.status}
                </Badge>
              </div>

              {/* Route */}
              <div>
                <p className="text-xs text-gray-400 mb-2">Route</p>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5">
                  <span>
                    {SUPPORTED_CHAINS.find(c => c.id === selectedIntent.sourceChain)?.icon}{" "}
                    {SUPPORTED_CHAINS.find(c => c.id === selectedIntent.sourceChain)?.name}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                  <span>
                    {SUPPORTED_CHAINS.find(c => c.id === selectedIntent.targetChain)?.icon}{" "}
                    {SUPPORTED_CHAINS.find(c => c.id === selectedIntent.targetChain)?.name}
                  </span>
                </div>
              </div>

              {/* Amount */}
              <div>
                <p className="text-xs text-gray-400">Amount</p>
                <p className="text-lg font-bold">
                  {selectedIntent.amount} {selectedIntent.token}
                </p>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">From</p>
                  <p className="font-mono text-sm">{selectedIntent.sender}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">To</p>
                  <p className="font-mono text-sm">{selectedIntent.recipient}</p>
                </div>
              </div>

              {/* Steps Progress */}
              <div>
                <p className="text-xs text-gray-400 mb-3">Progress</p>
                <div className="space-y-2">
                  {selectedIntent.steps.map((step, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded bg-white/5">
                      <div className="flex items-center gap-2">
                        {step.status === "completed" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                        {step.status === "processing" && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                        {step.status === "pending" && <Clock className="w-4 h-4 text-gray-500" />}
                        {step.status === "failed" && <XCircle className="w-4 h-4 text-red-500" />}
                        <span className="text-sm">{step.name}</span>
                      </div>
                      {step.txHash && (
                        <Button variant="ghost" size="sm" className="h-6 text-xs">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Created At */}
              <div>
                <p className="text-xs text-gray-400">Created At</p>
                <p className="text-sm">{selectedIntent.createdAt.toLocaleString()}</p>
              </div>

              {/* View on Explorer */}
              {selectedIntent.txHash && (
                <Button variant="outline" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Nexus Explorer
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
