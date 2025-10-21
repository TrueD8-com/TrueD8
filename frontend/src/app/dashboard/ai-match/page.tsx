"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ChatInterface, { ChatMessage } from "@/components/ai/ChatInterface";
import MatchResultCard from "@/components/ai/MatchResultCard";
import { datingApi, UserProfile, AIPromptData } from "@/lib/api";
import { toast } from "sonner";
import { Sparkles, RefreshCw, MessageSquare, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AIMatchResult {
  profile: UserProfile;
  score: number;
  reason: string;
}

export default function AIMatchPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [matchResults, setMatchResults] = useState<AIMatchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [aiContext, setAiContext] = useState<AIPromptData | null>(null);

  useEffect(() => {
    loadAIContext();
  }, []);

  const loadAIContext = async () => {
    try {
      const context = await datingApi.getAIPrompt();
      setAiContext(context);
    } catch (err) {
      console.error("Failed to load AI context:", err);
      toast.error("Failed to initialize AI matchmaker");
    }
  };

  const handleSendMessage = async (userMessage: string) => {
    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Simulate AI processing (replace with actual API call when backend is ready)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock AI response
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I understand you're looking for: "${userMessage}"\n\nLet me analyze your preferences and find the best matches for you. This will take just a moment...`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);

      // Simulate finding matches
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Get discover profiles as mock AI results
      const profiles = await datingApi.discover({ limit: 5 });

      // Create mock match results with scores and reasons
      const results: AIMatchResult[] = profiles.map((profile, idx) => ({
        profile,
        score: 95 - idx * 5, // Mock decreasing scores
        reason: generateMatchReason(userMessage, profile),
      }));

      setMatchResults(results);
      setShowResults(true);

      // Add final AI message
      const finalMsg: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: `Great! I've found ${results.length} excellent matches for you based on your criteria. Each match has been scored and ranked by compatibility. Check out the results below!`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, finalMsg]);
    } catch (err) {
      console.error("AI matching failed:", err);
      toast.error("Failed to process AI matching request");

      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I apologize, but I encountered an error while searching for matches. Please try again or rephrase your request.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMatchReason = (
    userQuery: string,
    profile: UserProfile
  ): string => {
    // Generate contextual match reason based on query and profile
    const interests = profile.interests?.slice(0, 2).join(" and ") || "similar interests";
    const reasons = [
      `Shares your passion for ${interests} and has a compatible personality`,
      `Strong alignment with your preferences, especially in ${interests}`,
      `Excellent compatibility based on shared values and ${interests}`,
      `Highly compatible lifestyle and interest in ${interests}`,
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  };

  const handleLikeMatch = async (profile: UserProfile) => {
    try {
      const result = await datingApi.likeUser(profile._id);
      if (result.matchId) {
        toast.success(`It's a match with ${profile.name}! 🎉`);
      } else {
        toast.success("Like sent!");
      }
    } catch (err) {
      console.error("Failed to like:", err);
      toast.error("Failed to send like");
    }
  };

  const handleNewSearch = () => {
    setShowResults(false);
    setMatchResults([]);
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 md:pb-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              AI Matchmaker
            </h1>
            <p className="text-gray-400">
              Describe your ideal match and let AI find the perfect connections
            </p>
          </div>
          {showResults && (
            <Button
              onClick={handleNewSearch}
              variant="outline"
              className="border-white/20 text-gray-300 hover:bg-white/10"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              New Search
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chat Interface */}
        <div className="lg:sticky lg:top-4 h-[600px]">
          <Card className="border border-white/10 bg-white/5 backdrop-blur-xl h-full flex flex-col overflow-hidden">
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          </Card>
        </div>

        {/* Match Results */}
        <div>
          <AnimatePresence mode="wait">
            {showResults ? (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    {matchResults.length} Matches Found
                  </h2>
                  <Button
                    onClick={loadAIContext}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>

                {matchResults.map((result, idx) => (
                  <motion.div
                    key={result.profile._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <MatchResultCard
                      profile={result.profile}
                      matchScore={result.score}
                      matchReason={result.reason}
                      onLike={() => handleLikeMatch(result.profile)}
                      onViewProfile={() => {
                        toast.info("Profile view coming soon!");
                      }}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[600px]"
              >
                <Card className="border border-white/10 bg-white/5 backdrop-blur-xl h-full flex items-center justify-center">
                  <div className="text-center max-w-md px-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-6">
                      <Users className="w-12 h-12 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">
                      Your Matches Will Appear Here
                    </h3>
                    <p className="text-gray-400">
                      Start a conversation with the AI matchmaker to discover
                      compatible profiles tailored to your preferences.
                    </p>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* AI Context Info (Development Only - NOT shown in production) */}
      {typeof window !== "undefined" &&
        aiContext &&
        process.env.NODE_ENV === "development" && (
          <Card className="border border-amber-500/30 bg-amber-500/5 backdrop-blur-xl p-4 mt-6">
            <details className="text-gray-400 text-xs">
              <summary className="cursor-pointer font-semibold mb-2 text-amber-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                AI Context (Development Mode Only)
              </summary>
              <pre className="overflow-auto max-h-40 text-gray-300 bg-black/20 p-3 rounded-lg mt-2 border border-white/5">
                {JSON.stringify(aiContext, null, 2)}
              </pre>
            </details>
          </Card>
        )}
    </div>
  );
}
