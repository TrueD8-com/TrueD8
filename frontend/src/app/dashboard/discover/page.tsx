"use client";

import { useState, useEffect } from "react";
import { datingApi, UserProfile } from "@/lib/api";
import { ProfileCard } from "@/components/discover/ProfileCard";
import { MatchModal } from "@/components/discover/MatchModal";
import { Button } from "@/components/ui/button";
import { Heart, X, Star, RotateCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [matchedProfile, setMatchedProfile] = useState<UserProfile | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setIsLoading(true);
      const data = await datingApi.discover({ limit: 30, skip: 0 });
      setProfiles(data);
    } catch (error) {
      console.error("Failed to load profiles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    const profile = profiles[currentIndex];
    if (!profile) return;

    try {
      const result = await datingApi.likeUser(profile._id);
      if (result.matchId) {
        setMatchedProfile(profile);
        setShowMatchModal(true);
      }
      setCurrentIndex((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to like user:", error);
    }
  };

  const handlePass = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  const handleSuperLike = async () => {
    const profile = profiles[currentIndex];
    if (!profile) return;

    try {
      await datingApi.superlikeUser(profile._id);
      setCurrentIndex((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to superlike user:", error);
    }
  };

  const handleSwipe = async (direction: "left" | "right" | "up") => {
    if (direction === "right") {
      await handleLike();
    } else if (direction === "up") {
      await handleSuperLike();
    } else {
      handlePass();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-400">Finding matches for you...</p>
        </div>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];

  if (!currentProfile) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            No More Profiles
          </h2>
          <p className="text-gray-400 mb-6">
            You&apos;ve seen all available profiles. Check back later for new matches!
          </p>
          <Button
            onClick={loadProfiles}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            <RotateCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 md:pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Discover
        </h1>
        <p className="text-gray-400">
          {profiles.length - currentIndex} profiles available
        </p>
      </motion.div>

      <div className="max-w-2xl mx-auto">
        {/* Card Stack */}
        <div className="relative h-[600px] mb-8">
          <AnimatePresence>
            {profiles.slice(currentIndex, currentIndex + 3).map((profile, i) => (
              <div
                key={profile._id}
                className="absolute inset-0"
                style={{
                  zIndex: 3 - i,
                  transform: `scale(${1 - i * 0.05}) translateY(${i * 20}px)`,
                  opacity: 1 - i * 0.3,
                }}
              >
                {i === 0 && (
                  <ProfileCard profile={profile} onSwipe={handleSwipe} />
                )}
                {i > 0 && (
                  <div className="h-full w-full rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl" />
                )}
              </div>
            ))}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-6">
          <Button
            onClick={handlePass}
            size="lg"
            variant="outline"
            className="w-16 h-16 rounded-full border-2 border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300"
          >
            <X className="w-6 h-6" />
          </Button>

          <Button
            onClick={handleSuperLike}
            size="lg"
            variant="outline"
            className="w-16 h-16 rounded-full border-2 border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300"
          >
            <Star className="w-6 h-6" />
          </Button>

          <Button
            onClick={handleLike}
            size="lg"
            className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
          >
            <Heart className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Match Modal */}
      <MatchModal
        isOpen={showMatchModal}
        onClose={() => setShowMatchModal(false)}
        profile={matchedProfile}
      />
    </div>
  );
}
