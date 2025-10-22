"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Star, Users, MessageCircle, Lock } from "lucide-react";
import { motion } from "framer-motion";
import type { Achievement } from "@/lib/api";

interface BadgeCardProps {
  achievement: Achievement;
  index?: number;
}

const iconMap = {
  trophy: Trophy,
  award: Award,
  star: Star,
  users: Users,
  messageCircle: MessageCircle,
};

const rarityColors = {
  common: {
    bg: "from-gray-500 to-gray-600",
    text: "text-gray-300",
    border: "border-gray-500/30",
    glow: "shadow-gray-500/20",
  },
  rare: {
    bg: "from-blue-500 to-blue-600",
    text: "text-blue-300",
    border: "border-blue-500/30",
    glow: "shadow-blue-500/30",
  },
  epic: {
    bg: "from-purple-500 to-purple-600",
    text: "text-purple-300",
    border: "border-purple-500/30",
    glow: "shadow-purple-500/40",
  },
  legendary: {
    bg: "from-yellow-500 to-orange-500",
    text: "text-yellow-300",
    border: "border-yellow-500/30",
    glow: "shadow-yellow-500/50",
  },
};

export function BadgeCard({ achievement, index = 0 }: BadgeCardProps) {
  const Icon = iconMap[achievement.icon as keyof typeof iconMap] || Trophy;
  const rarity = rarityColors[achievement.rarity];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      whileHover={{ scale: achievement.unlocked ? 1.05 : 1.02 }}
    >
      <Card
        className={`border backdrop-blur-xl p-6 transition-all ${
          achievement.unlocked
            ? `border-white/20 bg-gradient-to-br from-white/10 to-white/5 ${rarity.glow} shadow-lg`
            : "border-white/10 bg-white/5 opacity-60"
        }`}
      >
        <div className="flex flex-col items-center text-center gap-4">
          {/* Icon */}
          <div className="relative">
            <div
              className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                achievement.unlocked
                  ? `bg-gradient-to-br ${rarity.bg} shadow-lg ${rarity.glow}`
                  : "bg-white/5"
              }`}
            >
              {achievement.unlocked ? (
                <Icon className="w-8 h-8 text-white" />
              ) : (
                <Lock className="w-8 h-8 text-gray-500" />
              )}
            </div>
            {achievement.unlocked && achievement.unlockedAt && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  strokeWidth="2"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </motion.div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3
              className={`text-lg font-semibold mb-1 ${
                achievement.unlocked ? "text-white" : "text-gray-500"
              }`}
            >
              {achievement.title}
            </h3>
            <p
              className={`text-sm mb-3 ${
                achievement.unlocked ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {achievement.description}
            </p>

            {/* Rarity Badge */}
            <Badge
              variant="outline"
              className={`mb-2 ${rarity.border} ${rarity.text} text-xs capitalize`}
            >
              {achievement.rarity}
            </Badge>

            {/* Reward */}
            <Badge
              className={`${
                achievement.unlocked
                  ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                  : "bg-white/10 text-gray-500 border-white/20"
              }`}
            >
              {achievement.unlocked ? "+" : ""}
              {achievement.reward} PYUSD
            </Badge>
          </div>

          {/* Unlocked Date */}
          {achievement.unlocked && achievement.unlockedAt && (
            <div className="text-xs text-gray-500 mt-2">
              Unlocked on{" "}
              {new Date(achievement.unlockedAt).toLocaleDateString()}
            </div>
          )}

          {!achievement.unlocked && (
            <div className="text-xs text-gray-600 mt-2 font-medium">
              Keep exploring to unlock
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
