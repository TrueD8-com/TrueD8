"use client";

import { useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Heart, Shield, Check, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { siweAuthenticate, isAuthenticated } from "@/lib/siwe";

export default function SIWEPage() {
  const router = useRouter();
  const { address, isConnected, chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    isAuthenticated().then((authenticated) => {
      if (authenticated) {
        router.push("/dashboard");
      }
    });
  }, [router]);

  const handleSignIn = async () => {
    if (!address || !chainId) {
      setError("Wallet not connected properly");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await siweAuthenticate(address, chainId, async (message: string) => {
        // Use window.ethereum directly instead of wagmi's signMessageAsync
        if (typeof window.ethereum !== "undefined") {
          try {
            const signature = await window.ethereum.request({
              method: "personal_sign",
              params: [message, address],
            });
            return signature as string;
          } catch (err) {
            throw new Error("User rejected the signature request");
          }
        } else {
          // Fallback to wagmi if window.ethereum is not available
          const signature = await signMessageAsync({
            message,
            account: address
          });
          return signature;
        }
      });

      setAuthSuccess(true);

      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      console.error("Sign in error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to sign in. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-purple-950/50 to-gray-950" />
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10" />

      {/* Floating orbs */}
      <div className="fixed top-20 left-20 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
      <div
        className="fixed bottom-20 right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      <div className="relative z-10 w-full max-w-md">
        <Link href="https://trued8.com" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-xl flex items-center justify-center">
            <Heart className="w-7 h-7 text-white fill-white" />
          </div>
          <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
            TrueD8
          </span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border border-white/10 bg-white/5 backdrop-blur-xl p-8">
            <div className="text-center mb-8">
              <Badge className="bg-white/10 backdrop-blur-sm text-purple-300 border-purple-500/30 mb-4">
                Secure Authentication
              </Badge>
              <h1 className="text-3xl font-bold text-white mb-2">
                Sign In with Ethereum
              </h1>
              <p className="text-gray-400">
                Connect your wallet and sign to authenticate securely
              </p>
            </div>

            {!isConnected ? (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                    <Shield className="w-5 h-5 text-purple-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        Blockchain Verified
                      </p>
                      <p className="text-xs text-gray-400">
                        Your wallet is your identity
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        No Passwords
                      </p>
                      <p className="text-xs text-gray-400">
                        Sign with your wallet, no email required
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  <ConnectButton />
                </div>

                <p className="text-xs text-gray-500 text-center">
                  By connecting, you agree to our Terms of Service and Privacy
                  Policy
                </p>
              </div>
            ) : !authSuccess ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">
                      Wallet Connected
                    </p>
                    <p className="text-xs text-gray-400 truncate">{address}</p>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30"
                  >
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-300">
                        Authentication Error
                      </p>
                      <p className="text-xs text-red-400 mt-1">{error}</p>
                    </div>
                  </motion.div>
                )}

                <Button
                  onClick={handleSignIn}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5 mr-2" />
                      Sign Message to Continue
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <ConnectButton />
                </div>

                <div className="pt-4 border-t border-white/10">
                  <p className="text-xs text-gray-400 text-center mb-3">
                    What happens when you sign:
                  </p>
                  <ol className="text-xs text-gray-500 space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 font-mono">1.</span>
                      <span>We request a unique nonce from our server</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 font-mono">2.</span>
                      <span>Your wallet signs a message proving ownership</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 font-mono">3.</span>
                      <span>
                        Server verifies and creates your secure session
                      </span>
                    </li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="space-y-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto"
                >
                  <Check className="w-10 h-10 text-white" />
                </motion.div>

                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Successfully Authenticated!
                  </h2>
                  <p className="text-gray-400">
                    Redirecting to your dashboard...
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                  <span className="text-sm text-gray-400">
                    Loading dashboard
                  </span>
                </div>
              </div>
            )}
          </Card>

          <p className="text-center text-gray-500 text-sm mt-6">
            <Link
              href="https://trued8.com"
              className="hover:text-purple-400 transition-colors inline-flex items-center gap-1"
            >
              ← Back to Home
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
