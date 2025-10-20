"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Circle, Rocket } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedSection } from "./AnimatedSection";

const roadmapItems = [
  {
    quarter: "Q2 2025",
    title: "Beta Launch",
    description: "Limited testing with initial partners",
    status: "completed",
  },
  {
    quarter: "Q3 2025",
    title: "Public Release",
    description: "Full app with expanded partnerships",
    status: "current",
  },
  {
    quarter: "Q4 2025",
    title: "Advanced Features",
    description: "NFT profiles and enhanced gamification",
    status: "upcoming",
  },
  {
    quarter: "Q1 2026",
    title: "Global Expansion",
    description: "International rollout and localized partners",
    status: "upcoming",
  },
];

export function RoadmapSection() {
  return (
    <section className="py-20 px-4 relative">
      <div className="container mx-auto max-w-6xl">
        <AnimatedSection className="text-center mb-16">
          <Badge className="bg-white/10 backdrop-blur-sm text-purple-300 border-purple-500/30 mb-4">
            Roadmap
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Our Journey
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            From beta to global platform - see what&apos;s next for TrueD8
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-4 gap-6 relative">
          {/* Connection Line */}
          <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500/50 via-pink-500/50 to-purple-500/30" />

          {roadmapItems.map((item, i) => (
            <AnimatedSection key={i}>
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="relative border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all p-6 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <Badge
                      className={`text-xs ${
                        item.status === "completed"
                          ? "bg-green-500/20 text-green-300 border-green-500/30"
                          : item.status === "current"
                          ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                          : "bg-gray-500/20 text-gray-300 border-gray-500/30"
                      }`}
                    >
                      {item.quarter}
                    </Badge>
                    {item.status === "completed" ? (
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                    ) : item.status === "current" ? (
                      <Rocket className="w-6 h-6 text-purple-400" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-500" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-400">{item.description}</p>
                </Card>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
