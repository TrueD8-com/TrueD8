"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Heart,
  Lock,
  CheckCircle2,
  Trophy,
  Sparkles,
  Coins,
  Shield,
  Zap,
  ArrowRight,
  BookOpen,
  Award
} from "lucide-react";
import { toast } from "sonner";

interface GamificationTask {
  id: string;
  title: string;
  description: string;
  category: "beginner" | "intermediate" | "advanced";
  reward: number;
  xp: number;
  icon: React.ReactNode;
  isCompleted: boolean;
  isLocked: boolean;
  estimatedTime: string;
  learningPoints: string[];
  datingContext: string;
}

const mockTasks: GamificationTask[] = [
  {
    id: "1",
    title: "Your First Cross-Chain Date Stake",
    description: "Learn how to commit tokens for a date using cross-chain technology",
    category: "beginner",
    reward: 10,
    xp: 50,
    icon: <Heart className="w-5 h-5" />,
    isCompleted: false,
    isLocked: false,
    estimatedTime: "5 min",
    learningPoints: [
      "Understand token staking basics",
      "Learn about commitment mechanisms",
      "Explore cross-chain bridges"
    ],
    datingContext: "When you stake PYUSD for a date, you're making a trustless commitment. If both parties show up, you both get your stake back plus rewards!"
  },
  {
    id: "2",
    title: "Bridge Tokens Like Bridging Hearts",
    description: "Master cross-chain token bridging to date across different blockchains",
    category: "beginner",
    reward: 15,
    xp: 75,
    icon: <Zap className="w-5 h-5" />,
    isCompleted: false,
    isLocked: false,
    estimatedTime: "7 min",
    learningPoints: [
      "How cross-chain bridges work",
      "Gas fees and transaction costs",
      "Security best practices"
    ],
    datingContext: "Just like connecting with matches across cities, bridge your tokens across chains to date with anyone, anywhere!"
  },
  {
    id: "3",
    title: "Smart Contract Dating: Understanding Commitments",
    description: "Learn how smart contracts enforce date commitments automatically",
    category: "intermediate",
    reward: 25,
    xp: 125,
    icon: <Shield className="w-5 h-5" />,
    isCompleted: false,
    isLocked: false,
    estimatedTime: "10 min",
    learningPoints: [
      "Smart contract basics",
      "Trustless agreements",
      "Automated enforcement"
    ],
    datingContext: "No more flaky dates! Smart contracts automatically handle refunds if someone doesn't show up, and reward genuine connections."
  },
  {
    id: "4",
    title: "Multi-Chain Romance: Advanced Strategies",
    description: "Execute complex cross-chain operations for premium dating experiences",
    category: "intermediate",
    reward: 30,
    xp: 150,
    icon: <Sparkles className="w-5 h-5" />,
    isCompleted: false,
    isLocked: true,
    estimatedTime: "12 min",
    learningPoints: [
      "Multi-step transactions",
      "Intent-based execution",
      "Cost optimization"
    ],
    datingContext: "Plan luxury dates with multi-chain coordination: stake on Base, bridge from Optimism, and earn rewards on Polygon!"
  },
  {
    id: "5",
    title: "PYUSD Dating Economy Masterclass",
    description: "Become an expert in the TrueD8 tokenomics and reward system",
    category: "advanced",
    reward: 50,
    xp: 250,
    icon: <Trophy className="w-5 h-5" />,
    isCompleted: false,
    isLocked: true,
    estimatedTime: "15 min",
    learningPoints: [
      "Token economics",
      "Reward distribution",
      "Value creation in dating"
    ],
    datingContext: "Master the art of earning while dating. Learn how successful dates create value for the entire community."
  },
  {
    id: "6",
    title: "Blockchain Safety for Modern Dating",
    description: "Advanced security practices for protecting your assets and identity",
    category: "advanced",
    reward: 40,
    xp: 200,
    icon: <Award className="w-5 h-5" />,
    isCompleted: false,
    isLocked: true,
    estimatedTime: "10 min",
    learningPoints: [
      "Wallet security",
      "Privacy protection",
      "Scam prevention"
    ],
    datingContext: "Stay safe while dating on-chain. Learn to protect your crypto assets and personal information."
  }
];

