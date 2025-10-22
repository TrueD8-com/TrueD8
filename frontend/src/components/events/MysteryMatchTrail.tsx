"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Eye, Heart, Sparkles, Lock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

interface ClueLocation {
  id: string;
  name: string;
  address: string;
  clue: string;
  discovered: boolean;
  potentialMatches?: number;
}

interface MysteryMatchTrailProps {
  eventId: string;
  locations: ClueLocation[];
}

export default function MysteryMatchTrail({ eventId, locations }: MysteryMatchTrailProps) {
  const discoveredCount = locations.filter((l) => l.discovered).length;
  const progress = (discoveredCount / locations.length) * 100;

  return (
    <Card className="border border-white/10 bg-white/5 backdrop-blur-xl p-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-orange-400" />
              Mystery Match Trail
            </h3>
            <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
              {discoveredCount} / {locations.length} discovered
            </Badge>
          </div>
          <p className="text-gray-400 text-sm">
            Follow clues to discover locations and potential matches at the event
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>Trail Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Locations List */}
        <div className="space-y-3">
          {locations.map((location, idx) => (
            <motion.div
              key={location.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card
                className={`p-4 ${
                  location.discovered
                    ? "border-green-500/30 bg-gradient-to-r from-green-500/10 to-emerald-500/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Status Icon */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      location.discovered
                        ? "bg-green-500/20 text-green-400"
                        : "bg-white/10 text-gray-400"
                    }`}
                  >
                    {location.discovered ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Lock className="w-5 h-5" />
                    )}
                  </div>

                  {/* Location Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold text-white">
                        {location.discovered ? location.name : `Location ${idx + 1}`}
                      </h4>
                      {location.discovered && location.potentialMatches !== undefined && (
                        <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30 flex-shrink-0">
                          <Heart className="w-3 h-3 mr-1" />
                          {location.potentialMatches} matches
                        </Badge>
                      )}
                    </div>

                    {/* Clue */}
                    <div
                      className={`rounded-lg p-3 mb-2 ${
                        location.discovered ? "bg-white/5" : "bg-orange-500/10"
                      }`}
                    >
                      <p className="text-sm text-gray-300 italic">
                        {location.discovered ? (
                          <span className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-green-400 flex-shrink-0" />
                            Discovered!
                          </span>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 inline mr-1 text-orange-400" />
                            {location.clue}
                          </>
                        )}
                      </p>
                    </div>

                    {/* Address (only if discovered) */}
                    {location.discovered && (
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <MapPin className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="truncate">{location.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Completion Message */}
        {progress === 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 p-4 text-center"
          >
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
            <h4 className="font-bold text-white mb-1">Trail Complete!</h4>
            <p className="text-sm text-gray-300">
              You&apos;ve discovered all locations. Check your matches at the event!
            </p>
          </motion.div>
        )}
      </div>
    </Card>
  );
}
