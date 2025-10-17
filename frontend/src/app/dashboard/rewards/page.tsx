"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Coins, Award, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function RewardsPage() {
  const achievements = [
    {
      icon: Trophy,
      title: "First Match",
      description: "Get your first match",
      reward: "+100 PYUSD",
      unlocked: false,
    },
    {
      icon: Award,
      title: "Profile Complete",
      description: "Complete your profile 100%",
      reward: "+50 PYUSD",
      unlocked: false,
    },
    {
      icon: Star,
      title: "Event Attendee",
      description: "Attend your first event",
      reward: "+150 PYUSD",
      unlocked: false,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-20 md:pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Rewards</h1>
        <p className="text-gray-400">
          Earn PYUSD tokens and unlock achievements
        </p>
      </div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Card className="border border-white/10 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
              <Coins className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Total Balance</div>
              <div className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                0 PYUSD
              </div>
            </div>
          </div>
          <p className="text-gray-400">
            Complete achievements and engage with the platform to earn rewards
          </p>
        </Card>
      </motion.div>

      {/* Achievements */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Achievements</h2>
        <div className="space-y-4">
          {achievements.map((achievement, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                      achievement.unlocked
                        ? "bg-gradient-to-br from-yellow-500 to-orange-500"
                        : "bg-white/5"
                    }`}
                  >
                    <achievement.icon
                      className={`w-7 h-7 ${
                        achievement.unlocked ? "text-white" : "text-gray-500"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {achievement.description}
                    </p>
                  </div>
                  <Badge
                    className={
                      achievement.unlocked
                        ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                        : "bg-white/10 text-gray-400 border-white/20"
                    }
                  >
                    {achievement.reward}
                  </Badge>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
