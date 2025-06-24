import { useQuery } from "@tanstack/react-query";
import { useConnex } from "@vechain/dapp-kit-react";
import { Addresses } from "./consts";
import { QueryKeys, createQueryOptions, handleQueryError } from "./query-utils";

export function useRewardsQuery(smartAccountAddress?: string) {
  const connex = useConnex();

  const fetchRewards = async (address: string): Promise<number> => {
    if (!connex || !address) return 0;

    try {
      // TODO: Implement real reward query
      // This should query RewardClaimed events
      // const events = await fetchAllEvents(
      //   connex.thor
      //     .account(Addresses.Rewarder)
      //     .event({
      //       "name": "RewardClaimed",
      //       "inputs": [
      //         { "indexed": true, "name": "cycle", "type": "uint256" },
      //         { "indexed": true, "name": "voter", "type": "address" },
      //         { "indexed": false, "name": "reward", "type": "uint256" }
      //       ]
      //     })
      //     .filter([{ voter: address }])
      // );
      //
      // const totalRewards = events.reduce((sum, { decoded }) =>
      //   sum + BigInt(decoded.reward), 0n);
      // return Number(totalRewards / BigInt(1e18));

      // Return mock data for now
      return 17826;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to fetch rewards";
      console.error("Error fetching rewards:", err);
      throw new Error(errorMsg);
    }
  };

  const {
    data: rewards = 0,
    isLoading: loading,
    error,
    refetch,
    isStale,
    dataUpdatedAt,
  } = useQuery({
    ...createQueryOptions<number>("REWARDS"),
    queryKey: QueryKeys.rewards(smartAccountAddress, Addresses.RewardPool),
    queryFn: () => fetchRewards(smartAccountAddress!),
    enabled: !!smartAccountAddress && !!connex,
    // Rewards update less frequently, so we can be more conservative
    refetchInterval: 2 * 60 * 1000, // 2 minutes
    refetchIntervalInBackground: false,
  });

  return {
    rewards,
    loading,
    error: error ? handleQueryError(error) : null,
    refetch,
    isStale,
    lastUpdated: dataUpdatedAt,
    // Helper for display
    formattedRewards: rewards.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }),
  };
}
