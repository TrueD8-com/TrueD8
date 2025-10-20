"use client";

import { UserProfile } from "@/lib/api";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Heart, MessageCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
}

export function MatchModal({ isOpen, onClose, profile }: MatchModalProps) {
  const router = useRouter();

  if (!profile) return null;

  const primaryPhoto = profile.photos?.find((p) => p.isPrimary)?.url || profile.photos?.[0]?.url;

  const handleSendMessage = () => {
    router.push("/dashboard/matches");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl border-0 bg-transparent p-0 overflow-hidden">
        <div className="relative bg-gradient-to-br from-purple-900/90 to-pink-900/90 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 2, opacity: 0.1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl"
            />
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors flex items-center justify-center"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Content */}
          <div className="relative z-10 p-8 text-center">
            {/* Celebration Animation */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.8, delay: 0.2 }}
              className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center"
            >
              <Heart className="w-12 h-12 text-white" fill="currentColor" />
            </motion.div>

            {/* Heading */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold text-white mb-2"
            >
              It&apos;s a Match!
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-200 mb-8"
            >
              You and {profile.name || profile.username} have liked each other
            </motion.p>

            {/* Profile Images */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-4 mb-8"
            >
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
                className="relative"
              >
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 bg-gradient-to-br from-purple-500 to-pink-500">
                  {primaryPhoto ? (
                    <img
                      src={primaryPhoto}
                      alt="You"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Heart className="w-12 h-12 text-white/50" />
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: "spring" }}
                className="relative z-10"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                  <Heart className="w-8 h-8 text-white" fill="currentColor" />
                </div>
              </motion.div>

              <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
                className="relative"
              >
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 bg-gradient-to-br from-purple-500 to-pink-500">
                  {primaryPhoto ? (
                    <img
                      src={primaryPhoto}
                      alt={profile.name || "Match"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Heart className="w-12 h-12 text-white/50" />
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex gap-4 justify-center"
            >
              <Button
                onClick={handleSendMessage}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Send Message
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="border-white/20 bg-white/10 hover:bg-white/20 text-white"
              >
                Keep Swiping
              </Button>
            </motion.div>

            {/* Floating Hearts Animation */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: 0, opacity: 0, scale: 0 }}
                animate={{
                  y: [-20, -100],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0.8],
                }}
                transition={{
                  duration: 2,
                  delay: 0.8 + i * 0.2,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
                className="absolute"
                style={{
                  left: `${20 + i * 13}%`,
                  bottom: "10%",
                }}
              >
                <Heart
                  className="w-6 h-6 text-pink-400"
                  fill="currentColor"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
