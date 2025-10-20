"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, X, Star, MapPin, Sparkles, Check, Bookmark } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { datingApi, UserProfile } from "@/lib/api";
import { toast } from "sonner";

export default function MatchesPage() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [matchedUserId, setMatchedUserId] = useState<string | null>(null);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const data = await datingApi.discover({ limit: 30 });
      setProfiles(data);
    } catch (err) {
      console.error("Failed to load profiles:", err);
      toast.error("Failed to load profiles");
    } finally {
      setLoading(false);
    }
  };

  const currentProfile = profiles[currentIndex];

  const handleLike = async () => {
    if (!currentProfile || actionLoading) return;
    setActionLoading(true);
    try {
      const result = await datingApi.likeUser(currentProfile._id);
      if (result.matchId) {
        setMatchedUserId(currentProfile._id);
        toast.success("It's a match! 🎉");
        setTimeout(() => setMatchedUserId(null), 3000);
      } else {
        toast.success("Like sent!");
      }
      setCurrentIndex((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to like:", err);
      toast.error("Failed to like");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuperlike = async () => {
    if (!currentProfile || actionLoading) return;
    setActionLoading(true);
    try {
      await datingApi.superlikeUser(currentProfile._id);
      toast.success("Superlike sent! ⭐");
      setCurrentIndex((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to superlike:", err);
      toast.error("Failed to superlike");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePass = async () => {
    if (!currentProfile || actionLoading) return;
    setCurrentIndex((prev) => prev + 1);
  };

  const handleFavorite = async () => {
    if (!currentProfile || actionLoading) return;
    setActionLoading(true);
    try {
      await datingApi.addFavorite(currentProfile._id);
      toast.success("Added to favorites! ⭐");
    } catch (err) {
      console.error("Failed to add favorite:", err);
      toast.error("Failed to add favorite");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto pb-20 md:pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Discover</h1>
          <p className="text-gray-400">Finding people near you...</p>
        </div>
        <Card className="border border-white/10 bg-white/5 backdrop-blur-xl p-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mx-auto" />
          </div>
        </Card>
      </div>
    );
  }

  if (!profiles.length || currentIndex >= profiles.length) {
    return (
      <div className="max-w-4xl mx-auto pb-20 md:pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Discover</h1>
          <p className="text-gray-400">No more profiles to show</p>
        </div>
        <Card className="border border-white/10 bg-white/5 backdrop-blur-xl p-12">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-pink-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              You&apos;re all caught up!
            </h2>
            <p className="text-gray-400 mb-8">
              Check back later for more profiles, or adjust your discovery settings.
            </p>
            <Button
              onClick={loadProfiles}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              Refresh
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const allPhotos = currentProfile.photos || [];
  const photoUrls = allPhotos.map(p => p.url ? `${process.env.NEXT_PUBLIC_API_URL || ""}${p.url}` : null).filter(Boolean) as string[];

  return (
    <div className="max-w-4xl mx-auto pb-20 md:pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Discover</h1>
        <p className="text-gray-400">
          {profiles.length - currentIndex} profiles remaining
        </p>
      </div>

      {/* Match Notification */}
      <AnimatePresence>
        {matchedUserId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <Card className="border border-white/20 bg-gradient-to-br from-pink-500/20 to-purple-500/20 backdrop-blur-xl p-12 max-w-md mx-4">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <Heart className="w-12 h-12 text-white fill-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">It&apos;s a Match!</h2>
                <p className="text-gray-300 mb-8">
                  You and {currentProfile.name} liked each other
                </p>
                <Button
                  onClick={() => setMatchedUserId(null)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Continue
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swipe Card */}
      <div className="relative" style={{ height: "600px" }}>
        <AnimatePresence>
          {currentProfile && (
            <SwipeCard
              profile={currentProfile}
              photoUrls={photoUrls}
              onLike={handleLike}
              onPass={handlePass}
              onFavorite={handleFavorite}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center items-center gap-6 mt-8">
        <Button
          onClick={handlePass}
          disabled={actionLoading}
          size="lg"
          className="w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-red-400 hover:text-red-300 hover:scale-110 transition-transform"
        >
          <X className="w-8 h-8" />
        </Button>

        <Button
          onClick={handleSuperlike}
          disabled={actionLoading}
          size="lg"
          className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border border-blue-400/30 text-blue-400 hover:scale-110 transition-transform"
        >
          <Star className="w-10 h-10" />
        </Button>

        <Button
          onClick={handleLike}
          disabled={actionLoading}
          size="lg"
          className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500/20 to-rose-500/20 hover:from-pink-500/30 hover:to-rose-500/30 border border-pink-400/30 text-pink-400 hover:text-pink-300 hover:scale-110 transition-transform"
        >
          <Heart className="w-8 h-8" />
        </Button>
      </div>
    </div>
  );
}

function SwipeCard({
  profile,
  photoUrls,
  onLike,
  onPass,
  onFavorite,
}: {
  profile: UserProfile;
  photoUrls: string[];
  onLike: () => void;
  onPass: () => void;
  onFavorite: () => void;
}) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number; y: number } }
  ) => {
    if (Math.abs(info.offset.x) > 100) {
      if (info.offset.x > 0) {
        onLike();
      } else {
        onPass();
      }
    }
  };

  const handlePhotoClick = (e: React.MouseEvent) => {
    if (photoUrls.length <= 1) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    if (clickX > width / 2) {
      setCurrentPhotoIndex((prev) => (prev + 1) % photoUrls.length);
    } else {
      setCurrentPhotoIndex((prev) => (prev - 1 + photoUrls.length) % photoUrls.length);
    }
  };

  const handleFavoriteClick = () => {
    setIsFavorited(true);
    onFavorite();
  };

  const currentPhotoUrl = photoUrls[currentPhotoIndex];

  return (
    <motion.div
      className="absolute inset-0"
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Card className="border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden h-full relative">
        {/* Photo Gallery */}
        <div
          className="h-[400px] bg-gradient-to-br from-purple-500/20 to-pink-500/20 relative cursor-pointer"
          onClick={handlePhotoClick}
        >
          {currentPhotoUrl ? (
            <img
              src={currentPhotoUrl}
              alt={profile.name || "Profile"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Heart className="w-24 h-24 text-white/20" />
            </div>
          )}

          {/* Photo Indicators */}
          {photoUrls.length > 1 && (
            <div className="absolute top-2 left-0 right-0 flex gap-1 px-4">
              {photoUrls.map((_, idx) => (
                <div
                  key={idx}
                  className={`flex-1 h-1 rounded-full transition-all ${
                    idx === currentPhotoIndex
                      ? "bg-white"
                      : "bg-white/30"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleFavoriteClick();
            }}
            className={`absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isFavorited
                ? "bg-amber-500 text-white"
                : "bg-black/30 backdrop-blur-sm text-white hover:bg-black/50"
            }`}
          >
            <Bookmark className={`w-6 h-6 ${isFavorited ? "fill-white" : ""}`} />
          </button>

          {/* Verification Badge */}
          {profile.verification?.photoVerified && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-blue-500/90 text-white border-0">
                <Check className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            </div>
          )}

          {/* Premium Badge */}
          {profile.premium && (
            <div className="absolute top-4 left-4">
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
            <h2 className="text-2xl font-bold text-white mb-1">
              {profile.name} {profile.lastName}
              {profile.username && <span className="text-gray-400 text-lg ml-2">@{profile.username}</span>}
            </h2>
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

          {profile.bio && <p className="text-gray-300">{profile.bio}</p>}

          {profile.interests && profile.interests.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {profile.interests.slice(0, 6).map((interest, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="border-white/20 text-gray-300"
                >
                  {interest}
                </Badge>
              ))}
              {profile.interests.length > 6 && (
                <Badge variant="outline" className="border-white/20 text-gray-400">
                  +{profile.interests.length - 6} more
                </Badge>
              )}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
