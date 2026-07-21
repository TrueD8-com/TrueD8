"use client";

import { useCallback, useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSignMessage } from "wagmi";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, Wallet, AlertCircle, Check } from "lucide-react";
import { linkWalletToSession } from "@/lib/siwe";
import { authApi } from "@/lib/api";

interface WalletRequiredGateProps {
  children: React.ReactNode;
  /** Short explanation of why a wallet is needed */
  reason?: string;
  title?: string;
  className?: string;
}

type GateState = "checking" | "needs_connect" | "needs_link" | "ready" | "error";

/**
 * Soft-gate for Web3-only UI (staking, premium payments, Nexus, NFTs).
 * App login remains email/session — this only connects + proves ownership,
 * then links the wallet to the existing session via /user/wallet/connect.
 */
export function WalletRequiredGate({
  children,
  reason = "This feature needs an on-chain wallet to sign transactions.",
  title = "Connect your wallet",
  className,
}: WalletRequiredGateProps) {
  const { address, isConnected, chainId, connector } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [state, setState] = useState<GateState>("checking");
  const [error, setError] = useState<string | null>(null);
  const [isLinking, setIsLinking] = useState(false);

  const refresh = useCallback(async () => {
    setError(null);
    if (!isConnected || !address) {
      setState("needs_connect");
      return;
    }

    try {
      const profile = await authApi.getMe();
      const linked =
        profile.wallet?.address?.toLowerCase() === address.toLowerCase();
      if (linked) {
        setState("ready");
      } else {
        setState("needs_link");
      }
    } catch {
      // Profile fetch failed — still allow connect-only for client txs,
      // but prefer linking when session is available.
      setState("needs_link");
    }
  }, [address, isConnected]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleLink = async () => {
    if (!address || !chainId || isLinking) return;

    try {
      setIsLinking(true);
      setError(null);

      await linkWalletToSession(
        address,
        chainId,
        async (message: string) => {
          if (typeof window !== "undefined" && window.ethereum) {
            try {
              const signature = await window.ethereum.request({
                method: "personal_sign",
                params: [message, address],
              });
              return signature as string;
            } catch {
              throw new Error("Signature rejected in wallet");
            }
          }
          return signMessageAsync({ message, account: address });
        },
        connector?.name || "wallet"
      );

      setState("ready");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not link wallet. Please try again."
      );
      setState("error");
    } finally {
      setIsLinking(false);
    }
  };

  if (state === "ready") {
    return <>{children}</>;
  }

  if (state === "checking") {
    return (
      <div className={`flex items-center justify-center py-12 ${className ?? ""}`}>
        <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <Card
      className={`border border-white/10 bg-white/5 backdrop-blur-xl p-6 ${className ?? ""}`}
    >
      <div className="flex flex-col items-center text-center gap-4 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
          <Wallet className="w-6 h-6 text-purple-300" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
          <p className="text-sm text-gray-400">{reason}</p>
        </div>

        <div className="flex items-start gap-2 text-left w-full p-3 rounded-lg bg-white/5 border border-white/10">
          <Shield className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-400">
            You stay signed in with email. Connecting only proves wallet ownership
            for on-chain actions — it does not replace your account.
          </p>
        </div>

        {(state === "error" || error) && (
          <div
            className="flex items-start gap-2 w-full p-3 rounded-lg bg-red-500/10 border border-red-500/30"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-300 text-left">{error}</p>
          </div>
        )}

        {state === "needs_connect" && (
          <div className="pt-2">
            <ConnectButton />
          </div>
        )}

        {(state === "needs_link" || state === "error") && isConnected && (
          <div className="space-y-3 w-full">
            <div className="flex items-center gap-2 justify-center text-xs text-gray-400">
              <Check className="w-3.5 h-3.5 text-green-400" />
              <span className="font-mono truncate max-w-[220px]">{address}</span>
            </div>
            <Button
              onClick={handleLink}
              disabled={isLinking}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
            >
              {isLinking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Confirming ownership…
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Sign to link wallet
                </>
              )}
            </Button>
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
