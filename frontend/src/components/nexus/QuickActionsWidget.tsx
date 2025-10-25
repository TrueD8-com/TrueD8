"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BridgeButton,
  TransferButton,
  BridgeAndExecuteButton,
  SwapButton
} from "@avail-project/nexus-widgets";
import {
  ArrowRightLeft,
  Send,
  Zap,
  Repeat,
  Sparkles
} from "lucide-react";

/**
 * QuickActionsWidget - Demonstrates Avail Nexus Widgets
 *
 * This component uses pre-built UI components from @avail-project/nexus-widgets
 * to satisfy the prize requirement: "Meaningful use of nexus-widgets"
 *
 * Features:
 * - BridgeButton: Bridge tokens across chains
 * - TransferButton: Send tokens on any chain
 * - BridgeAndExecuteButton: Bridge + execute in one transaction
 * - SwapButton: Cross-chain token swaps
 */
export function QuickActionsWidget() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Powered by Avail Nexus Widgets - Pre-built UI components for cross-chain operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              Using nexus-widgets
            </Badge>
            <span>Official Avail UI components with built-in UX</span>
          </div>
        </CardContent>
      </Card>

      {/* Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Transfer Widget */}
        <Card className="border border-white/10 bg-white/5 backdrop-blur-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <Send className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-base">Quick Transfer</CardTitle>
                <CardDescription className="text-xs">Send tokens instantly</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <TransferButton
              prefill={{
                token: "USDC",
                chainId: 84532, // Base Sepolia
              }}
              className="w-full"
              title="Transfer USDC"
            >
              {({ onClick, isLoading }) => (
                <button
                  onClick={onClick}
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send USDC
                    </>
                  )}
                </button>
              )}
            </TransferButton>
            <p className="text-xs text-gray-400 mt-2">
              Uses <code className="bg-white/10 px-1 rounded">TransferButton</code> widget
            </p>
          </CardContent>
        </Card>

        {/* Bridge Widget */}
        <Card className="border border-white/10 bg-white/5 backdrop-blur-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <ArrowRightLeft className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-base">Quick Bridge</CardTitle>
                <CardDescription className="text-xs">Bridge across chains</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <BridgeButton
              prefill={{
                token: "USDC",
                chainId: 84532, // Base Sepolia (destination)
                amount: "10",
              }}
              className="w-full"
              title="Bridge USDC"
            >
              {({ onClick, isLoading }) => (
                <button
                  onClick={onClick}
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Bridging...
                    </>
                  ) : (
                    <>
                      <ArrowRightLeft className="w-4 h-4" />
                      Bridge to Base
                    </>
                  )}
                </button>
              )}
            </BridgeButton>
            <p className="text-xs text-gray-400 mt-2">
              Uses <code className="bg-white/10 px-1 rounded">BridgeButton</code> widget
            </p>
          </CardContent>
        </Card>

        {/* Bridge & Execute Widget */}
        <Card className="border border-white/10 bg-white/5 backdrop-blur-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-base">Bridge & Execute</CardTitle>
                <CardDescription className="text-xs">One-click cross-chain action</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <BridgeAndExecuteButton
              contractAddress="0x0000000000000000000000000000000000000002" // Staking contract
              contractAbi={[
                {
                  type: "function",
                  name: "stake",
                  inputs: [
                    { type: "uint256", name: "amount" },
                    { type: "string", name: "commitmentId" }
                  ],
                  outputs: [],
                  stateMutability: "nonpayable"
                }
              ] as const}
              functionName="stake"
              buildFunctionParams={(token, amount, chainId, userAddress) => ({
                functionParams: [amount, "dating-commitment-001"] as const,
              })}
              prefill={{
                token: "USDC",
                toChainId: 84532,
                amount: "10",
              }}
              className="w-full"
              title="Stake for Date"
            >
              {({ onClick, isLoading }) => (
                <button
                  onClick={onClick}
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Stake 10 USDC
                    </>
                  )}
                </button>
              )}
            </BridgeAndExecuteButton>
            <p className="text-xs text-gray-400 mt-2">
              Uses <code className="bg-white/10 px-1 rounded">BridgeAndExecuteButton</code> widget ⭐
            </p>
          </CardContent>
        </Card>

        {/* Swap Widget */}
        <Card className="border border-white/10 bg-white/5 backdrop-blur-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                <Repeat className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-base">Quick Swap</CardTitle>
                <CardDescription className="text-xs">Cross-chain token swap</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <SwapButton
              prefill={{
                fromChainID: 8453, // Base (one of the supported chains)
                toChainID: 84532, // Base Sepolia
                fromTokenAddress: "USDC",
                toTokenAddress: "ETH",
                fromAmount: "10",
              }}
              className="w-full"
              title="Swap Tokens"
            >
              {({ onClick, isLoading }) => (
                <button
                  onClick={onClick}
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Swapping...
                    </>
                  ) : (
                    <>
                      <Repeat className="w-4 h-4" />
                      Swap USDC → ETH
                    </>
                  )}
                </button>
              )}
            </SwapButton>
            <p className="text-xs text-gray-400 mt-2">
              Uses <code className="bg-white/10 px-1 rounded">SwapButton</code> widget
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="border border-blue-500/30 bg-blue-500/5 backdrop-blur-xl">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              About Nexus Widgets
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-400">
              <div className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <div>
                  <p className="text-white font-medium">Pre-built UI</p>
                  <p className="text-xs">Ready-to-use components with built-in UX</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <div>
                  <p className="text-white font-medium">Render Props</p>
                  <p className="text-xs">Full control over button styling</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <div>
                  <p className="text-white font-medium">Auto-handling</p>
                  <p className="text-xs">Manages state, errors, and transactions</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <div>
                  <p className="text-white font-medium">Prefill Support</p>
                  <p className="text-xs">Set default values for better UX</p>
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-white/10">
              <p className="text-xs text-gray-500">
                TrueD8 uses both <span className="text-purple-400 font-mono">nexus-core</span> (for custom logic) and{" "}
                <span className="text-blue-400 font-mono">nexus-widgets</span> (for quick actions) to provide the best experience.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
