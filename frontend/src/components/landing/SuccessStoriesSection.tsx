"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, Heart, ChevronRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AnimatedSection } from "./AnimatedSection";
import { staggerContainer, scaleIn } from "./animations";

const successStories = [
  {
    couple: "Sarah & Mike",
    location: "San Francisco, CA",
    match: "95% Match",
    story: "Met through AI matchmaking, now planning our wedding! 💍",
    date: "Matched 6 months ago",
  },
  {
    couple: "Emma & Lucas",
    location: "New York, NY",
    match: "92% Match",
    story: "Found love at a Mystery Match Trail event. Best decision ever!",
    date: "Matched 8 months ago",
  },
  {
    couple: "Alex & Jordan",
    location: "Austin, TX",
    match: "97% Match",
    story: "The AI knew we were perfect before we did. Soulmates! ❤️",
    date: "Matched 1 year ago",
  },
  {
    couple: "Mia & David",
    location: "Los Angeles, CA",
    match: "94% Match",
    story: "From first swipe to forever. TrueD8 changed our lives!",
    date: "Matched 5 months ago",
  },
  {
    couple: "Zoe & Ryan",
    location: "Miami, FL",
    match: "96% Match",
    story: "Web3 brought us together. Living our best life now! 🌟",
    date: "Matched 9 months ago",
  },
  {
    couple: "Lily & Jack",
    location: "Seattle, WA",
    match: "93% Match",
    story: "AI matchmaking works! Celebrating our first anniversary soon.",
    date: "Matched 11 months ago",
  },
];

const liveActivity = [
  {
    names: "Jessica & Tom",
    location: "Chicago",
    time: "Just now",
    badge: "New Match!",
  },
  {
    names: "Sophie & Daniel",
    location: "Boston",
    time: "2 min ago",
    badge: "95% Match",
  },
  {
    names: "Maya & Chris",
    location: "Denver",
    time: "5 min ago",
    badge: "Perfect Match",
  },
  {
    names: "Olivia & Ethan",
    location: "Portland",
    time: "8 min ago",
    badge: "97% Match",
  },
  {
    names: "Ava & Noah",
    location: "Phoenix",
    time: "12 min ago",
    badge: "First Date!",
  },
];

export function SuccessStoriesSection() {
  return (
    <section id="success-stories" className="py-24 px-4 relative overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        <AnimatedSection className="text-center mb-16">
          <Badge className="bg-white/10 backdrop-blur-sm text-pink-300 border-pink-500/30 mb-4">
            Success Stories
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold mb-4 text-white">
            Real Love Stories
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Thousands of couples have found their perfect match on TrueD8
          </p>
        </AnimatedSection>

        {/* Matched Couples Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
        >
          {successStories.map((story, i) => (
            <motion.div
              key={i}
              variants={scaleIn}
              whileHover={{ y: -10 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />

              <Card className="relative border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 overflow-hidden p-0">
                {/* Couple Image Placeholder */}
                <div className="relative h-64 bg-gradient-to-br from-purple-500/30 via-pink-500/30 to-orange-500/30 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex items-center gap-8">
                      {/* Person 1 */}
                      <motion.div
                        className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-4 border-white/20"
                        whileHover={{ scale: 1.1 }}
                      >
                        <Users className="w-12 h-12 text-white" />
                      </motion.div>

                      {/* Heart connector */}
                      <motion.div
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-2xl"
                        animate={{
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <Heart className="w-6 h-6 text-white fill-white" />
                      </motion.div>

                      {/* Person 2 */}
                      <motion.div
                        className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center border-4 border-white/20"
                        whileHover={{ scale: 1.1 }}
                      >
                        <Users className="w-12 h-12 text-white" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Match percentage badge */}
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-green-500/90 text-white border-0 backdrop-blur-sm">
                      {story.match}
                    </Badge>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-white">
                      {story.couple}
                    </h3>
                    <span className="text-xs text-gray-500">{story.date}</span>
                  </div>

                  <p className="text-sm text-gray-400 mb-3 flex items-center gap-1">
                    <span>📍</span> {story.location}
                  </p>

                  <p className="text-gray-300 leading-relaxed italic">
                    &ldquo;{story.story}&rdquo;
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Live Activity Feed */}
        <AnimatedSection>
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="relative group max-w-4xl mx-auto"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-all duration-500" />

            <Card className="relative border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
              <div className="p-8 md:p-12">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 mb-4 shadow-lg">
                    <Heart className="w-8 h-8 text-white fill-white" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    Live Matching Activity
                  </h3>
                  <p className="text-gray-400">
                    Matches happening right now on TrueD8
                  </p>
                </div>

                <div className="space-y-3">
                  {liveActivity.map((activity, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ x: 5 }}
                      className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 group/item"
                    >
                      <div className="flex items-center gap-4">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                          className="flex-shrink-0"
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                            <Heart className="w-5 h-5 text-white fill-white" />
                          </div>
                        </motion.div>
                        <div>
                          <p className="text-white font-medium group-hover/item:text-pink-300 transition-colors">
                            {activity.names}
                          </p>
                          <p className="text-sm text-gray-400">{activity.location}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30 mb-1 whitespace-nowrap">
                          {activity.badge}
                        </Badge>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="text-center mt-8">
                  <Link href="/siwe">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white shadow-2xl shadow-pink-500/50"
                      >
                        Join Them Today
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    </motion.div>
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
}
