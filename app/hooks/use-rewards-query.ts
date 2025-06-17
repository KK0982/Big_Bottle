import { useState, useEffect } from "react";
import { useConnex } from "@vechain/dapp-kit-react";
import { Addresses } from "./consts";

export function useRewardsQuery(smartAccountAddress?: string) {
  const connex = useConnex();
  const [rewards, setRewards] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRewards = async (address: string): Promise<number> => {
    if (!connex || !address) return 0;

    try {
      setError(null);

      // TODO: 实现真实的奖励查询
      // 这里应该查询 RewardClaimed 事件
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

      // 暂时返回模拟数据
      return 17826;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to fetch rewards";
      setError(errorMsg);
      console.error("Error fetching rewards:", err);
      return 0;
    }
  };

  const refetch = async () => {
    if (!smartAccountAddress) return;

    setLoading(true);
    try {
      const rewardAmount = await fetchRewards(smartAccountAddress);
      setRewards(rewardAmount);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (smartAccountAddress) {
      refetch();
    } else {
      setRewards(0);
    }
  }, [smartAccountAddress, connex]);

  return {
    rewards,
    loading,
    error,
    refetch,
  };
}
