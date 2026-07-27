"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/** Backwards-compatible redirect to the canonical wallet login route. */
export default function SiweRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Redirecting to wallet sign-in…</p>
      </div>
    </div>
  );
}
