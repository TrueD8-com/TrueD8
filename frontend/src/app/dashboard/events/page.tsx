"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EventCard from "@/components/events/EventCard";
import MysteryMatchTrail from "@/components/events/MysteryMatchTrail";
import { eventsApi, Event } from "@/lib/api";
import { toast } from "sonner";
import { Calendar, Filter, Search } from "lucide-react";
import { motion } from "framer-motion";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "speed_dating" | "mixer" | "mystery_match" | "group_activity">("all");

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await eventsApi.getEvents();
      setEvents(data);
    } catch (err) {
      console.error("Failed to load events:", err);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (eventId: string, status: "attending" | "interested") => {
    try {
      await eventsApi.rsvpEvent(eventId, status);
      toast.success(status === "attending" ? "You're attending! 🎉" : "Marked as interested");
      setEvents(events.map(e => e._id === eventId ? { ...e, rsvpStatus: status } : e));
    } catch (err) {
      console.error("RSVP failed:", err);
      toast.error("Failed to RSVP");
    }
  };

  const filteredEvents = filter === "all" ? events : events.filter(e => e.type === filter);

  const mockMysteryTrail = {
    eventId: "2",
    locations: [
      { id: "1", name: "City Park Fountain", address: "456 Park Boulevard", clue: "Find the spot where water meets the sky", discovered: true, potentialMatches: 3 },
      { id: "2", name: "", address: "", clue: "Look for the place where books come alive", discovered: false },
      { id: "3", name: "", address: "", clue: "Where coffee meets art on every wall", discovered: false },
    ],
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto pb-20 md:pb-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-20 md:pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              Dating Events
            </h1>
            <p className="text-gray-400">Meet people in person at local events and activities</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="border border-white/10 bg-white/5 backdrop-blur-xl p-4">
            <div className="text-2xl font-bold text-white mb-1">{events.length}</div>
            <div className="text-sm text-gray-400">Upcoming Events</div>
          </Card>
          <Card className="border border-white/10 bg-white/5 backdrop-blur-xl p-4">
            <div className="text-2xl font-bold text-white mb-1">{events.filter(e => e.rsvpStatus === "attending").length}</div>
            <div className="text-sm text-gray-400">You&apos;re Attending</div>
          </Card>
          <Card className="border border-white/10 bg-white/5 backdrop-blur-xl p-4">
            <div className="text-2xl font-bold text-white mb-1">{events.reduce((sum, e) => sum + e.attendees, 0)}</div>
            <div className="text-sm text-gray-400">Total Attendees</div>
          </Card>
          <Card className="border border-white/10 bg-white/5 backdrop-blur-xl p-4">
            <div className="text-2xl font-bold text-white mb-1">${events.reduce((sum, e) => sum + e.price, 0)}</div>
            <div className="text-sm text-gray-400">Total Value</div>
          </Card>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-gray-400">
            <Filter className="w-4 h-4" />
            <span className="text-sm">Filter:</span>
          </div>
          {[{ value: "all", label: "All Events" }, { value: "speed_dating", label: "Speed Dating" }, { value: "mixer", label: "Mixer" }, { value: "mystery_match", label: "Mystery Match" }, { value: "group_activity", label: "Group Activity" }].map((f) => (
            <Button key={f.value} onClick={() => setFilter(f.value as typeof filter)} variant="outline" size="sm" className={filter === f.value ? "bg-purple-500/20 border-purple-500/30 text-purple-300" : "border-white/10 text-gray-400 hover:bg-white/5"}>{f.label}</Button>
          ))}
        </div>
      </motion.div>

      {events.some(e => e.type === "mystery_match" && e.rsvpStatus === "attending") && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
          <MysteryMatchTrail {...mockMysteryTrail} />
        </motion.div>
      )}

      {filteredEvents.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event, idx) => (
            <motion.div key={event._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
              <EventCard event={event} onRSVP={handleRSVP} />
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="border border-white/10 bg-white/5 backdrop-blur-xl p-12">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">No Events Found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your filters or check back later for new events.</p>
            <Button onClick={() => setFilter("all")} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">Show All Events</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
