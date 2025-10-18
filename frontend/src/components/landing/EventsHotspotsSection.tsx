"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Calendar, Users, TrendingUp, ChevronRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AnimatedSection } from "./AnimatedSection";

const upcomingEvents = [
  {
    title: "Fitness Date Challenge",
    location: "PureGym",
    date: "Tonight, 7 PM",
    attendees: 24,
    badge: "Hot",
    venue: "Partner Venue",
  },
  {
    title: "Blind Movie Date",
    location: "Odeon Cinema",
    date: "Tomorrow, 8 PM",
    attendees: 18,
    badge: "Mystery",
    venue: "Partner Venue",
  },
  {
    title: "Coffee Quest Meetup",
    location: "Gail's Bakery",
    date: "This Weekend",
    attendees: 12,
    badge: "Casual",
    venue: "Partner Venue",
  },
];

const hotspots = [
  { name: "San Francisco", count: 1247 },
  { name: "New York", count: 2156 },
  { name: "Los Angeles", count: 1832 },
  { name: "Austin", count: 894 },
];

export function EventsHotspotsSection() {
  return (
    <section id="events" className="py-24 px-4 relative">
      <div className="container mx-auto max-w-6xl">
        <AnimatedSection className="text-center mb-16">
          <Badge className="bg-white/10 backdrop-blur-sm text-purple-300 border-purple-500/30 mb-4">
            Events & Community
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold mb-4 text-white">
            Date in Real Life
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Meet at partner venues with exclusive date experiences and fun challenges
          </p>
        </AnimatedSection>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upcoming Events */}
          <AnimatedSection>
            <motion.div whileHover={{ scale: 1.01 }} className="relative group h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-all duration-500" />

              <Card className="relative border border-white/10 bg-white/5 backdrop-blur-xl h-full">
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Upcoming Events</h3>
                  </div>

                  <div className="space-y-3 mb-6">
                    {upcomingEvents.map((event, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ x: 5 }}
                        className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 cursor-pointer group/item"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-white font-medium group-hover/item:text-purple-300 transition-colors">
                                {event.title}
                              </h4>
                              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                                {event.badge}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {event.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {event.attendees} going
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-purple-300 font-medium whitespace-nowrap ml-4">
                            {event.date}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <Link href="/siwe">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg">
                        View All Events
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </motion.div>
                  </Link>
                </div>
              </Card>
            </motion.div>
          </AnimatedSection>

          {/* Trending Hotspots */}
          <AnimatedSection>
            <motion.div whileHover={{ scale: 1.01 }} className="relative group h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-all duration-500" />

              <Card className="relative border border-white/10 bg-white/5 backdrop-blur-xl h-full">
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Trending Hotspots</h3>
                  </div>

                  {/* Map Placeholder */}
                  <div className="relative h-48 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-purple-500/5 rounded-xl mb-6 overflow-hidden border border-white/10">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                    {/* Location markers */}
                    {[
                      { x: "20%", y: "30%" },
                      { x: "60%", y: "40%" },
                      { x: "45%", y: "65%" },
                      { x: "75%", y: "55%" },
                    ].map((pos, i) => (
                      <motion.div
                        key={i}
                        className="absolute"
                        style={{ left: pos.x, top: pos.y }}
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.7, 1, 0.7],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.3,
                        }}
                      >
                        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 shadow-lg" />
                      </motion.div>
                    ))}
                  </div>

                  {/* City List */}
                  <div className="space-y-3 mb-6">
                    {hotspots.map((spot, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ x: -5 }}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 cursor-pointer group/item"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 animate-pulse" />
                          <span className="text-white font-medium group-hover/item:text-pink-300 transition-colors">
                            {spot.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-purple-400 font-medium">
                            {spot.count}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <Link href="/siwe">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0 shadow-lg">
                        Explore Hotspots
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </motion.div>
                  </Link>
                </div>
              </Card>
            </motion.div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
