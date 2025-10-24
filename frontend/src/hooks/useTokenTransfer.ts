import { useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi";
import { parseUnits } from "viem";
import { PYUSD_ADDRESSES, ERC20_ABI, ChainId } from "@/config/contracts";
import { useState } from "react";

export function useTokenTransfer(tokenAddress?: `0x${string}`) {
  const chainId = useChainId() as ChainId;
  const targetToken = tokenAddress || PYUSD_ADDRESSES[chainId];
  const [lastTxHash, setLastTxHash] = useState<`0x${string}` | undefined>();

  const {
    data: hash,
    writeContract,
    isPending: isWritePending,
    isError: isWriteError,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: isConfirmError,
  } = useWaitForTransactionReceipt({
    hash: lastTxHash || hash,
  });

  const transfer = async (
    to: `0x${string}`,
    amount: string,
    decimals: number = 6
  ) => {
    try {
      const parsedAmount = parseUnits(amount, decimals);
      await writeContract({
        address: targetToken,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [to, parsedAmount],
      });
      if (hash) {
        setLastTxHash(hash);
        return hash;
      }
    } catch (error) {
      console.error("Transfer error:", error);
      throw error;
    }
  };

  const approve = async (
    spender: `0x${string}`,
    amount: string,
    decimals: number = 6
  ) => {
    try {
      const parsedAmount = parseUnits(amount, decimals);
      await writeContract({
        address: targetToken,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [spender, parsedAmount],
      });
      if (hash) {
        setLastTxHash(hash);
        return hash;
      }
    } catch (error) {
      console.error("Approve error:", error);
      throw error;
    }
  };

  return {
    transfer,
    approve,
    hash: lastTxHash || hash,
    isPending: isWritePending || isConfirming,
    isConfirmed,
    isError: isWriteError || isConfirmError,
    error: writeError,
  };
}
