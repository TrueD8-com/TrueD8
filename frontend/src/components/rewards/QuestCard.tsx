"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, Heart, User, MessageCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import type { Quest } from "@/lib/api";

interface QuestCardProps {
  quest: Quest;
  onClaim?: (questId: string) => void;
  isLoading?: boolean;
}

const iconMap = {
  calendar: Calendar,
  heart: Heart,
  user: User,
  message: MessageCircle,
};

export function QuestCard({ quest, onClaim, isLoading = false }: QuestCardProps) {
  const Icon = iconMap[quest.icon as keyof typeof iconMap] || Calendar;
  const isDaily = quest.type === "daily";
  const timeRemaining = quest.expiresAt
    ? Math.max(0, new Date(quest.expiresAt).getTime() - Date.now())
    : 0;
  const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border border-white/10 bg-white/5 backdrop-blur-xl p-6 hover:bg-white/10 transition-all">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
              quest.isCompleted
                ? "bg-gradient-to-br from-green-500 to-emerald-500"
                : "bg-gradient-to-br from-purple-500 to-pink-500"
            }`}
          >
            <Icon className="w-7 h-7 text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">
                  {quest.title}
                </h3>
                <p className="text-sm text-gray-400">{quest.description}</p>
              </div>
              <Badge
                variant="secondary"
                className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 flex-shrink-0"
              >
                +{quest.reward} PYUSD
              </Badge>
            </div>

            {/* Progress */}
            <div className="mt-4 mb-3">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-400">
                  Progress: {quest.current}/{quest.target}
                </span>
                <span className="text-white font-medium">{quest.progress}%</span>
              </div>
              <Progress value={quest.progress} className="h-2" />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-3">
                {isDaily && hoursRemaining > 0 && (
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{hoursRemaining}h left</span>
                  </div>
                )}
                <Badge
                  variant="outline"
                  className="text-xs border-white/20 text-gray-400"
                >
                  {quest.type === "daily"
                    ? "Daily"
                    : quest.type === "weekly"
                    ? "Weekly"
                    : "Achievement"}
                </Badge>
              </div>

              {quest.isCompleted && !quest.isClaimed && (
                <Button
                  onClick={() => onClaim?.(quest._id)}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold"
                >
                  {isLoading ? "Claiming..." : "Claim"}
                </Button>
              )}

              {quest.isClaimed && (
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                  Claimed
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
