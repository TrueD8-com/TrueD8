"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAvailExecute } from "@/hooks/useAvailExecute";
import { useAccount, useChainId } from "wagmi";
import { SUPPORTED_CHAINS } from "@/config/contracts";
import type { SUPPORTED_CHAINS_IDS, SUPPORTED_TOKENS } from "@avail-project/nexus-core";
import {
  Crown,
  Check,
  Loader2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Heart,
  Zap,
  Star,
  Shield,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface PremiumTier {
  id: string;
  name: string;
  price: number; // in USD/PYUSD
  icon: React.ReactNode;
  color: string;
  features: string[];
}

const PREMIUM_TIERS: PremiumTier[] = [
  {
    id: "basic",
    name: "Basic",
    price: 5,
    icon: <Heart className="w-6 h-6" />,
    color: "from-blue-500 to-cyan-500",
    features: [
      "2x daily likes (20 instead of 10)",
      "See who liked you",
      "Undo last swipe",
      "Ad-free experience",
    ],
  },
  {
    id: "gold",
    name: "Gold",
    price: 15,
    icon: <Star className="w-6 h-6" />,
    color: "from-yellow-500 to-orange-500",
    features: [
      "Everything in Basic",
      "Unlimited likes",
      "Priority in match queue",
      "Advanced filters (age, distance, interests)",
      "Read receipts on messages",
      "Profile boost 1x/week",
    ],
  },
  {
    id: "platinum",
    name: "Platinum",
    price: 30,
    icon: <Crown className="w-6 h-6" />,
    color: "from-purple-500 to-pink-500",
    features: [
      "Everything in Gold",
      "Exclusive events access",
      "Profile boost 2x/week",
      "Priority customer support",
      "Concierge dating service",
      "VIP badge on profile",
      "Early access to new features",
    ],
  },
];

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier?: string | null;
}

