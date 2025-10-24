import { useReadContract, useAccount, useChainId } from "wagmi";
import { formatUnits } from "viem";
import { PYUSD_ADDRESSES, ERC20_ABI, ChainId } from "@/config/contracts";

export function useTokenBalance(tokenAddress?: `0x${string}`) {
  const { address } = useAccount();
  const chainId = useChainId() as ChainId;

  // Use PYUSD by default if no token address provided
  const targetToken = tokenAddress || PYUSD_ADDRESSES[chainId];

  const { data: balance, isLoading, isError, refetch } = useReadContract({
    address: targetToken,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!targetToken,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  const { data: decimals } = useReadContract({
    address: targetToken,
    abi: ERC20_ABI,
    functionName: "decimals",
    query: {
      enabled: !!targetToken,
    },
  });

  const { data: symbol } = useReadContract({
    address: targetToken,
    abi: ERC20_ABI,
    functionName: "symbol",
    query: {
      enabled: !!targetToken,
    },
  });

  // Format balance for display
  const formattedBalance = balance && decimals
    ? formatUnits(balance, decimals)
    : "0";

  return {
    balance: balance || BigInt(0),
    formattedBalance,
    decimals: decimals || 6,
    symbol: symbol || "PYUSD",
    isLoading,
    isError,
    refetch,
  };
}
