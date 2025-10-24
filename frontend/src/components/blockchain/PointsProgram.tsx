"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Target, TrendingUp, Award, Zap } from "lucide-react";
import { MilestoneNFT } from "./MilestoneNFT";

interface PointsData {
  total: number;
  level: number;
  nextLevelPoints: number;
  breakdown: {
    datesCompleted: number;
    stakingRewards: number;
    referrals: number;
    verificationBonus: number;
    streakBonus: number;
  };
  recentActivities: {
    action: string;
    points: number;
    date: Date;
  }[];
  achievements: {
    id: string;
    name: string;
    description: string;
    points: number;
    unlocked: boolean;
  }[];
}

// Mock points data - In production, fetch from backend API
const getMockPointsData = (): PointsData => ({
  total: 1250,
  level: 5,
  nextLevelPoints: 1500,
  breakdown: {
    datesCompleted: 800,
    stakingRewards: 250,
    referrals: 100,
    verificationBonus: 50,
    streakBonus: 50,
  },
  recentActivities: [
    {
      action: "Completed date with Sarah",
      points: 100,
      date: new Date(Date.now() - 86400000),
    },
    {
      action: "5-day streak bonus",
      points: 50,
      date: new Date(Date.now() - 172800000),
    },
    {
      action: "Stake commitment returned",
      points: 50,
      date: new Date(Date.now() - 259200000),
    },
  ],
  achievements: [
    {
      id: "first-date",
      name: "First Date",
      description: "Complete your first date",
      points: 100,
      unlocked: true,
    },
    {
      id: "commitment-keeper",
      name: "Commitment Keeper",
      description: "Complete 10 staked dates",
      points: 500,
      unlocked: true,
    },
    {
      id: "social-butterfly",
      name: "Social Butterfly",
      description: "Match with 50 people",
      points: 200,
      unlocked: false,
    },
    {
      id: "verified-member",
      name: "Verified Member",
      description: "Complete profile verification",
      points: 50,
      unlocked: true,
    },
  ],
});

export function PointsProgram() {
  const [pointsData, setPointsData] = useState<PointsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const loadPoints = async () => {
      setIsLoading(true);
      // In production: const response = await fetch('/api/user/points');
      await new Promise((resolve) => setTimeout(resolve, 500));
      setPointsData(getMockPointsData());
      setIsLoading(false);
    };

    loadPoints();
  }, []);

  if (isLoading || !pointsData) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const progress = (pointsData.total / pointsData.nextLevelPoints) * 100;
  const pointsToNextLevel = pointsData.nextLevelPoints - pointsData.total;

  // Define milestones with Avail Nexus multi-chain minting
  const milestones = [
    {
      id: "first_date",
      name: "First Date Champion",
      description: "Complete your first date",
      pointsRequired: 100,
      icon: "🎯",
      rarity: "common" as const,
      image: "ipfs://...",
      unlocked: pointsData.total >= 100,
      minted: false,
    },
    {
      id: "commitment_keeper",
      name: "Commitment Keeper",
      description: "Complete 10 staked dates",
      pointsRequired: 1000,
      icon: "💎",
      rarity: "rare" as const,
      image: "ipfs://...",
      unlocked: pointsData.total >= 1000,
      minted: false,
    },
    {
      id: "social_butterfly",
      name: "Social Butterfly",
      description: "Match with 50 people",
      pointsRequired: 500,
      icon: "🦋",
      rarity: "rare" as const,
      image: "ipfs://...",
      unlocked: false,
      minted: false,
    },
    {
      id: "dating_legend",
      name: "Dating Legend",
      description: "Reach 10,000 points",
      pointsRequired: 10000,
      icon: "👑",
      rarity: "legendary" as const,
      image: "ipfs://...",
      unlocked: false,
      minted: false,
    },
    {
      id: "early_adopter",
      name: "Early Adopter",
      description: "Join TrueD8 in first month",
      pointsRequired: 50,
      icon: "⚡",
      rarity: "epic" as const,
      image: "ipfs://...",
      unlocked: pointsData.total >= 50,
      minted: false,
    },
    {
      id: "verified_member",
      name: "Verified Member",
      description: "Complete profile verification",
      pointsRequired: 50,
      icon: "✓",
      rarity: "common" as const,
      image: "ipfs://...",
      unlocked: true,
      minted: false,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Main Points Card */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-purple-600" />
            Reputation Points
          </CardTitle>
          <CardDescription>
            Earn points by completing dates and maintaining commitments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-purple-600">
              {pointsData.total.toLocaleString()}
            </span>
            <span className="text-muted-foreground">points</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                Level {pointsData.level}
              </span>
              <span className="text-muted-foreground">
                {pointsToNextLevel} to Level {pointsData.level + 1}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Points Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Points Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(pointsData.breakdown).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </span>
                <Badge variant="secondary">+{value}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pointsData.recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.date.toLocaleDateString()}
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-100">
                  +{activity.points}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievement Milestones with Avail Nexus Multi-Chain Minting */}
      <div className="mt-8">
        <div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
          <div className="flex items-center gap-2 text-purple-300 mb-2">
            <Zap className="w-5 h-5" />
            <h3 className="font-semibold">Powered by Avail Nexus</h3>
          </div>
          <p className="text-sm text-gray-400">
            Mint your achievement NFTs on any supported chain. Choose your preferred blockchain and Avail Nexus handles the cross-chain minting automatically!
          </p>
        </div>

        <MilestoneNFT
          userPoints={pointsData.total}
          milestones={milestones}
          onMilestoneUnlocked={(id) => {
            console.log("Milestone unlocked:", id);
            // In production: refetch points data from backend
          }}
        />
      </div>
    </div>
  );
}