export function PremiumModal({ isOpen, onClose, currentTier }: PremiumModalProps) {
  const { address } = useAccount();
  const sourceChainId = useChainId();

  const [selectedTier, setSelectedTier] = useState<PremiumTier | null>(null);
  const [paymentChainId, setPaymentChainId] = useState<number>(sourceChainId || 11155111);
  const [paymentToken, setPaymentToken] = useState<SUPPORTED_TOKENS>("USDC");

  const { bridgeAndExecute, isExecuting, executionError, executionHash, executionSteps } = useAvailExecute();
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubscribe = async () => {
    if (!selectedTier || !address) {
      toast.error("Please select a tier");
      return;
    }

    try {
      // Subscription contract address (mock for demo)
      const SUBSCRIPTION_CONTRACT = "0x0000000000000000000000000000000000000004" as `0x${string}`;

      // Use Avail Nexus Bridge & Execute to:
      // 1. Bridge payment token to subscription contract chain
      // 2. Execute subscribe() function with tier ID
      await bridgeAndExecute({
        sourceChainId: paymentChainId as SUPPORTED_CHAINS_IDS,
        targetChainId: 84532 as SUPPORTED_CHAINS_IDS, // Base Sepolia (where subscription contract lives)
        token: paymentToken,
        amount: selectedTier.price.toString(),
        targetContract: SUBSCRIPTION_CONTRACT,
        targetFunction: "subscribe",
        targetArgs: [selectedTier.id, address],
      });

      setIsSuccess(true);

      toast.success(`Subscribed to ${selectedTier.name}!`, {
        description: `Enjoy premium features for 30 days`,
      });

      // In production: Call backend API to update user premium status
      console.log("Premium subscription activated:", {
        tier: selectedTier.id,
        amount: selectedTier.price,
        token: paymentToken,
        chain: paymentChainId,
        txHash: executionHash,
      });

      // Close modal after delay
      setTimeout(() => {
        onClose();
        setSelectedTier(null);
        setIsSuccess(false);
      }, 3000);

    } catch (error) {
      console.error("Subscription failed:", error);
      toast.error("Subscription failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleClose = () => {
    if (!isExecuting) {
      setSelectedTier(null);
      setIsSuccess(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Crown className="h-6 w-6 text-yellow-500" />
            Upgrade to Premium
          </DialogTitle>
          <DialogDescription>
            Choose a plan and pay with any token on any chain using Avail Nexus
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Tier Badge */}
          {currentTier && (
            <div className="rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 p-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-300">
                  Current Plan: <span className="font-bold capitalize">{currentTier}</span>
                </span>
              </div>
            </div>
          )}

          {/* Tier Selection */}
          {!selectedTier ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PREMIUM_TIERS.map((tier) => {
                const isCurrentTier = currentTier === tier.id;
                const isUpgrade = currentTier && PREMIUM_TIERS.findIndex(t => t.id === currentTier) < PREMIUM_TIERS.findIndex(t => t.id === tier.id);

                return (
                  <motion.div
                    key={tier.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all h-full ${
                        isCurrentTier
                          ? "border-purple-500 bg-purple-500/10 opacity-75"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      } backdrop-blur-xl`}
                      onClick={() => !isCurrentTier && setSelectedTier(tier)}
                    >
                      <CardHeader>
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${tier.color} flex items-center justify-center mb-3`}>
                          {tier.icon}
                        </div>
                        <CardTitle className="text-xl">{tier.name}</CardTitle>
                        <div className="flex items-baseline gap-1 mt-2">
                          <span className="text-3xl font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent">
                            ${tier.price}
                          </span>
                          <span className="text-gray-400 text-sm">/month</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          {tier.features.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm">
                              <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-300">{feature}</span>
                            </div>
                          ))}
                        </div>

                        {isCurrentTier && (
                          <Badge className="w-full justify-center bg-purple-500/20 text-purple-300 border-purple-500/30">
                            Current Plan
                          </Badge>
                        )}

                        {!isCurrentTier && (
                          <Button
                            className={`w-full bg-gradient-to-r ${tier.color} hover:opacity-90`}
                            onClick={() => setSelectedTier(tier)}
                          >
                            {isUpgrade ? "Upgrade" : "Select"}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* Payment Configuration */
            <div className="space-y-4">
              {/* Selected Tier Summary */}
              <Card className={`border-white/20 bg-gradient-to-r ${selectedTier.color} bg-opacity-10 backdrop-blur-xl`}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${selectedTier.color} flex items-center justify-center`}>
                        {selectedTier.icon}
                      </div>
                      <div>
                        <p className="font-bold text-white">{selectedTier.name} Plan</p>
                        <p className="text-sm text-gray-400">1 month subscription</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">${selectedTier.price}</p>
                      <p className="text-xs text-gray-400">per month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Options */}
              <Card className="border border-white/10 bg-white/5 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Payment Details</CardTitle>
                  <CardDescription>
                    Pay with any token from any chain using Avail Nexus
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Chain Selector */}
                  <div className="space-y-2">
                    <Label htmlFor="payment-chain">Payment Chain</Label>
                    <Select
                      value={paymentChainId.toString()}
                      onValueChange={(value) => setPaymentChainId(parseInt(value))}
                      disabled={isExecuting || isSuccess}
                    >
                      <SelectTrigger id="payment-chain">
                        <SelectValue placeholder="Select chain" />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORTED_CHAINS.map((chain) => (
                          <SelectItem key={chain.id} value={chain.id.toString()}>
                            {chain.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Token Selector */}
                  <div className="space-y-2">
                    <Label htmlFor="payment-token">Payment Token</Label>
                    <Select
                      value={paymentToken}
                      onValueChange={(value) => setPaymentToken(value as SUPPORTED_TOKENS)}
                      disabled={isExecuting || isSuccess}
                    >
                      <SelectTrigger id="payment-token">
                        <SelectValue placeholder="Select token" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USDC">USDC</SelectItem>
                        <SelectItem value="USDT">USDT</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-400">
                      {selectedTier.price} {paymentToken} = ${selectedTier.price} USD
                    </p>
                  </div>

                  {/* Bridge & Execute Info */}
                  <div className="rounded-lg bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 p-3">
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-purple-600 mt-0.5" />
                      <div className="text-xs text-purple-900 dark:text-purple-100">
                        <p className="font-medium mb-1">Powered by Avail Nexus</p>
                        <p className="text-purple-700 dark:text-purple-300">
                          Your {paymentToken} will be bridged from {SUPPORTED_CHAINS.find(c => c.id === paymentChainId)?.name} to Base Sepolia and automatically processed - all in one transaction!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Steps */}
                  {isExecuting && executionSteps.length > 0 && (
                    <div className="space-y-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 p-4">
                      <div className="flex items-center gap-2 text-blue-900 dark:text-blue-100 mb-3">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm font-medium">Processing Subscription...</span>
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
                          <p className="text-sm font-medium">Subscription activated!</p>
                          {executionHash && (
                            <p className="text-xs mt-1 font-mono truncate">
                              Tx: {executionHash.slice(0, 10)}...{executionHash.slice(-8)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className={`rounded-lg bg-gradient-to-r ${selectedTier.color} bg-opacity-10 p-4 text-center`}>
                        <Crown className="h-10 w-10 mx-auto mb-2 text-yellow-500" />
                        <p className="font-bold text-lg text-white">
                          Welcome to {selectedTier.name}!
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Premium features are now active
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Error State */}
                  {executionError && (
                    <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950 p-3 text-red-900 dark:text-red-100">
                      <XCircle className="h-4 w-4" />
                      <span className="text-sm">
                        Subscription failed: {executionError.message}
                      </span>
                    </div>
                  )}

                  {/* Benefits Reminder */}
                  {!isSuccess && (
                    <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/50 border border-yellow-200 dark:border-yellow-800 p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <div className="text-xs text-yellow-900 dark:text-yellow-100">
                          <p className="font-medium mb-1">What you'll get:</p>
                          <ul className="text-yellow-700 dark:text-yellow-300 space-y-1">
                            {selectedTier.features.slice(0, 3).map((feature, idx) => (
                              <li key={idx}>• {feature}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        if (isSuccess) {
                          handleClose();
                        } else {
                          setSelectedTier(null);
                        }
                      }}
                      disabled={isExecuting}
                    >
                      {isSuccess ? "Close" : "Back"}
                    </Button>
                    {!isSuccess && (
                      <Button
                        className={`flex-1 bg-gradient-to-r ${selectedTier.color} hover:opacity-90`}
                        onClick={handleSubscribe}
                        disabled={isExecuting || !address}
                      >
                        {isExecuting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Zap className="mr-2 h-4 w-4" />
                            Subscribe for ${selectedTier.price}/mo
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Trust Badges */}
          {!selectedTier && (
            <div className="flex items-center justify-center gap-6 text-xs text-gray-400 pt-4">
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Cross-Chain</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span>Instant Activation</span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Add missing imports for Card components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
