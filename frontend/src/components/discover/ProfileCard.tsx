"use client";

import { UserProfile } from "@/lib/api";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { MapPin, Heart, Star, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProfileCardProps {
  profile: UserProfile;
  onSwipe: (direction: "left" | "right" | "up") => void;
}

export function ProfileCard({ profile, onSwipe }: ProfileCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateZ = useTransform(x, [-200, 200], [-20, 20]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (_: unknown, info: { offset: { x: number; y: number } }) => {
    const swipeThreshold = 100;

    if (Math.abs(info.offset.y) > swipeThreshold && info.offset.y < 0) {
      onSwipe("up");
    } else if (info.offset.x > swipeThreshold) {
      onSwipe("right");
    } else if (info.offset.x < -swipeThreshold) {
      onSwipe("left");
    }
  };

  const primaryPhoto = profile.photos?.find((p) => p.isPrimary)?.url || profile.photos?.[0]?.url;
  const age = profile.birthdate
    ? new Date().getFullYear() - new Date(profile.birthdate).getFullYear()
    : null;

  const distance = profile.location?.coordinates
    ? Math.round(Math.random() * 50 + 1)
    : null;

  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      style={{ x, y, rotateZ, opacity }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
    >
      <div className="relative h-full w-full rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
        {/* Background Image */}
        <div className="absolute inset-0">
          {primaryPhoto ? (
            <img
              src={primaryPhoto}
              alt={profile.name || "Profile"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Heart className="w-24 h-24 text-white/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80" />
        </div>

        {/* Verification Badge */}
        {profile.verification?.photoVerified && (
          <div className="absolute top-4 right-4 z-10">
            <Badge className="bg-blue-500/80 text-white border-0 backdrop-blur-sm">
              <Star className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          </div>
        )}

        {/* Swipe Indicators */}
        <motion.div
          style={{ opacity: useTransform(x, [0, 100], [0, 1]) }}
          className="absolute top-8 right-8 z-10"
        >
          <div className="w-24 h-24 rounded-full bg-green-500/80 backdrop-blur-sm flex items-center justify-center border-4 border-green-400 rotate-12">
            <Heart className="w-12 h-12 text-white" />
          </div>
        </motion.div>

        <motion.div
          style={{ opacity: useTransform(x, [-100, 0], [1, 0]) }}
          className="absolute top-8 left-8 z-10"
        >
          <div className="w-24 h-24 rounded-full bg-red-500/80 backdrop-blur-sm flex items-center justify-center border-4 border-red-400 -rotate-12">
            <X className="w-12 h-12 text-white" />
          </div>
        </motion.div>

        <motion.div
          style={{ opacity: useTransform(y, [-100, 0], [1, 0]) }}
          className="absolute top-8 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="w-24 h-24 rounded-full bg-blue-500/80 backdrop-blur-sm flex items-center justify-center border-4 border-blue-400">
            <Star className="w-12 h-12 text-white" />
          </div>
        </motion.div>

        {/* Profile Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="mb-3">
            <h2 className="text-3xl font-bold mb-2">
              {profile.name || profile.username || "Anonymous"}
              {age && <span className="ml-2 font-normal">{age}</span>}
            </h2>

            {distance && (
              <div className="flex items-center text-gray-200 mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm">{distance} km away</span>
              </div>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-sm text-gray-200 mb-3 line-clamp-2">
              {profile.bio}
            </p>
          )}

          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {profile.interests.slice(0, 4).map((interest, i) => (
                <Badge
                  key={i}
                  className="bg-white/20 text-white border-0 backdrop-blur-sm"
                >
                  {interest}
                </Badge>
              ))}
              {profile.interests.length > 4 && (
                <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                  +{profile.interests.length - 4}
                </Badge>
              )}
            </div>
          )}

          {/* Premium Badge */}
          {profile.premium?.isActive && (
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
              Premium
            </Badge>
          )}
        </div>

        {/* Photo Count Indicators */}
        {profile.photos && profile.photos.length > 1 && (
          <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
            {profile.photos.map((_, i) => (
              <div
                key={i}
                className="flex-1 h-1 bg-white/30 backdrop-blur-sm rounded-full"
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