export function BlockchainGamification() {
  const [tasks, setTasks] = useState<GamificationTask[]>(mockTasks);
  const [selectedTask, setSelectedTask] = useState<GamificationTask | null>(null);
  const [totalXP, setTotalXP] = useState(0);
  const [totalRewards, setTotalRewards] = useState(0);

  const completedTasks = tasks.filter(t => t.isCompleted).length;
  const progressPercentage = (completedTasks / tasks.length) * 100;

  const handleStartTask = (task: GamificationTask) => {
    if (task.isLocked) {
      toast.error("Task Locked", {
        description: `Complete ${task.category === "intermediate" ? "beginner" : "intermediate"} tasks first!`
      });
      return;
    }
    setSelectedTask(task);
  };

  const handleCompleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Mark task as completed
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, isCompleted: true } : t
    ));

    // Unlock next tasks
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex < tasks.length - 1) {
      setTasks(prev => prev.map((t, idx) =>
        idx === taskIndex + 1 ? { ...t, isLocked: false } : t
      ));
    }

    // Update totals
    setTotalXP(prev => prev + task.xp);
    setTotalRewards(prev => prev + task.reward);

    toast.success("Task Completed!", {
      description: `+${task.reward} PYUSD | +${task.xp} XP earned!`
    });

    setSelectedTask(null);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "beginner": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "intermediate": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "advanced": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-purple-400" />
                Blockchain Dating Academy
              </CardTitle>
              <CardDescription className="mt-2">
                Learn blockchain fundamentals through dating scenarios and earn rewards
              </CardDescription>
            </div>
            <div className="text-right space-y-1">
              <div className="flex items-center gap-2 justify-end">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="text-2xl font-bold text-white">{totalRewards}</span>
                <span className="text-gray-400 text-sm">PYUSD</span>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-xl font-semibold text-white">{totalXP}</span>
                <span className="text-gray-400 text-sm">XP</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Progress</span>
              <span className="text-white font-semibold">{completedTasks}/{tasks.length} Tasks</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`border backdrop-blur-xl transition-all hover:scale-[1.02] ${
              task.isCompleted
                ? "border-green-500/30 bg-green-500/5"
                : task.isLocked
                ? "border-white/10 bg-white/5 opacity-60"
                : "border-white/20 bg-white/5 hover:border-purple-500/50"
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      task.isCompleted
                        ? "bg-green-500/20"
                        : task.isLocked
                        ? "bg-gray-500/20"
                        : "bg-gradient-to-br from-purple-500/20 to-pink-500/20"
                    }`}>
                      {task.isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      ) : task.isLocked ? (
                        <Lock className="w-5 h-5 text-gray-400" />
                      ) : (
                        task.icon
                      )}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base text-white">{task.title}</CardTitle>
                      <CardDescription className="text-xs mt-1">{task.description}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={getCategoryColor(task.category)}>
                    {task.category}
                  </Badge>
                  <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                    +{task.reward} PYUSD
                  </Badge>
                  <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    +{task.xp} XP
                  </Badge>
                  <Badge variant="outline" className="bg-white/5 text-gray-400 border-white/10">
                    {task.estimatedTime}
                  </Badge>
                </div>

                <Button
                  onClick={() => handleStartTask(task)}
                  disabled={task.isCompleted || task.isLocked}
                  className={`w-full ${
                    task.isCompleted
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  }`}
                >
                  {task.isCompleted ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Completed
                    </>
                  ) : task.isLocked ? (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Locked
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-4 h-4 mr-2" />
                      Start Learning
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedTask(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl"
            >
              <Card className="border border-purple-500/30 bg-gradient-to-br from-purple-900/90 to-pink-900/90 backdrop-blur-xl">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                      {selectedTask.icon}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl text-white">{selectedTask.title}</CardTitle>
                      <CardDescription className="mt-2">{selectedTask.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Dating Context */}
                  <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-pink-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-white mb-1">Dating Context</h4>
                        <p className="text-sm text-gray-300">{selectedTask.datingContext}</p>
                      </div>
                    </div>
                  </div>

                  {/* Learning Points */}
                  <div>
                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-purple-400" />
                      What You&apos;ll Learn
                    </h4>
                    <ul className="space-y-2">
                      {selectedTask.learningPoints.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                          <ArrowRight className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Rewards */}
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Rewards</h4>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Coins className="w-5 h-5 text-yellow-400" />
                        <span className="text-lg font-bold text-white">+{selectedTask.reward} PYUSD</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-blue-400" />
                        <span className="text-lg font-bold text-white">+{selectedTask.xp} XP</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setSelectedTask(null)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleCompleteTask(selectedTask.id)}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Complete Task
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
