"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, RefreshCw, Send } from "lucide-react";
import CountUp from "react-countup";
import { motion } from "framer-motion";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { useAccount } from "wagmi";
import { useState } from "react";
import { TransferModal } from "@/components/blockchain/TransferModal";

interface TokenBalanceProps {
  balance?: number;
  pending?: number;
  showDetails?: boolean;
  useRealBalance?: boolean;
}

export function TokenBalance({
  balance: propBalance,
  pending = 0,
  showDetails = true,
  useRealBalance = false
}: TokenBalanceProps) {
  const { address } = useAccount();
  const { formattedBalance, symbol, isLoading, refetch } = useTokenBalance();
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // Use real blockchain balance if enabled and wallet connected
  const displayBalance = useRealBalance && address
    ? parseFloat(formattedBalance)
    : (propBalance || 0);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border border-white/10 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/50">
              <Coins className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-400 mb-1">
                {useRealBalance && address ? "Wallet Balance" : "Total Balance"}
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                {isLoading && useRealBalance ? (
                  <span className="animate-pulse">Loading...</span>
                ) : (
                  <>
                    <CountUp
                      end={displayBalance}
                      duration={2}
                      decimals={2}
                      separator=","
                    /> {useRealBalance && address ? symbol : "PYUSD"}
                  </>
                )}
              </div>
            </div>
            {useRealBalance && address && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => refetch()}
                  disabled={isLoading}
                  className="h-10 w-10"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  size="icon"
                  onClick={() => setIsTransferModalOpen(true)}
                  className="h-10 w-10"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {showDetails && (
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div>
                <div className="text-xs text-gray-500">Pending Rewards</div>
                <div className="text-lg font-semibold text-yellow-400">
                  <CountUp end={pending} duration={1.5} /> PYUSD
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Claimed</div>
                <div className="text-lg font-semibold text-green-400">
                  <CountUp end={displayBalance - pending} duration={1.5} /> PYUSD
                </div>
              </div>
            </div>
          )}

          <p className="text-gray-400 text-sm mt-4">
            {useRealBalance && address
              ? "Your on-chain PYUSD balance"
              : "Complete quests and achievements to earn rewards"}
          </p>
        </Card>
      </motion.div>

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
      />
    </>
  );
}
