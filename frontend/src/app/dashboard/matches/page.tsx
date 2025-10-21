"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, MapPin, X, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { datingApi, Match, UserProfile, authApi } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface MatchWithProfile extends Match {
  profile?: UserProfile;
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const [matchesData, userData] = await Promise.all([
        datingApi.getMatches(),
        authApi.getMe(),
      ]);

      setCurrentUserId(userData._id || "");

      // For each match, we need to fetch the other user's profile
      // This is a simplified version - ideally backend would return populated profiles
      const matchesWithProfiles = matchesData.map((match) => ({
        ...match,
        profile: undefined, // Backend should populate this
      }));

      setMatches(matchesWithProfiles);
    } catch (err) {
      console.error("Failed to load matches:", err);
      toast.error("Failed to load matches");
    } finally {
      setLoading(false);
    }
  };

  const handleUnmatch = async (matchId: string) => {
    if (!confirm("Are you sure you want to unmatch? This action cannot be undone.")) {
      return;
    }

    try {
      await datingApi.unmatch(matchId);
      toast.success("Unmatched successfully");
      setMatches(matches.filter((m) => m._id !== matchId));
    } catch (err) {
      console.error("Failed to unmatch:", err);
      toast.error("Failed to unmatch");
    }
  };

  const handleMessage = (matchId: string) => {
    // Navigate to conversations/messages page
    router.push(`/dashboard/messages?match=${matchId}`);
  };

  if (loading) {
    return (
      <div className="pb-20 md:pb-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Your Matches
          </h1>
          <p className="text-gray-400">Loading your matches...</p>
        </div>
        <Card className="border border-white/10 bg-white/5 backdrop-blur-xl p-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mx-auto" />
          </div>
        </Card>
      </div>
    );
  }

  if (!matches.length) {
    return (
      <div className="pb-20 md:pb-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Your Matches
          </h1>
          <p className="text-gray-400">No matches yet</p>
        </div>
        <Card className="border border-white/10 bg-white/5 backdrop-blur-xl p-12">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-pink-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              No Matches Yet
            </h2>
            <p className="text-gray-400 mb-8">
              Start swiping in the Discover page to find people you like. When they like you back, you&apos;ll see them here!
            </p>
            <Button
              onClick={() => router.push("/dashboard/discover")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Start Discovering
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="pb-20 md:pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Your Matches
        </h1>
        <p className="text-gray-400">
          {matches.length} {matches.length === 1 ? "match" : "matches"}
        </p>
      </motion.div>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((match, i) => {
          // Determine which user is the other person (not current user)
          const otherUserId = match.userA === currentUserId ? match.userB : match.userA;

          return (
            <motion.div
              key={match._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
            >
              <MatchCard
                match={match}
                otherUserId={otherUserId}
                onMessage={() => handleMessage(match._id)}
                onUnmatch={() => handleUnmatch(match._id)}
              />
            </motion.div>
          );
        })}
      </div>

      {/* New Matches Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white mb-4">
          Keep Matching
        </h2>
        <Card className="border border-white/10 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl p-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Discover More People
              </h3>
              <p className="text-gray-400">
                Find more matches by exploring new profiles
              </p>
            </div>
            <Button
              onClick={() => router.push("/dashboard/discover")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Discover
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function MatchCard({
  match,
  onMessage,
  onUnmatch,
}: {
  match: MatchWithProfile;
  otherUserId: string;
  onMessage: () => void;
  onUnmatch: () => void;
}) {
  // In a real implementation, the backend should return populated profiles
  const profile = match.profile || null;

  const matchDate = new Date(match.createdAt);
  const daysAgo = Math.floor(
    (Date.now() - matchDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className="border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden hover:bg-white/10 transition-all group">
      {/* Profile Photo */}
      <div className="relative h-64 bg-gradient-to-br from-purple-500/20 to-pink-500/20">
        {profile?.photos?.[0]?.url ? (
          <img
            src={profile.photos[0].url}
            alt={profile.name || "Match"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Heart className="w-16 h-16 text-white/20" />
          </div>
        )}

        {/* Match Badge */}
        <div className="absolute top-4 left-4">
          <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0">
            <Heart className="w-3 h-3 mr-1 fill-white" />
            Match
          </Badge>
        </div>

        {/* Verification Badge */}
        {profile?.verification?.photoVerified && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-blue-500/90 text-white border-0">
              Verified
            </Badge>
          </div>
        )}
      </div>

      {/* Profile Info */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white mb-1">
            {profile?.name || "User"}
            {profile?.birthdate && (
              <span className="text-gray-400 text-base ml-2">
                {new Date().getFullYear() - new Date(profile.birthdate).getFullYear()}
              </span>
            )}
          </h3>

          {profile?.location && (
            <div className="flex items-center text-gray-400 text-sm">
              <MapPin className="w-4 h-4 mr-1" />
              <span>
                {profile.discovery?.distanceKm
                  ? `${Math.round(profile.discovery.distanceKm)} km away`
                  : "Nearby"}
              </span>
            </div>
          )}
        </div>

        {/* Bio Preview */}
        {profile?.bio && (
          <p className="text-sm text-gray-400 mb-4 line-clamp-2">
            {profile.bio}
          </p>
        )}

        {/* Match Date */}
        <p className="text-xs text-gray-500 mb-4">
          Matched {daysAgo === 0 ? "today" : `${daysAgo} ${daysAgo === 1 ? "day" : "days"} ago`}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={onMessage}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Message
          </Button>
          <Button
            onClick={onUnmatch}
            variant="outline"
            size="icon"
            className="border-white/20 bg-white/5 hover:bg-red-500/20 hover:border-red-500/30 text-gray-400 hover:text-red-400"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
