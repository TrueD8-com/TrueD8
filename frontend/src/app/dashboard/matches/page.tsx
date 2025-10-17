"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, X, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function MatchesPage() {
  return (
    <div className="max-w-4xl mx-auto pb-20 md:pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Matches</h1>
        <p className="text-gray-400">
          Discover people who share your interests
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border border-white/10 bg-white/5 backdrop-blur-xl p-12">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-pink-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Start Matching
            </h2>
            <p className="text-gray-400 mb-8">
              Complete your profile to start discovering potential matches
              powered by our AI matchmaking algorithm.
            </p>
            <div className="flex justify-center gap-4">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                Complete Profile
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Coming Soon - Swipe Interface */}
      <div className="mt-8 grid md:grid-cols-3 gap-4 opacity-50 pointer-events-none">
        {[1, 2, 3].map((i) => (
          <Card
            key={i}
            className="border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden"
          >
            <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20" />
            <div className="p-4">
              <div className="h-4 bg-white/10 rounded mb-2 w-2/3" />
              <div className="h-3 bg-white/10 rounded w-1/2" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
