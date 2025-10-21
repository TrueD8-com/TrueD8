"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles, User, Bot, Wand2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  suggestedPrompts?: string[];
}

export default function ChatInterface({
  messages,
  onSendMessage,
  isLoading = false,
  suggestedPrompts = [
    "Find me someone who loves hiking and outdoor adventures",
    "I'm looking for a creative partner who enjoys art and music",
    "Match me with someone passionate about technology and innovation",
    "Find someone who values deep conversations and intellectual connection",
  ],
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    onSendMessage(prompt);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <AnimatePresence mode="popLayout">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-8"
            >
              {/* Hero Section */}
              <div className="mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/50"
                >
                  <Wand2 className="w-12 h-12 text-white" />
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold text-white mb-3"
                >
                  AI Matchmaker
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-400 mb-2 max-w-md mx-auto leading-relaxed"
                >
                  Describe your ideal match in natural language
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm text-gray-500 max-w-md mx-auto"
                >
                  Our AI will analyze your preferences and find compatible matches
                </motion.p>
              </div>

              {/* Suggested Prompts */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-gray-400">
                    Try these suggestions
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3 max-w-2xl mx-auto">
                  {suggestedPrompts.map((prompt, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + idx * 0.1 }}
                    >
                      <Button
                        onClick={() => handleSuggestedPrompt(prompt)}
                        variant="outline"
                        className="w-full border-white/10 bg-gradient-to-r from-white/5 to-white/0 hover:from-purple-500/10 hover:to-pink-500/10 hover:border-purple-500/30 text-gray-300 hover:text-white text-left h-auto py-4 px-5 transition-all duration-300 group"
                      >
                        <div className="flex items-center gap-4 w-full">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 group-hover:from-purple-500/30 group-hover:to-pink-500/30 flex items-center justify-center flex-shrink-0 transition-all">
                            <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0" />
                          </div>
                          <span className="text-sm leading-relaxed flex-1 text-left">
                            {prompt}
                          </span>
                        </div>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          ) : (
            messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-4 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="flex flex-col gap-2 max-w-[75%]">
                  <Card
                    className={`p-4 shadow-lg ${
                      message.role === "user"
                        ? "border-purple-500/30 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl"
                        : "border-white/10 bg-white/5 backdrop-blur-xl"
                    }`}
                  >
                    <p className="text-gray-100 text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </Card>
                  <p className="text-xs text-gray-500 px-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {message.role === "user" && (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </motion.div>
            ))
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 justify-start"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <Card className="border-white/10 bg-white/5 backdrop-blur-xl p-4 shadow-lg">
                <div className="flex gap-2 items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-bounce" />
                  <div
                    className="w-2.5 h-2.5 rounded-full bg-pink-400 animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <div
                    className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  />
                  <span className="text-xs text-gray-400 ml-2">AI is thinking...</span>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-white/10 bg-gradient-to-b from-transparent to-black/30 backdrop-blur-sm p-6">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Describe your ideal match... (Press Enter to send, Shift+Enter for new line)"
              disabled={isLoading}
              className="resize-none border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all rounded-xl"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-2 px-1">
              Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded">Enter</kbd> to send, or{" "}
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded">Shift+Enter</kbd> for new line
            </p>
          </div>
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="lg"
            className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 text-white h-auto px-6 py-3 rounded-xl shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
