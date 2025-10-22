"use client";

import { Card } from "@/components/ui/card";
import { Coins } from "lucide-react";
import CountUp from "react-countup";
import { motion } from "framer-motion";

interface TokenBalanceProps {
  balance: number;
  pending?: number;
  showDetails?: boolean;
}

export function TokenBalance({ balance, pending = 0, showDetails = true }: TokenBalanceProps) {
  return (
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
            <div className="text-sm text-gray-400 mb-1">Total Balance</div>
            <div className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              <CountUp
                end={balance}
                duration={2}
                decimals={0}
                separator=","
              /> PYUSD
            </div>
          </div>
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
                <CountUp end={balance - pending} duration={1.5} /> PYUSD
              </div>
            </div>
          </div>
        )}

        <p className="text-gray-400 text-sm mt-4">
          Complete quests and achievements to earn rewards
        </p>
      </Card>
    </motion.div>
  );
}
