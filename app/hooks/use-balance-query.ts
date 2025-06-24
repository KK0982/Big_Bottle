import { useQuery } from "@tanstack/react-query";
import { useConnex } from "@vechain/dapp-kit-react";
import { Addresses } from "./consts";
import { QueryKeys, createQueryOptions, handleQueryError } from "./query-utils";
import type { TokenBalance, TokenBalanceRaw } from "../types";
import { tokenBalanceUtils, createEmptyBalance } from "../utils/token-balance";

export function useBalanceQuery(address?: string) {
  const connex = useConnex();

  const fetchBalance = async (targetAddress: string): Promise<TokenBalance> => {
    if (!connex || !targetAddress) return createEmptyBalance();

    try {
      const [b3trResult, vot3Result] = await Promise.all([
        connex.thor
          .account(Addresses.B3TR)
          .method({
            inputs: [{ name: "account", type: "address" }],
            name: "balanceOf",
            outputs: [{ name: "balance", type: "uint256" }],
          })
          .call(targetAddress),
        connex.thor
          .account(Addresses.VOT3)
          .method({
            inputs: [{ name: "account", type: "address" }],
            name: "balanceOf",
            outputs: [{ name: "balance", type: "uint256" }],
          })
          .call(targetAddress),
      ]);

      // Create raw balance first
      const rawBalance: TokenBalanceRaw = {
        b3tr: BigInt(b3trResult.decoded.balance),
        vot3: BigInt(vot3Result.decoded.balance),
      };

      // Convert to display format
      return tokenBalanceUtils.formatBalance(rawBalance);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to fetch balance";
      console.error("Error fetching balance:", err);
      throw new Error(errorMsg);
    }
  };

  const {
    data: balance = createEmptyBalance(),
    isLoading: loading,
    error,
    refetch,
    isStale,
    dataUpdatedAt,
  } = useQuery({
    ...createQueryOptions<TokenBalance>("BALANCE"),
    queryKey: QueryKeys.balance(address, {
      B3TR: Addresses.B3TR,
      VOT3: Addresses.VOT3,
    }),
    queryFn: () => fetchBalance(address!),
    enabled: !!address && !!connex,
    // Optimize for staking operations - more frequent updates for active staking
    refetchInterval: 30000, // 30 seconds base interval
    refetchIntervalInBackground: false,
  });

  return {
    balance,
    loading,
    error: error ? handleQueryError(error) : null,
    refetch,
    isStale,
    lastUpdated: dataUpdatedAt,
    // Helper methods for staking operations
    hasB3TR: balance.b3tr > 0,
    hasVOT3: balance.vot3 > 0,
    totalValue: balance.b3tr + balance.vot3,
  };
}
