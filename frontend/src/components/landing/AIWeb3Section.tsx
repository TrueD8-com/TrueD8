"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Brain, Shield, Award, Wallet, User, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedSection } from "./AnimatedSection";
import { staggerContainer, scaleIn } from "./animations";

const features = [
  {
    icon: Brain,
    title: "AI Matchmaking",
    description: "Advanced algorithms analyze compatibility across 100+ dimensions for highly accurate matches",
    color: "from-purple-500 to-pink-500",
    category: "ai",
  },
  {
    icon: Shield,
    title: "Verified Identities",
    description: "Blockchain verification ensures every profile is authentic with zero fake accounts",
    color: "from-pink-500 to-purple-500",
    category: "web3",
  },
  {
    icon: Sparkles,
    title: "Smart Insights",
    description: "Deep learning provides personalized recommendations that evolve with your preferences",
    color: "from-purple-500 to-pink-500",
    category: "ai",
  },
  {
    icon: User,
    title: "Own Your Data",
    description: "Decentralized identity means you control your profile data, not us",
    color: "from-pink-500 to-purple-500",
    category: "web3",
  },
  {
    icon: Award,
    title: "NFT Achievements",
    description: "Collect unique badges and milestones as NFTs you can showcase or trade",
    color: "from-purple-500 to-pink-500",
    category: "web3",
  },
  {
    icon: Wallet,
    title: "Earn Rewards",
    description: "Get PYUSD tokens for genuine engagement, successful matches, and event participation",
    color: "from-pink-500 to-purple-500",
    category: "web3",
  },
];

export function AIWeb3Section() {
  return (
    <section id="features" className="py-24 px-4 relative">
      <div className="container mx-auto max-w-6xl">
        <AnimatedSection className="text-center mb-16">
          <Badge className="bg-white/10 backdrop-blur-sm text-purple-300 border-purple-500/30 mb-4">
            Technology
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold mb-4 text-white">
            AI Meets Blockchain
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Intelligent matchmaking powered by AI, secured and rewarded by Web3 technology
          </p>
        </AnimatedSection>

        {/* Enhanced Center Visualization */}
        <AnimatedSection className="mb-16">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="relative group max-w-4xl mx-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl blur-3xl opacity-50 group-hover:opacity-75 transition-all duration-500" />

            <Card className="relative border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
              <div className="p-12">
                <div className="grid md:grid-cols-2 gap-12 mb-8">
                  {/* AI Side */}
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="relative inline-block mb-6"
                    >
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 flex items-center justify-center relative">
                        <Brain className="w-12 h-12 text-purple-400" />
                        {/* Orbiting dots */}
                        {[0, 120, 240].map((angle, i) => (
                          <motion.div
                            key={i}
                            animate={{
                              rotate: [angle, angle + 360],
                            }}
                            transition={{
                              duration: 4,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="absolute inset-0"
                          >
                            <div className="w-2 h-2 rounded-full bg-purple-400 absolute -top-2 left-1/2" />
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                    <h3 className="text-xl font-bold text-white mb-2">Artificial Intelligence</h3>
                    <p className="text-sm text-gray-400">Smart matching algorithms</p>
                  </div>

                  {/* Blockchain Side */}
                  <div className="text-center">
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="relative inline-block mb-6"
                    >
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-pink-500/20 to-pink-600/20 border border-pink-500/30 flex items-center justify-center relative">
                        <Shield className="w-12 h-12 text-pink-400" />
                        {/* Corner accents */}
                        {["top-1 left-1", "top-1 right-1", "bottom-1 left-1", "bottom-1 right-1"].map((pos, i) => (
                          <motion.div
                            key={i}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                            className={`absolute ${pos} w-1.5 h-1.5 bg-pink-400 rounded-full`}
                          />
                        ))}
                      </div>
                    </motion.div>
                    <h3 className="text-xl font-bold text-white mb-2">Web3 Technology</h3>
                    <p className="text-sm text-gray-400">Decentralized & rewarding</p>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-white/10">
                  <div className="text-center">
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1"
                    >
                      95%
                    </motion.div>
                    <div className="text-xs text-gray-500">AI Accuracy</div>
                  </div>
                  <div className="text-center">
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                      className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-1"
                    >
                      100%
                    </motion.div>
                    <div className="text-xs text-gray-500">On-Chain Verified</div>
                  </div>
                  <div className="text-center">
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                      className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1"
                    >
                      $50+
                    </motion.div>
                    <div className="text-xs text-gray-500">Avg. Earned</div>
                  </div>
                  <div className="text-center">
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.9 }}
                      className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-1"
                    >
                      NFTs
                    </motion.div>
                    <div className="text-xs text-gray-500">Achievement Badges</div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </AnimatedSection>

        {/* Feature Cards Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, i) => (
            <motion.div key={i} variants={scaleIn} whileHover={{ y: -5 }}>
              <Card className="relative border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 p-6 h-full group overflow-hidden">
                {/* Category badge */}
                <div className="absolute top-4 right-4">
                  <Badge className={`text-xs ${feature.category === 'ai' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-pink-500/20 text-pink-300 border-pink-500/30'}`}>
                    {feature.category.toUpperCase()}
                  </Badge>
                </div>

                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
