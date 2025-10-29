import { useQuery } from "@tanstack/react-query";
import { useConnex } from "@vechain/dapp-kit-react";
import { Addresses } from "./consts";
import { QueryKeys, createQueryOptions, handleQueryError } from "./query-utils";
import type { TokenBalance } from "../types";
import { createEmptyBalance } from "../utils/token-balance";

export function useBalanceQuery(address?: string) {
  const connex = useConnex();

  const fetchBalance = async (targetAddress: string): Promise<TokenBalance> => {
    if (!connex || !targetAddress) return createEmptyBalance();

    try {
      // 并行查询所有余额信息
      const [b3trResult, vot3Result, convertedB3trResult] = await Promise.all([
        // B3TR 余额
        connex.thor
          .account(Addresses.B3TR)
          .method({
            inputs: [{ name: "account", type: "address" }],
            name: "balanceOf",
            outputs: [{ name: "balance", type: "uint256" }],
          })
          .call(targetAddress),

        // VOT3 余额
        connex.thor
          .account(Addresses.VOT3)
          .method({
            inputs: [{ name: "account", type: "address" }],
            name: "balanceOf",
            outputs: [{ name: "balance", type: "uint256" }],
          })
          .call(targetAddress),

        // 已转换的 B3TR 余额
        connex.thor
          .account(Addresses.VOT3)
          .method({
            inputs: [{ name: "account", type: "address" }],
            name: "convertedB3trOf",
            outputs: [{ name: "balance", type: "uint256" }],
          })
          .call(targetAddress),
      ]);

      // 构建完整的余额对象
      const balance = createEmptyBalance();

      // 原始余额
      balance.b3tr = BigInt(b3trResult.decoded.balance);
      balance.vot3 = BigInt(vot3Result.decoded.balance);
      balance.convertedB3tr = BigInt(convertedB3trResult.decoded.balance);

      // 计算可用余额
      balance.availableB3tr = balance.b3tr + balance.convertedB3tr;
      balance.availableVot3 = balance.vot3 - balance.convertedB3tr;

      return balance;
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
  };
}
