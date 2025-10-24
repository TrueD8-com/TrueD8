"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  Settings,
  Trophy,
  Star,
} from "lucide-react";
import { authApi, UserResponse } from "@/lib/api";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { PhotoUploader } from "@/components/profile/PhotoUploader";
import Image from "next/image";
export default function ProfilePage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  const fetchUserData = async () => {
    try {
      const data = await authApi.getMe();
      setUserData(data);
    } catch (err) {
      console.error("Failed to fetch user data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
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

  const hasProfile = !!(userData?.name && userData?.bio);

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
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/profile/preferences")}
            >
              <Settings className="w-4 h-4 mr-2" />
              Preferences
            </Button>
            <Button
              onClick={() => setIsEditModalOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
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
                Add your photos, interests, and preferences to start finding
                your perfect match. Our AI will use this information to suggest
                the best matches for you.
              </p>
              <Button
                size="lg"
                onClick={() => setIsEditModalOpen(true)}
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
            {/* Cover Photo - Commented out for now */}
            {/* <div className="h-32 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 relative">
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
              >
                <Camera className="w-4 h-4 mr-2" />
                Change Cover
              </Button>
            </div> */}

            {/* Profile Info */}
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Profile Picture */}
                <div className="relative">
                  {userData.photos?.find((p) => p.isPrimary)?.url ? (
                    <div className="w-32 h-32 rounded-full border-4 border-gray-950 overflow-hidden">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_API_IMAGE_URL || ""}${
                          userData.photos.find((p) => p.isPrimary)!.url
                        }`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        width={128}
                        height={128}
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-4 border-gray-950">
                      <User className="w-16 h-16 text-white" />
                    </div>
                  )}
                  <button
                    onClick={() => setIsPhotoModalOpen(true)}
                    className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center"
                  >
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">
                        {userData.name} {userData.lastName}
                        {userData.username && (
                          <span className="text-gray-400 text-lg ml-2">
                            @{userData.username}
                          </span>
                        )}
                      </h2>
                      <div className="flex items-center gap-4 text-gray-400">
                        {userData.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {userData.address?.city || "Location"}
                          </span>
                        )}
                        {userData.birthdate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(userData.birthdate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      Active Now
                    </Badge>
                  </div>

                  {userData.bio && (
                    <p className="text-gray-300 mb-4">{userData.bio}</p>
                  )}

                  {/* Interests */}
                  {userData.interests && userData.interests.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {userData.interests.map((interest, i) => (
                        <Badge
                          key={i}
                          className="bg-white/10 text-purple-300 border-white/20"
                        >
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Photos Grid */}
          <Card className="border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Photos</h3>
              <Button
                size="sm"
                variant="ghost"
                className="text-purple-400"
                onClick={() => setIsPhotoModalOpen(true)}
              >
                <Camera className="w-4 h-4 mr-2" />
                Add Photos
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {userData.photos && userData.photos.length > 0
                ? userData.photos.map((photo, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 overflow-hidden"
                    >
                      {photo.url ? (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_API_IMAGE_URL || ""}${
                            photo.url
                          }`}
                          alt={`Photo ${i + 1}`}
                          className="w-full h-full object-cover"
                          width={300}
                          height={300}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Camera className="w-8 h-8 text-gray-500" />
                        </div>
                      )}
                    </div>
                  ))
                : null}
              <button
                onClick={() => setIsPhotoModalOpen(true)}
                className="aspect-square rounded-xl border-2 border-dashed border-white/20 hover:border-purple-500/50 flex items-center justify-center transition-all group"
              >
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
          {userData.wallet && (
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
                    {userData.wallet.address
                      ? `${userData.wallet.address.slice(
                          0,
                          6
                        )}...${userData.wallet.address.slice(-4)}`
                      : "Not connected"}
                  </span>
                </div>
                {userData.wallet.provider && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <span className="text-sm text-gray-400">Provider</span>
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                      {userData.wallet.provider}
                    </Badge>
                  </div>
                )}
                {userData.wallet.connectedAt && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <span className="text-sm text-gray-400">Connected</span>
                    <span className="text-sm text-white">
                      {new Date(
                        userData.wallet.connectedAt
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Reputation Points */}
          <Card className="border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-purple-400" />
                Reputation Points
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard/rewards")}
                className="text-purple-400 hover:text-purple-300"
              >
                View All
              </Button>
            </div>
            <div className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  1,250
                </span>
                <span className="text-gray-400">points</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-400">Level 5</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  250 to Level 6
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  style={{ width: "83%" }}
                />
              </div>
              <p className="text-xs text-gray-400">
                Complete dates and maintain commitments to earn more points
              </p>
            </div>
          </Card>

          {/* Stats */}
          {userData.metrics && (
            <Card className="border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Your Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-xl bg-white/5">
                  <Heart className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">
                    {userData.metrics.likesReceived || 0}
                  </div>
                  <div className="text-sm text-gray-400">Likes Received</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-white/5">
                  <User className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">
                    {userData.metrics.matchesCount || 0}
                  </div>
                  <div className="text-sm text-gray-400">Matches</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-white/5">
                  <Heart className="w-6 h-6 text-rose-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">
                    {userData.metrics.favoritesCount || 0}
                  </div>
                  <div className="text-sm text-gray-400">Favorites</div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Modals */}
      <EditProfileModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        user={userData}
        onProfileUpdated={fetchUserData}
      />
      <PhotoUploader
        open={isPhotoModalOpen}
        onOpenChange={setIsPhotoModalOpen}
        user={userData}
        onPhotosUpdated={fetchUserData}
      />
    </div>
  );
}
