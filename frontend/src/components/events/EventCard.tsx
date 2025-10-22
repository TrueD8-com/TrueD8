"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, DollarSign, Check, Star } from "lucide-react";
import { Event } from "@/lib/api";
import { motion } from "framer-motion";
import { useState } from "react";

interface EventCardProps {
  event: Event;
  onRSVP?: (eventId: string, status: "attending" | "interested") => void;
}

export default function EventCard({ event, onRSVP }: EventCardProps) {
  const [rsvpStatus, setRsvpStatus] = useState(event.rsvpStatus);
  const [isLoading, setIsLoading] = useState(false);

  const handleRSVP = async (status: "attending" | "interested") => {
    setIsLoading(true);
    setRsvpStatus(status);
    await onRSVP?.(event._id, status);
    setIsLoading(false);
  };

  const spotsLeft = event.capacity - event.attendees;
  const fillPercentage = (event.attendees / event.capacity) * 100;

  const eventTypeColors = {
    speed_dating: "from-pink-500 to-rose-500",
    mixer: "from-purple-500 to-pink-500",
    mystery_match: "from-orange-500 to-pink-500",
    group_activity: "from-blue-500 to-cyan-500",
  };

  const eventTypeLabels = {
    speed_dating: "Speed Dating",
    mixer: "Mixer",
    mystery_match: "Mystery Match",
    group_activity: "Group Activity",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden hover:bg-white/10 transition-all h-full flex flex-col p-0">
        {/* Event Image/Banner */}
        <div className={`h-36 bg-gradient-to-br ${eventTypeColors[event.type]} relative flex-shrink-0`}>
          <div className="absolute inset-0 bg-black/20" />

          {/* Type Badge */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-white/90 text-gray-900 border-0 text-xs">
              {eventTypeLabels[event.type]}
            </Badge>
          </div>

          {/* RSVP Status */}
          {rsvpStatus && (
            <div className="absolute top-3 right-3">
              <Badge className={`${
                rsvpStatus === "attending"
                  ? "bg-green-500/90 text-white"
                  : "bg-blue-500/90 text-white"
              } border-0 text-xs`}>
                <Check className="w-3 h-3 mr-1" />
                {rsvpStatus === "attending" ? "Attending" : "Interested"}
              </Badge>
            </div>
          )}

          {/* Spots Left Warning */}
          {spotsLeft <= 5 && spotsLeft > 0 && (
            <div className="absolute bottom-3 right-3">
              <Badge className="bg-orange-500/90 text-white border-0 text-xs">
                <Star className="w-3 h-3 mr-1" />
                Only {spotsLeft} spots left!
              </Badge>
            </div>
          )}
        </div>

        {/* Event Details */}
        <div className="p-5 space-y-4 flex-1 flex flex-col">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
            <p className="text-gray-400 text-sm line-clamp-2">{event.description}</p>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-gray-300">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span className="text-sm">{new Date(event.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Clock className="w-4 h-4 text-purple-400" />
              <span className="text-sm">{event.time}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300 col-span-2">
              <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <span className="text-sm truncate">{event.location.name}</span>
            </div>
          </div>

          {/* Capacity Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-300">
                <Users className="w-4 h-4 text-purple-400" />
                <span>{event.attendees} / {event.capacity} attending</span>
              </div>
              <div className="flex items-center gap-1 text-gray-300">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="font-semibold">{event.price}</span>
              </div>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${eventTypeColors[event.type]} transition-all`}
                style={{ width: `${fillPercentage}%` }}
              />
            </div>
          </div>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {event.tags.slice(0, 3).map((tag, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="border-white/20 text-gray-400 text-xs"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => handleRSVP("attending")}
              disabled={isLoading || rsvpStatus === "attending" || spotsLeft === 0}
              className={`flex-1 ${
                rsvpStatus === "attending"
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              }`}
            >
              {rsvpStatus === "attending" ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Attending
                </>
              ) : (
                "RSVP"
              )}
            </Button>
            {rsvpStatus !== "attending" && (
              <Button
                onClick={() => handleRSVP("interested")}
                disabled={isLoading || rsvpStatus === "interested"}
                variant="outline"
                className={`flex-1 ${
                  rsvpStatus === "interested"
                    ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                    : "border-white/20 text-gray-300 hover:bg-white/10"
                }`}
              >
                {rsvpStatus === "interested" ? "Interested" : "Maybe"}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
