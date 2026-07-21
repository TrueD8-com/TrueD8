"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Legacy SIWE entry — primary auth is email OTP at /login.
 * Wallet connect happens in-place via WalletRequiredGate where Web3 is needed.
 */
export default function SiweRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Redirecting to email sign-in…</p>
      </div>
    </div>
  );
}
