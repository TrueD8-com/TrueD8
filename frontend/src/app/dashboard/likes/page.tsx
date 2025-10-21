"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Star, Sparkles, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { datingApi, Like } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function LikesPage() {
  const [sentLikes, setSentLikes] = useState<Like[]>([]);
  const [receivedLikes, setReceivedLikes] = useState<Like[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadLikes();
  }, []);

  const loadLikes = async () => {
    try {
      setLoading(true);
      const [sent, received] = await Promise.all([
        datingApi.getLikesSent(),
        datingApi.getLikesReceived(),
      ]);
      setSentLikes(sent);
      setReceivedLikes(received);
    } catch (err) {
      console.error("Failed to load likes:", err);
      toast.error("Failed to load likes");
    } finally {
      setLoading(false);
    }
  };

  const handleLikeBack = async (userId: string) => {
    try {
      const result = await datingApi.likeUser(userId);
      if (result.matchId) {
        toast.success("It's a match! 🎉");
        router.push("/dashboard/matches");
      } else {
        toast.success("Like sent!");
      }
      loadLikes();
    } catch (err) {
      console.error("Failed to like:", err);
      toast.error("Failed to like");
    }
  };

  if (loading) {
    return (
      <div className="pb-20 md:pb-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Likes
          </h1>
          <p className="text-gray-400">Loading...</p>
        </div>
        <Card className="border border-white/10 bg-white/5 backdrop-blur-xl p-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mx-auto" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="pb-20 md:pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Likes
        </h1>
        <p className="text-gray-400">
          See who you&apos;ve liked and who likes you
        </p>
      </motion.div>

      <Tabs defaultValue="received" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
          <TabsTrigger value="received">
            Received ({receivedLikes.length})
          </TabsTrigger>
          <TabsTrigger value="sent">
            Sent ({sentLikes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received">
          {receivedLikes.length === 0 ? (
            <Card className="border border-white/10 bg-white/5 backdrop-blur-xl p-12">
              <div className="text-center max-w-md mx-auto">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-10 h-10 text-pink-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  No Likes Yet
                </h2>
                <p className="text-gray-400 mb-8">
                  Keep swiping! Someone will like you soon.
                </p>
                <Button
                  onClick={() => router.push("/dashboard/discover")}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Discovering
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {receivedLikes.map((like, i) => (
                <motion.div
                  key={like._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                >
                  <Card className="border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden hover:bg-white/10 transition-all">
                    <div className="relative h-64 bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <Heart className="w-16 h-16 text-pink-400 mx-auto mb-4" />
                          <p className="text-white font-semibold">
                            Someone likes you!
                          </p>
                        </div>
                      </div>

                      {like.isSuperLike && (
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
                            <Star className="w-3 h-3 mr-1" />
                            Super Like
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <p className="text-sm text-gray-400 mb-4">
                        {new Date(like.createdAt).toLocaleDateString()}
                      </p>
                      <Button
                        onClick={() => handleLikeBack(like.liker)}
                        className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white"
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Like Back
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent">
          {sentLikes.length === 0 ? (
            <Card className="border border-white/10 bg-white/5 backdrop-blur-xl p-12">
              <div className="text-center max-w-md mx-auto">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-6">
                  <UserPlus className="w-10 h-10 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  No Likes Sent
                </h2>
                <p className="text-gray-400 mb-8">
                  Start liking profiles to see them here!
                </p>
                <Button
                  onClick={() => router.push("/dashboard/discover")}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Discovering
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sentLikes.map((like, i) => (
                <motion.div
                  key={like._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                >
                  <Card className="border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
                    <div className="relative h-64 bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <Heart className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                          <p className="text-white font-semibold">
                            You liked this user
                          </p>
                        </div>
                      </div>

                      {like.isSuperLike && (
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
                            <Star className="w-3 h-3 mr-1" />
                            Super Like
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <p className="text-sm text-gray-400">
                        Sent on {new Date(like.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
