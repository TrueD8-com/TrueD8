"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, ChevronRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AnimatedSection } from "./AnimatedSection";

const partners = [
  { name: "All Bar One", category: "Bars & Restaurants" },
  { name: "PureGym", category: "Fitness" },
  { name: "Odeon", category: "Entertainment" },
  { name: "Gail's", category: "Cafés" },
  { name: "Wagamama", category: "Restaurants" },
];

export function PartnerBrandsSection() {
  return (
    <section className="py-16 px-4 relative">
      <div className="container mx-auto max-w-6xl">
        <AnimatedSection className="text-center mb-12">
          <Badge className="bg-white/10 backdrop-blur-sm text-purple-300 border-purple-500/30 mb-4">
            Partner Network
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
            Date at Top Venues
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Enjoy exclusive experiences at 500+ partner locations
          </p>
        </AnimatedSection>

        {/* Partner Logos Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">
          {partners.map((partner, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all h-full flex flex-col items-center justify-center text-center">
                <Building2 className="w-8 h-8 text-purple-400 mb-3" />
                <h3 className="text-white font-semibold mb-1">{partner.name}</h3>
                <p className="text-xs text-gray-500">{partner.category}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA for Business Partners */}
        <AnimatedSection className="text-center">
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <Link href="/siwe">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10"
                >
                  <Building2 className="w-5 h-5 mr-2" />
                  Become a Partner
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
