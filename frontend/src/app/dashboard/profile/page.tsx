"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  User,
  MapPin,
  Calendar,
  Heart,
  Edit,
  Camera,
  Shield,
} from "lucide-react";
import { authApi, UserResponse } from "@/lib/api";
import { getAccessToken } from "@/lib/siwe";

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = getAccessToken();
        if (token) {
          const data = await authApi.getMe(token);
          setUserData(data);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  const hasProfile = !!userData?.profile;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-gray-400">
            {hasProfile
              ? "Manage your dating profile"
              : "Create your profile to start matching"}
          </p>
        </div>
        {hasProfile && (
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      {!hasProfile ? (
        /* Create Profile CTA */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl p-12">
            <div className="text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Create Your Profile
              </h2>
              <p className="text-gray-400 mb-8">
                Add your photos, interests, and preferences to start finding your
                perfect match. Our AI will use this information to suggest the
                best matches for you.
              </p>
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                Get Started
              </Button>
            </div>
          </Card>
        </motion.div>
      ) : (
        /* Existing Profile */
        <div className="space-y-6">
          {/* Profile Header Card */}
          <Card className="border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
            {/* Cover Photo */}
            <div className="h-32 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 relative">
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
              >
                <Camera className="w-4 h-4 mr-2" />
                Change Cover
              </Button>
            </div>

            {/* Profile Info */}
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Profile Picture */}
                <div className="relative -mt-16 md:-mt-20">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-4 border-gray-950">
                    <User className="w-16 h-16 text-white" />
                  </div>
                  <button className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center">
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">
                        {userData.profile.display_name}, {userData.profile.age}
                      </h2>
                      <div className="flex items-center gap-4 text-gray-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {userData.profile.location}
                        </span>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      Active Now
                    </Badge>
                  </div>

                  <p className="text-gray-300 mb-4">{userData.profile.bio}</p>

                  {/* Interests */}
                  <div className="flex flex-wrap gap-2">
                    {userData.profile.interests.map((interest, i) => (
                      <Badge
                        key={i}
                        className="bg-white/10 text-purple-300 border-white/20"
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Photos Grid */}
          <Card className="border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Photos</h3>
              <Button size="sm" variant="ghost" className="text-purple-400">
                <Camera className="w-4 h-4 mr-2" />
                Add Photos
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {userData.profile.photos.map((photo, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center"
                >
                  <Camera className="w-8 h-8 text-gray-500" />
                </div>
              ))}
              <button className="aspect-square rounded-xl border-2 border-dashed border-white/20 hover:border-purple-500/50 flex items-center justify-center transition-all group">
                <div className="text-center">
                  <Camera className="w-8 h-8 text-gray-500 group-hover:text-purple-400 mx-auto mb-2 transition-colors" />
                  <span className="text-sm text-gray-500 group-hover:text-purple-400 transition-colors">
                    Add Photo
                  </span>
                </div>
              </button>
            </div>
          </Card>

          {/* Wallet Info */}
          <Card className="border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-bold text-white">
                Blockchain Identity
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <span className="text-sm text-gray-400">Wallet Address</span>
                <span className="text-sm text-white font-mono">
                  {userData.user.wallet.address.slice(0, 6)}...
                  {userData.user.wallet.address.slice(-4)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <span className="text-sm text-gray-400">Chain</span>
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                  {userData.user.wallet.chain === "1"
                    ? "Ethereum"
                    : `Chain ${userData.user.wallet.chain}`}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <span className="text-sm text-gray-400">Member Since</span>
                <span className="text-sm text-white">
                  {new Date(userData.user.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Card>

          {/* Stats */}
          {userData.snapshots && (
            <Card className="border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Your Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-xl bg-white/5">
                  <Heart className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">
                    {userData.snapshots.likes_received}
                  </div>
                  <div className="text-sm text-gray-400">Likes Received</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-white/5">
                  <User className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">
                    {userData.snapshots.matches_count}
                  </div>
                  <div className="text-sm text-gray-400">Matches</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-white/5">
                  <Calendar className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">
                    {userData.snapshots.events_attended}
                  </div>
                  <div className="text-sm text-gray-400">Events</div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
