"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Wallet,
  ArrowRight,
  Users,
  Heart,
  Calendar,
  Coins,
  Download,
} from "lucide-react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { fadeInUp, staggerContainer, scaleIn } from "./animations";

export function HeroSection() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const stats = [
    { number: "10K+", label: "Active Users", icon: Users },
    { number: "2.5K", label: "Matches Made", icon: Heart },
    { number: "500+", label: "Events Hosted", icon: Calendar },
    { number: "$50K", label: "Rewards Earned", icon: Coins },
  ];

  return (
    <section className="pt-32 pb-20 px-4 relative">
      <motion.div
        style={{ opacity, scale }}
        className="container mx-auto max-w-6xl relative z-10"
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="text-center"
        >
          <motion.div variants={fadeInUp} className="mb-6 flex flex-wrap gap-3 justify-center">
            <Badge className="bg-purple-600/20 backdrop-blur-sm text-purple-200 border-purple-500/50 px-4 py-2 text-sm font-semibold">
              Now in Beta
            </Badge>
            <Badge className="bg-white/10 backdrop-blur-sm text-purple-300 border-purple-500/30 px-4 py-2 text-sm">
              <Sparkles className="w-4 h-4 mr-2 inline" />
              The Future of Dating is Here
            </Badge>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent leading-tight"
          >
            Find True Love
            <br />
            with AI & Web3
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Date. Earn. Explore. The next generation of dating powered by AI matchmaking,
            blockchain verification, and real-world connections
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/siwe">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 text-white px-8 py-6 text-lg border-0 shadow-2xl shadow-purple-500/50"
                >
                  <Wallet className="w-5 h-5 mr-2" />
                  Start Dating Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 text-lg border-2 border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10"
                asChild
              >
                <a href="/pitch-deck.pdf" download>
                  <Download className="w-5 h-5 mr-2" />
                  Download Pitch Deck
                </a>
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                variants={scaleIn}
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                  <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                    {stat.number}
                  </div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
