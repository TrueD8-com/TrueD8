"use client";

import { Button } from "@/components/ui/button";
import { Heart, Wallet } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
// import { ThemeToggle } from "@/components/ThemeToggle";
import {
  FloatingOrbs,
  HeroSection,
  SuccessStoriesSection,
  AIWeb3Section,
  HowItWorksSection,
  EventsHotspotsSection,
  CTASection,
} from "@/components/landing";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-purple-950/50 to-gray-950" />

      {/* Grid pattern overlay */}
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10" />

      <FloatingOrbs />

      <nav className="fixed top-0 w-full bg-gray-950/80 backdrop-blur-xl border-b border-white/10 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-xl flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Heart className="w-6 h-6 text-white fill-white" />
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              TrueD8
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-gray-400 hover:text-purple-400 transition-colors"
            >
              Features
            </Link>
            <Link
              href="#success-stories"
              className="text-gray-400 hover:text-purple-400 transition-colors"
            >
              Success Stories
            </Link>
            <Link
              href="#how-it-works"
              className="text-gray-400 hover:text-purple-400 transition-colors"
            >
              How It Works
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* <ThemeToggle /> */}
            <Link href="/siwe">
              <Button className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 text-white border-0 shadow-lg shadow-purple-500/50">
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <HeroSection />
      <SuccessStoriesSection />
      <AIWeb3Section />
      <EventsHotspotsSection />
      <HowItWorksSection />
      <CTASection />

      <footer className="py-12 px-4 bg-black/50 backdrop-blur-xl border-t border-white/10 text-white relative">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white fill-white" />
                </div>
                <span className="text-2xl font-bold">TrueD8</span>
              </div>
              <p className="text-gray-400">
                The future of dating powered by AI and Web3
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="#features"
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#how-it-works"
                    className="hover:text-white transition-colors"
                  >
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link
                    href="#partners"
                    className="hover:text-white transition-colors"
                  >
                    Partners
                  </Link>
                </li>
                <li>
                  <Link
                    href="/siwe"
                    className="hover:text-white transition-colors"
                  >
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-white transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-white transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="hover:text-white transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-white transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-white transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cookies"
                    className="hover:text-white transition-colors"
                  >
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2025 TrueD8. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link
                href="https://twitter.com/trued8"
                className="text-gray-400 hover:text-purple-400 transition-colors"
              >
                Twitter
              </Link>
              <Link
                href="https://discord.gg/trued8"
                className="text-gray-400 hover:text-purple-400 transition-colors"
              >
                Discord
              </Link>
              <Link
                href="https://github.com/trued8"
                className="text-gray-400 hover:text-purple-400 transition-colors"
              >
                GitHub
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
