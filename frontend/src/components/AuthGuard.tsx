"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Gates the dashboard on the server session established by SIWE.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      if (cancelled) return;
      if (!authenticated) {
        router.replace("/login");
      } else {
        setIsLoading(false);
      }
    };

    void checkAuth();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
