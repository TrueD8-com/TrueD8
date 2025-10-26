"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Heart, User, Calendar, Trophy, LogOut, Home, Sparkles, ThumbsUp, Bot, Loader2, MessageCircle, Crown } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/siwe";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/dashboard/discover", icon: Sparkles, label: "Discover" },
  { href: "/dashboard/ai-match", icon: Bot, label: "AI Match" },
  { href: "/dashboard/likes", icon: ThumbsUp, label: "Likes" },
  { href: "/dashboard/matches", icon: Heart, label: "Matches" },
  { href: "/dashboard/messages", icon: MessageCircle, label: "Messages" },
  { href: "/dashboard/events", icon: Calendar, label: "Events" },
  { href: "/dashboard/rewards", icon: Trophy, label: "Rewards" },
  { href: "/dashboard/premium", icon: Crown, label: "Premium" },
  { href: "/dashboard/profile", icon: User, label: "Profile" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent double calls

    try {
      setIsLoggingOut(true);
      await logout();
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to logout");
      setIsLoggingOut(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-950">
        {/* Background */}
        <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950" />
        <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-5" />

        {/* Navigation */}
        <nav className="fixed top-0 w-full bg-gray-950/80 backdrop-blur-xl border-b border-white/10 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white fill-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                TrueD8
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                disabled={isLoggingOut}
                className="text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4 mr-2" />
                )}
                {isLoggingOut ? "Logging out..." : "Logout"}
              </Button>
            </div>
          </div>
        </nav>

        <div className="flex pt-16">
          {/* Sidebar */}
          <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r border-white/10 bg-gray-950/50 backdrop-blur-sm p-4 hidden md:block">
            <nav className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      whileHover={{ x: 5 }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 md:ml-64 relative">
            <div className="container mx-auto px-4 py-8">{children}</div>
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-gray-950/90 backdrop-blur-xl border-t border-white/10 md:hidden z-50">
          <div className="flex justify-around items-center h-16 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className="flex-1">
                  <div
                    className={`flex flex-col items-center gap-1 py-2 ${
                      isActive ? "text-purple-400" : "text-gray-400"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-xs">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </AuthGuard>
  );
}
