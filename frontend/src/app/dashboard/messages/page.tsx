"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Send,
  ArrowLeft,
  MoreVertical,
  Heart,
  Smile,
  Image as ImageIcon,
  Phone,
  Video,
  Info,
} from "lucide-react";
import { motion } from "framer-motion";
import { datingApi, type Conversation, type Message, type UserProfile, type Match, authApi } from "@/lib/api";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

function MessagesPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const matchId = searchParams?.get("match");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock user profiles (in production, these would come from API)
  const [userProfiles, setUserProfiles] = useState<Map<string, UserProfile>>(new Map());

  useEffect(() => {
    loadConversations();
    loadCurrentUser();
  }, []);

  useEffect(() => {
    // Auto-select conversation if match ID is provided
    if (matchId && conversations.length > 0) {
      const conversation = conversations.find((c) => c.match === matchId);
      if (conversation) {
        handleSelectConversation(conversation);
      }
    }
  }, [matchId, conversations]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation._id);
      // Poll for new messages every 3 seconds
      const interval = setInterval(() => {
        loadMessages(selectedConversation._id, true);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadCurrentUser = async () => {
    try {
      const userData = await authApi.getMe();
      setCurrentUserId(userData._id || "");
    } catch (error) {
      console.error("Failed to load current user:", error);
    }
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await datingApi.getConversations();
      setConversations(data);
    } catch (error) {
      console.error("Failed to load conversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string, silent = false) => {
    try {
      const data = await datingApi.getMessages(conversationId, { limit: 50 });
      setMessages(data);
    } catch (error) {
      if (!silent) {
        console.error("Failed to load messages:", error);
        toast.error("Failed to load messages");
      }
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    // Update URL without causing a full page reload
    const newSearchParams = new URLSearchParams(searchParams?.toString());
    newSearchParams.set("match", conversation.match);
    router.replace(`/dashboard/messages?${newSearchParams.toString()}`, { scroll: false });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    const messageText = newMessage.trim();
    setNewMessage("");
    setSending(true);

    try {
      const message = await datingApi.sendMessage(selectedConversation._id, {
        text: messageText,
        type: "text",
      });

      setMessages((prev) => [...prev, message]);
      toast.success("Message sent!");
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
      setNewMessage(messageText); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getOtherUserId = (conversation: Conversation) => {
    return conversation.participants.find((id) => id !== currentUserId);
  };

  const formatMessageTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "";
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 text-purple-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-400">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row gap-0 -mt-8 -mx-4 md:-mx-6">
      {/* Conversations List */}
      <div
        className={`${
          selectedConversation ? "hidden md:block" : "block"
        } w-full md:w-80 border-r border-white/10 bg-gray-900/50 overflow-y-auto`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm border-b border-white/10 p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">Messages</h1>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>
          {conversations.length > 0 && (
            <p className="text-sm text-gray-400">{conversations.length} conversation{conversations.length !== 1 ? "s" : ""}</p>
          )}
        </div>

        {/* Conversations */}
        <div className="divide-y divide-white/5">
          {conversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">No conversations yet</p>
              <p className="text-sm text-gray-500">
                Start matching with people to begin chatting!
              </p>
              <Button
                className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                onClick={() => router.push("/dashboard/discover")}
              >
                Find Matches
              </Button>
            </div>
          ) : (
            conversations.map((conversation) => {
              const otherUserId = getOtherUserId(conversation);
              const isSelected = selectedConversation?._id === conversation._id;

              return (
                <motion.div
                  key={conversation._id}
                  whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                  onClick={() => handleSelectConversation(conversation)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected ? "bg-purple-500/10 border-l-2 border-purple-500" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500">
                      <div className="w-full h-full flex items-center justify-center text-white font-semibold">
                        {otherUserId?.slice(0, 2).toUpperCase()}
                      </div>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-white truncate">
                          Match {conversation.match.slice(-6)}
                        </p>
                        {conversation.lastMessageAt && (
                          <span className="text-xs text-gray-400">
                            {formatMessageTime(conversation.lastMessageAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 truncate">
                        Tap to start chatting...
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${selectedConversation ? "flex" : "hidden md:flex"} flex-1 flex-col bg-gray-900/30`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-gray-900/95 backdrop-blur-sm border-b border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setSelectedConversation(null)}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <Avatar className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500">
                    <div className="w-full h-full flex items-center justify-center text-white font-semibold">
                      {getOtherUserId(selectedConversation)?.slice(0, 2).toUpperCase()}
                    </div>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-white">
                      Match {selectedConversation.match.slice(-6)}
                    </p>
                    <p className="text-xs text-gray-400">Online</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                    <Phone className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                    <Video className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                    <Info className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <Heart className="w-16 h-16 text-pink-500 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Start the conversation!
                  </h3>
                  <p className="text-gray-400 max-w-sm">
                    Say hi and break the ice. Great connections start with great conversations.
                  </p>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isOwn = message.sender === currentUserId;
                  const showAvatar = index === 0 || messages[index - 1].sender !== message.sender;

                  return (
                    <motion.div
                      key={message._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {showAvatar && !isOwn && (
                        <Avatar className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500">
                          <div className="w-full h-full flex items-center justify-center text-white text-xs font-semibold">
                            {message.sender.slice(0, 2).toUpperCase()}
                          </div>
                        </Avatar>
                      )}
                      {!showAvatar && !isOwn && <div className="w-8" />}
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          isOwn
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-sm"
                            : "bg-white/10 text-white rounded-bl-sm"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isOwn ? "text-white/70" : "text-gray-400"
                          }`}
                        >
                          {formatMessageTime(message.sentAt)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-gray-900/95 backdrop-blur-sm border-t border-white/10 p-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white"
                >
                  <Smile className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white"
                >
                  <ImageIcon className="w-5 h-5" />
                </Button>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  disabled={sending}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <MessageCircle className="w-20 h-20 text-gray-600 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Select a conversation</h2>
            <p className="text-gray-400">
              Choose a match from the list to start chatting
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <MessageCircle className="w-12 h-12 text-purple-500 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      }
    >
      <MessagesPageContent />
    </Suspense>
  );
}
