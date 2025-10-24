"use client";

import { useState, useEffect } from "react";
import { TokenBalance } from "@/components/rewards/TokenBalance";
import { QuestCard } from "@/components/rewards/QuestCard";
import { BadgeCard } from "@/components/rewards/BadgeCard";
import { CustomTransactionHistory, PointsProgram } from "@/components/blockchain";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { rewardsApi, type Quest, type Achievement, type RewardsBalance } from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";

export default function RewardsPage() {
  const { address } = useAccount();
  const [balance, setBalance] = useState<RewardsBalance | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [claimingQuestId, setClaimingQuestId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"rewards" | "blockchain" | "points">("rewards");

  useEffect(() => {
    loadRewardsData();
  }, []);

  const loadRewardsData = async () => {
    try {
      const [balanceData, questsData, achievementsData] = await Promise.all([
        rewardsApi.getBalance(),
        rewardsApi.getQuests(),
        rewardsApi.getAchievements(),
      ]);
      setBalance(balanceData);
      setQuests(questsData);
      setAchievements(achievementsData);
    } catch (error) {
      console.error("Failed to load rewards data:", error);
      toast.error("Failed to load rewards data");
    }
  };

  const handleClaimQuest = async (questId: string) => {
    try {
      setClaimingQuestId(questId);
      setIsLoading(true);

      const result = await rewardsApi.claimQuest(questId);

      if (result.success && result.data) {
        toast.success(`Claimed ${result.data.amount} PYUSD!`, {
          description: `New balance: ${result.data.newBalance} PYUSD`,
        });

        // Update local state
        setQuests((prev) =>
          prev.map((q) =>
            q._id === questId ? { ...q, isClaimed: true } : q
          )
        );

        if (balance) {
          setBalance({
            ...balance,
            total: result.data.newBalance,
            claimed: balance.claimed + result.data.amount,
            pending: balance.pending - result.data.amount,
          });
        }
      }
    } catch (error) {
      console.error("Failed to claim quest:", error);
      toast.error("Failed to claim reward");
    } finally {
      setIsLoading(false);
      setClaimingQuestId(null);
    }
  };

  const dailyQuests = quests.filter((q) => q.type === "daily");
  const achievementQuests = quests.filter((q) => q.type === "achievement");

  return (
    <div className="max-w-6xl mx-auto pb-20 md:pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Rewards & Blockchain</h1>
        <p className="text-gray-400">
          Earn PYUSD tokens by completing quests and manage your on-chain assets
        </p>
      </motion.div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "rewards" | "blockchain" | "points")} className="mb-8">
        <TabsList className="bg-white/5 border border-white/10 mb-6">
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
          <TabsTrigger value="points">Points & Achievements</TabsTrigger>
        </TabsList>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-8">
          {/* Token Balance */}
          {balance && (
            <TokenBalance
              balance={balance.total}
              pending={balance.pending}
              showDetails
              useRealBalance={false}
            />
          )}

          {/* Quests Section */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              Daily Quests
              <span className="text-sm font-normal text-gray-400">
                ({dailyQuests.filter((q) => q.isCompleted && !q.isClaimed).length} ready to claim)
              </span>
            </h2>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="bg-white/5 border border-white/10 mb-6">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {dailyQuests.map((quest, i) => (
                  <motion.div
                    key={quest._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <QuestCard
                      quest={quest}
                      onClaim={handleClaimQuest}
                      isLoading={isLoading && claimingQuestId === quest._id}
                    />
                  </motion.div>
                ))}
                {achievementQuests.map((quest, i) => (
                  <motion.div
                    key={quest._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (dailyQuests.length + i) * 0.1 }}
                  >
                    <QuestCard
                      quest={quest}
                      onClaim={handleClaimQuest}
                      isLoading={isLoading && claimingQuestId === quest._id}
                    />
                  </motion.div>
                ))}
              </TabsContent>

              <TabsContent value="active" className="space-y-4">
                {[...dailyQuests, ...achievementQuests]
                  .filter((q) => !q.isCompleted)
                  .map((quest, i) => (
                    <motion.div
                      key={quest._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <QuestCard
                        quest={quest}
                        onClaim={handleClaimQuest}
                        isLoading={isLoading && claimingQuestId === quest._id}
                      />
                    </motion.div>
                  ))}
              </TabsContent>

              <TabsContent value="completed" className="space-y-4">
                {[...dailyQuests, ...achievementQuests]
                  .filter((q) => q.isCompleted)
                  .map((quest, i) => (
                    <motion.div
                      key={quest._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <QuestCard
                        quest={quest}
                        onClaim={handleClaimQuest}
                        isLoading={isLoading && claimingQuestId === quest._id}
                      />
                    </motion.div>
                  ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Achievements Section */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              Achievements
              <span className="text-sm font-normal text-gray-400">
                ({achievements.filter((a) => a.unlocked).length}/{achievements.length} unlocked)
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement, i) => (
                <BadgeCard key={achievement._id} achievement={achievement} index={i} />
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Blockchain Tab */}
        <TabsContent value="blockchain" className="space-y-6">
          <TokenBalance useRealBalance={true} showDetails={true} />
          <CustomTransactionHistory />
        </TabsContent>

        {/* Points & Achievements Tab */}
        <TabsContent value="points">
          <PointsProgram />
        </TabsContent>
      </Tabs>
    </div>
  );
}
