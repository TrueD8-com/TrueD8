"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Heart, Mail, Shield, Loader2, AlertCircle, Check, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  isAuthenticated,
  isValidEmail,
  isValidOtpCode,
  normalizeEmail,
  requestEmailOtp,
  sanitizeOtpCode,
  verifyEmailOtp,
} from "@/lib/auth";

const RESEND_COOLDOWN_SECONDS = 60;
const GENERIC_ERROR =
  "Something went wrong. Please try again in a moment.";

type Step = "email" | "otp" | "success";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [emailHint, setEmailHint] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let cancelled = false;
    isAuthenticated().then((authenticated) => {
      if (!cancelled && authenticated) {
        router.replace("/dashboard");
      }
    });
    return () => {
      cancelled = true;
      abortRef.current?.abort();
    };
  }, [router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setInterval(() => {
      setCooldown((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [cooldown]);

  const startCooldown = useCallback(() => {
    setCooldown(RESEND_COOLDOWN_SECONDS);
  }, []);

  const handleRequestOtp = async (e?: FormEvent) => {
    e?.preventDefault();
    if (isLoading) return;

    const normalized = normalizeEmail(email);
    if (!isValidEmail(normalized)) {
      setError("Enter a valid email address");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const { emailHint: hint } = await requestEmailOtp(normalized);
      setEmail(normalized);
      setEmailHint(hint);
      setOtp("");
      setStep("otp");
      startCooldown();
    } catch (err) {
      setError(err instanceof Error ? err.message : GENERIC_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: FormEvent) => {
    e?.preventDefault();
    if (isLoading) return;

    const code = sanitizeOtpCode(otp);
    if (!isValidOtpCode(code)) {
      setError("Enter the 6-digit code from your email");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await verifyEmailOtp(email, code);
      setOtp(""); // clear sensitive code from UI state ASAP
      setStep("success");
      window.setTimeout(() => {
        router.replace("/dashboard");
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : GENERIC_ERROR);
      setOtp("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isLoading) return;
    await handleRequestOtp();
  };

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-purple-950/50 to-gray-950" />
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10" />
      <div className="fixed top-20 left-20 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
      <div
        className="fixed bottom-20 right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      <div className="relative z-10 w-full max-w-md">
        <Link
          href="https://trued8.com"
          className="flex items-center justify-center gap-2 mb-8"
        >
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
                Secure sign-in
              </Badge>
              <h1 className="text-3xl font-bold text-white mb-2">
                {step === "success"
                  ? "You're in"
                  : step === "otp"
                    ? "Enter your code"
                    : "Sign in with email"}
              </h1>
              <p className="text-gray-400">
                {step === "email" &&
                  "We'll send a one-time code. No wallet required to start."}
                {step === "otp" &&
                  `Code sent to ${emailHint || "your email"}. Wallet can be linked later for Web3 features.`}
                {step === "success" && "Redirecting to your dashboard…"}
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 mb-6"
                role="alert"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </motion.div>
            )}

            {step === "email" && (
              <form onSubmit={handleRequestOtp} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    spellCheck={false}
                    autoCapitalize="none"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                    }}
                    placeholder="you@example.com"
                    className="bg-white/5 border-white/10 text-white h-11"
                    disabled={isLoading}
                  />
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <Shield className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <p className="text-xs text-gray-400">
                    Codes expire quickly. Never share your code. Wallet connect
                    stays optional for staking, NFTs, and payments.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Sending code…
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5 mr-2" />
                      Continue with email
                    </>
                  )}
                </Button>
              </form>
            )}

            {step === "otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-gray-300">
                    One-time code
                  </Label>
                  <Input
                    id="otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="one-time-code"
                    autoCorrect="off"
                    spellCheck={false}
                    autoFocus
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => {
                      setOtp(sanitizeOtpCode(e.target.value));
                      setError(null);
                    }}
                    placeholder="••••••"
                    className="bg-white/5 border-white/10 text-white h-12 text-center text-2xl tracking-[0.4em] font-mono"
                    disabled={isLoading}
                    aria-describedby="otp-help"
                  />
                  <p id="otp-help" className="text-xs text-gray-500">
                    Enter the 6-digit code. It will not be stored in this browser.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !isValidOtpCode(sanitizeOtpCode(otp))}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Verifying…
                    </>
                  ) : (
                    "Verify and continue"
                  )}
                </Button>

                <div className="flex items-center justify-between gap-2 text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setOtp("");
                      setError(null);
                    }}
                    className="text-gray-400 hover:text-white inline-flex items-center gap-1"
                    disabled={isLoading}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Change email
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isLoading || cooldown > 0}
                    className="text-purple-300 hover:text-purple-200 disabled:text-gray-600 disabled:cursor-not-allowed"
                  >
                    {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                  </button>
                </div>
              </form>
            )}

            {step === "success" && (
              <div className="space-y-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto"
                >
                  <Check className="w-10 h-10 text-white" />
                </motion.div>
                <div className="flex items-center justify-center gap-2 text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading dashboard</span>
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
