"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Star, Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { UserProfile } from "@/lib/api";
import { useState } from "react";

interface MatchResultCardProps {
  profile: UserProfile;
  matchScore?: number;
  matchReason?: string;
  onLike?: () => void;
  onViewProfile?: () => void;
}

export default function MatchResultCard({
  profile,
  matchScore = 85,
  matchReason = "Based on shared interests and compatibility",
  onLike,
  onViewProfile,
}: MatchResultCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    setIsLiked(true);
    onLike?.();
  };

  const allPhotos = profile.photos || [];
  const primaryPhoto = allPhotos.find((p) => p.isPrimary) || allPhotos[0];
  const photoUrl = primaryPhoto?.url
    ? `${process.env.NEXT_PUBLIC_API_URL || ""}${primaryPhoto.url}`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
        <div className="relative">
          {/* Photo */}
          <div className="h-64 bg-gradient-to-br from-purple-500/20 to-pink-500/20 relative">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={profile.name || "Profile"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Heart className="w-16 h-16 text-white/20" />
              </div>
            )}

            {/* Match Score Badge */}
            <div className="absolute top-4 right-4">
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-3 py-1">
                <Sparkles className="w-3 h-3 mr-1" />
                {matchScore}% Match
              </Badge>
            </div>

            {/* Verification Badge */}
            {profile.verification?.photoVerified && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-blue-500/90 text-white border-0">
                  <Check className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              </div>
            )}

            {/* Premium Badge */}
            {profile.premium?.isActive && (
              <div className="absolute top-14 left-4">
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                  <Star className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">
                {profile.name} {profile.lastName}
                {profile.username && (
                  <span className="text-gray-400 text-base ml-2">
                    @{profile.username}
                  </span>
                )}
              </h3>
              {profile.location && (
                <div className="flex items-center gap-1 text-gray-400 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {profile.discovery?.distanceKm
                      ? `${Math.round(profile.discovery.distanceKm)} km away`
                      : "Nearby"}
                  </span>
                </div>
              )}
            </div>

            {/* Match Reason */}
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
              <p className="text-sm text-purple-200">
                <Sparkles className="w-4 h-4 inline mr-1 text-purple-400" />
                {matchReason}
              </p>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-gray-300 text-sm line-clamp-3">{profile.bio}</p>
            )}

            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {profile.interests.slice(0, 5).map((interest, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="border-white/20 text-gray-300"
                  >
                    {interest}
                  </Badge>
                ))}
                {profile.interests.length > 5 && (
                  <Badge variant="outline" className="border-white/20 text-gray-400">
                    +{profile.interests.length - 5} more
                  </Badge>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleLike}
                disabled={isLiked}
                className={`flex-1 ${
                  isLiked
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                }`}
              >
                <Heart
                  className={`w-4 h-4 mr-2 ${isLiked ? "fill-green-400" : ""}`}
                />
                {isLiked ? "Liked" : "Like"}
              </Button>
              <Button
                onClick={onViewProfile}
                variant="outline"
                className="flex-1 border-white/20 text-gray-300 hover:bg-white/10"
              >
                View Profile
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
