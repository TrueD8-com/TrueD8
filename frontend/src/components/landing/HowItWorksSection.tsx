"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Wallet, Heart, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedSection } from "./AnimatedSection";

const steps = [
  {
    step: "01",
    icon: Wallet,
    title: "Connect Your Wallet",
    description: "Sign in securely with your Web3 wallet. No passwords needed!",
    gradient: "from-purple-500 to-purple-600",
  },
  {
    step: "02",
    icon: Heart,
    title: "Create Your Profile",
    description: "Tell us about yourself and let our AI find your perfect matches",
    gradient: "from-pink-500 to-pink-600",
  },
  {
    step: "03",
    icon: Zap,
    title: "Start Matching",
    description: "Swipe, match, chat, and meet amazing people in real life",
    gradient: "from-orange-500 to-orange-600",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 px-4 relative">
      <div className="container mx-auto max-w-6xl">
        <AnimatedSection className="text-center mb-16">
          <Badge className="bg-white/10 backdrop-blur-sm text-purple-300 border-purple-500/30 mb-4">
            How It Works
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold mb-4 text-white">
            Get Started in 3 Steps
          </h2>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connection Lines */}
          <div className="hidden md:block absolute top-20 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-purple-500/50 via-pink-500/50 to-orange-500/50" />

          {steps.map((step, i) => (
            <AnimatedSection key={i} className="relative">
              <motion.div
                whileHover={{ scale: 1.05, y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative group"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${step.gradient} rounded-3xl blur-2xl opacity-0 group-hover:opacity-40 transition-all duration-500`}
                />

                <Card className="relative text-center p-8 border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-300">
                  <motion.div
                    className={`w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center relative z-10 shadow-2xl`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <step.icon className="w-12 h-12 text-white" />
                  </motion.div>
                  <div className="text-sm font-bold text-purple-400 mb-2">
                    STEP {step.step}
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white">
                    {step.title}
                  </h3>
                  <p className="text-gray-400">{step.description}</p>
                </Card>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
