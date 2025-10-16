"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Wallet, ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AnimatedSection } from "./AnimatedSection";

export function CTASection() {
  return (
    <section className="py-24 px-4 relative">
      <div className="container mx-auto max-w-4xl">
        <AnimatedSection>
          <motion.div whileHover={{ scale: 1.02 }} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/40 via-pink-500/40 to-orange-500/40 rounded-3xl blur-3xl group-hover:blur-[100px] transition-all duration-500" />

            <Card className="relative overflow-hidden border border-white/20 bg-white/5 backdrop-blur-xl">
              <CardContent className="relative p-12 text-center">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl"
                >
                  <Heart className="w-12 h-12 text-white fill-white" />
                </motion.div>

                <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                  Ready to Find Your Match?
                </h2>
                <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                  Join thousands of people finding meaningful connections with
                  AI-powered matchmaking and Web3 security
                </p>

                <Link href="/siwe">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 text-white px-12 py-6 text-lg shadow-2xl shadow-purple-500/50"
                    >
                      <Wallet className="w-5 h-5 mr-2" />
                      Get Started Free
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </motion.div>
                </Link>

                <p className="mt-6 text-sm text-gray-500">
                  <Lock className="w-4 h-4 inline mr-1" />
                  Secure Web3 authentication • No credit card required
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
}
