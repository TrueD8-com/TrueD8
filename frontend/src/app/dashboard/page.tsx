"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Heart,
  Users,
  Calendar,
  Trophy,
  TrendingUp,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { authApi, UserResponse } from "@/lib/api";

export default function DashboardPage() {
  const [userData, setUserData] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await authApi.getMe();
        setUserData(data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const stats = [
    {
      icon: Heart,
      label: "Likes Received",
      value: userData?.metrics?.likesReceived || 0,
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: Users,
      label: "Matches",
      value: userData?.metrics?.matchesCount || 0,
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Calendar,
      label: "Events Attended",
      value: 0,
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Trophy,
      label: "Achievement Score",
      value: "850",
      color: "from-orange-500 to-yellow-500",
    },
  ];

  const quickActions = [
    {
      icon: Sparkles,
      title: "Complete Your Profile",
      description: "Add photos and interests to get better matches",
      href: "/dashboard/profile",
      color: "purple",
      show: !userData?.onboardingCompleted,
      // show: !userData?.name || !userData?.bio,
    },
    {
      icon: Heart,
      title: "Start Matching",
      description: "Discover people who share your interests",
      href: "/dashboard/discover",
      color: "pink",
      show: true,
    },
    {
      icon: Calendar,
      title: "Join Events",
      description: "Meet people at local dating events",
      href: "/dashboard/events",
      color: "blue",
      show: true,
    },
  ].filter((action) => action.show);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 md:pb-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Welcome back{userData?.name ? `, ${userData.name}` : ""}!
          </h1>
          <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
            Online
          </Badge>
        </div>
        <p className="text-gray-400">
          {userData?.onboardingCompleted
            ? // {userData?.name && userData?.bio
              "Your matches are waiting for you"
            : "Complete your profile to start matching"}
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <Card className="border border-white/10 bg-white/5 backdrop-blur-xl p-6 hover:bg-white/10 transition-all">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {quickActions.map((action, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <Link href={action.href}>
                <Card className="border border-white/10 bg-white/5 backdrop-blur-xl p-6 hover:bg-white/10 transition-all h-full group cursor-pointer">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                      action.color === "purple"
                        ? "from-purple-500 to-pink-500"
                        : action.color === "pink"
                        ? "from-pink-500 to-rose-500"
                        : "from-blue-500 to-cyan-500"
                    } flex items-center justify-center mb-4`}
                  >
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    {action.description}
                  </p>
                  <div className="flex items-center text-purple-400 text-sm font-medium group-hover:gap-2 transition-all">
                    Get Started
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:ml-0 transition-all" />
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
          <Link href="/dashboard/activity">
            <Button
              variant="ghost"
              size="sm"
              className="text-purple-400 hover:text-purple-300"
            >
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        <Card className="border border-white/10 bg-white/5 backdrop-blur-xl p-6">
          {!userData?.onboardingCompleted ? (
            // {!userData?.name || !userData?.bio ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-gray-400 mb-4">
                Complete your profile to start seeing activity
              </p>
              <Link href="/dashboard/profile">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                  Complete Profile
                </Button>
              </Link>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No recent activity yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Start matching to see your activity here
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Profile Completion */}
      {(!userData?.name || !userData?.bio) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Complete Your Profile
                </h3>
                <p className="text-gray-400 mb-4">
                  Add your photos, interests, and preferences to get 10x better
                  matches
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[20%] bg-gradient-to-r from-purple-500 to-pink-500" />
                  </div>
                  <span className="text-sm text-gray-400">20%</span>
                </div>
              </div>
              <Link href="/dashboard/profile">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                  Complete Now
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
