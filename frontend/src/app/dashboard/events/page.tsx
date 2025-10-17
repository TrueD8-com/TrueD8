"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { motion } from "framer-motion";

const upcomingEvents = [
  {
    title: "Speed Dating Night",
    date: "Tonight, 8:00 PM",
    location: "Downtown SF",
    attendees: 24,
    type: "Hot",
  },
  {
    title: "Mystery Match Trail",
    date: "Tomorrow, 6:00 PM",
    location: "Golden Gate Park",
    attendees: 18,
    type: "Trending",
  },
  {
    title: "Coffee & Connect",
    date: "This Weekend",
    location: "Marina District",
    attendees: 12,
    type: "New",
  },
];

export default function EventsPage() {
  return (
    <div className="max-w-4xl mx-auto pb-20 md:pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Events</h1>
        <p className="text-gray-400">
          Meet people at local dating events and activities
        </p>
      </div>

      <div className="space-y-4">
        {upcomingEvents.map((event, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.01 }}
          >
            <Card className="border border-white/10 bg-white/5 backdrop-blur-xl p-6 hover:bg-white/10 transition-all cursor-pointer">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-32 h-32 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-12 h-12 text-purple-400" />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {event.title}
                      </h3>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {event.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {event.attendees} attending
                        </span>
                      </div>
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                      {event.type}
                    </Badge>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                      Register
                    </Button>
                    <Button variant="ghost" className="text-gray-400 hover:text-white">
                      Learn More
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
