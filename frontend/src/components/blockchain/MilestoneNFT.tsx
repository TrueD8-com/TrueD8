"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAvailExecute } from "@/hooks/useAvailExecute";
import { useAccount } from "wagmi";
import { SUPPORTED_CHAINS } from "@/config/contracts";
import { Trophy, Lock, CheckCircle2, Sparkles, Loader2, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface Milestone {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  image: string; // IPFS URL or placeholder
  unlocked: boolean;
  minted: boolean;
  mintedChain?: number;
  mintTxHash?: string;
}

interface MilestoneNFTProps {
  userPoints: number;
  milestones: Milestone[];
  onMilestoneUnlocked?: (milestoneId: string) => void;
}

export function MilestoneNFT({ userPoints, milestones, onMilestoneUnlocked }: MilestoneNFTProps) {
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [selectedChain, setSelectedChain] = useState<number>(84532); // Base Sepolia default
  const [mintModalOpen, setMintModalOpen] = useState(false);
  const { address } = useAccount();
  const { transfer, isExecuting, executionHash, executionSteps } = useAvailExecute();

  const getRarityColor = (rarity: Milestone["rarity"]) => {
    switch (rarity) {
      case "legendary":
        return "from-yellow-500 via-orange-500 to-red-500";
      case "epic":
        return "from-purple-500 via-pink-500 to-purple-500";
      case "rare":
        return "from-blue-500 via-cyan-500 to-blue-500";
      default:
        return "from-gray-500 via-gray-400 to-gray-500";
    }
  };

  const getRarityBadgeColor = (rarity: Milestone["rarity"]) => {
    switch (rarity) {
      case "legendary":
        return "bg-yellow-500/20 text-yellow-300";
      case "epic":
        return "bg-purple-500/20 text-purple-300";
      case "rare":
        return "bg-blue-500/20 text-blue-300";
      default:
        return "bg-gray-500/20 text-gray-300";
    }
  };

  const handleMintClick = (milestone: Milestone) => {
    if (!milestone.unlocked) {
      toast.error("Milestone not unlocked yet!");
      return;
    }

    if (milestone.minted) {
      toast.info("Already minted on " + SUPPORTED_CHAINS.find(c => c.id === milestone.mintedChain)?.name);
      return;
    }

    setSelectedMilestone(milestone);
    setMintModalOpen(true);
  };

  const handleMint = async () => {
    if (!selectedMilestone || !address) return;

    try {
      // In production: Backend verifies user earned this milestone
      // For demo: simulate the verification
      console.log("Verifying milestone eligibility...");

      // Use Avail Nexus to mint NFT on user's chosen chain
      // For demo, we're using transfer to send to NFT contract
      // In production, this would be Bridge & Execute to call mint()

      const MILESTONE_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000003" as `0x${string}`;

      await transfer({
        token: "USDC",
        amount: "0.01", // Small minting fee
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        chainId: selectedChain as any,
        recipient: MILESTONE_CONTRACT_ADDRESS,
      });

      toast.success("Milestone NFT minted! 🎉", {
        description: `Minted "${selectedMilestone.name}" on ${SUPPORTED_CHAINS.find(c => c.id === selectedChain)?.name}`,
      });

      // In production: Update backend to mark as minted
      console.log("Milestone minted:", {
        milestoneId: selectedMilestone.id,
        chain: selectedChain,
        txHash: executionHash,
        address,
      });

      // Update local state (in production, refetch from backend)
      if (onMilestoneUnlocked) {
        onMilestoneUnlocked(selectedMilestone.id);
      }

      // Close modal after short delay
      setTimeout(() => {
        setMintModalOpen(false);
        setSelectedMilestone(null);
      }, 2000);

    } catch (error) {
      console.error("Minting failed:", error);
      toast.error("Minting failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Achievement Milestones
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Mint NFTs on any chain for your achievements
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-purple-400">{userPoints}</div>
            <div className="text-xs text-gray-500">Total Points</div>
          </div>
        </div>

        {/* Milestones Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {milestones.map((milestone, idx) => {
            const isUnlocked = milestone.unlocked || userPoints >= milestone.pointsRequired;
            const pointsNeeded = milestone.pointsRequired - userPoints;

            return (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className={`
                  relative overflow-hidden border
                  ${milestone.minted
                    ? "border-green-500/50 bg-gradient-to-br from-green-500/10 to-emerald-500/10"
                    : isUnlocked
                      ? "border-purple-500/50 bg-gradient-to-br from-purple-500/10 to-pink-500/10"
                      : "border-white/10 bg-white/5"
                  }
                  backdrop-blur-xl hover:border-purple-500/50 transition-all
                `}>

                  {/* Rarity Gradient Overlay */}
                  {isUnlocked && (
                    <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(milestone.rarity)} opacity-5`} />
                  )}

                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <span className="text-2xl">{milestone.icon}</span>
                          {milestone.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {milestone.description}
                        </CardDescription>
                      </div>
                      <Badge className={getRarityBadgeColor(milestone.rarity)}>
                        {milestone.rarity}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {/* Points Requirement */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-400">Required Points</span>
                        <span className="font-bold text-white">{milestone.pointsRequired}</span>
                      </div>
                      {!isUnlocked && (
                        <div className="text-xs text-red-400">
                          Need {pointsNeeded} more points
                        </div>
                      )}
                    </div>

                    {/* Image Preview */}
                    <div className="mb-4 rounded-lg overflow-hidden bg-white/5 aspect-square flex items-center justify-center">
                      {isUnlocked ? (
                        <div className="text-6xl">{milestone.icon}</div>
                      ) : (
                        <Lock className="w-12 h-12 text-gray-600" />
                      )}
                    </div>

                    {/* Action Button */}
                    {milestone.minted ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-green-400">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Minted on {SUPPORTED_CHAINS.find(c => c.id === milestone.mintedChain)?.name}</span>
                        </div>
                        {milestone.mintTxHash && (
                          <Button variant="outline" size="sm" className="w-full">
                            <ExternalLink className="w-3 h-3 mr-2" />
                            View on Explorer
                          </Button>
                        )}
                      </div>
                    ) : isUnlocked ? (
                      <Button
                        onClick={() => handleMintClick(milestone)}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Mint NFT
                      </Button>
                    ) : (
                      <Button disabled className="w-full">
                        <Lock className="w-4 h-4 mr-2" />
                        Locked
                      </Button>
                    )}

                    {/* Avail Badge */}
                    {isUnlocked && !milestone.minted && (
                      <div className="mt-2 text-xs text-center text-purple-400">
                        Mint on any chain via Avail Nexus
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Mint Modal */}
      <Dialog open={mintModalOpen} onOpenChange={setMintModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Mint Achievement NFT
            </DialogTitle>
            <DialogDescription>
              Choose which chain to mint your achievement NFT on
            </DialogDescription>
          </DialogHeader>

          {selectedMilestone && (
            <div className="space-y-4">
              {/* Milestone Preview */}
              <Card className="border border-white/10 bg-white/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{selectedMilestone.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white">{selectedMilestone.name}</h3>
                      <p className="text-sm text-gray-400">{selectedMilestone.description}</p>
                      <Badge className={`mt-1 ${getRarityBadgeColor(selectedMilestone.rarity)}`}>
                        {selectedMilestone.rarity}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Chain Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Chain</label>
                <Select
                  value={selectedChain.toString()}
                  onValueChange={(value) => setSelectedChain(Number(value))}
                  disabled={isExecuting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_CHAINS.filter(c => c.network === "testnet").map((chain) => (
                      <SelectItem key={chain.id} value={chain.id.toString()}>
                        <div className="flex items-center gap-2">
                          <span>{chain.icon}</span>
                          <span>{chain.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Your NFT will be minted on {SUPPORTED_CHAINS.find(c => c.id === selectedChain)?.name}
                </p>
              </div>

              {/* Progress Steps */}
              {isExecuting && executionSteps.length > 0 && (
                <Card className="border border-blue-500/30 bg-blue-500/10">
                  <CardContent className="p-4">
                    <div className="text-sm font-medium mb-3 text-blue-300">
                      Minting via Avail Nexus...
                    </div>
                    <div className="space-y-2">
                      {executionSteps.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          {step.status === "completed" ? (
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                          ) : (
                            <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                          )}
                          <span className="text-gray-300">{step.label || step.typeID}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Info Box */}
              <div className="rounded-lg bg-purple-500/10 border border-purple-500/30 p-3">
                <div className="text-sm text-purple-300">
                  <p className="font-medium mb-1">How it works:</p>
                  <ul className="text-xs space-y-1 text-gray-400">
                    <li>• Avail Nexus bridges payment to your chosen chain</li>
                    <li>• NFT contract automatically mints to your address</li>
                    <li>• Your achievement is permanently on-chain</li>
                    <li>• Display in any wallet or marketplace</li>
                  </ul>
                </div>
              </div>

              {/* Mint Fee */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Minting Fee</span>
                <span className="font-medium text-white">0.01 USDC</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setMintModalOpen(false)}
                  disabled={isExecuting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleMint}
                  disabled={isExecuting || !address}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Minting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Mint NFT
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
