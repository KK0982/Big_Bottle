import { useMemo } from "react";
import { useUserInfo } from "./use-user-info";
import { useBalanceQuery } from "./use-balance-query";
import { useRewardsQuery } from "./use-rewards-query";

export interface StakingData {
  apy: string;
  stakedBalance: string;
  availableToStake: string;
  youEarned: string;
}

export function useStakingData() {
  // Get user information
  const { userInfo, loading: userLoading } = useUserInfo();

  // Get user account balance
  const { balance: accountBalance, loading: accountBalanceLoading } =
    useBalanceQuery(userInfo.account || undefined);

  // Get smart account balance (staked balance)
  const { balance: stakingBalance, loading: stakingBalanceLoading } =
    useBalanceQuery(userInfo.smartAccountAddress || undefined);

  // Get rewards
  const { rewards, loading: rewardsLoading } = useRewardsQuery(
    userInfo.smartAccountAddress || undefined
  );

  const loading =
    userLoading ||
    accountBalanceLoading ||
    stakingBalanceLoading ||
    rewardsLoading;

  const data: StakingData | null = useMemo(() => {
    if (loading) return null;

    // Calculate APY (using mock value for now)
    const apy = "~113.08%";

    // Format staked balance (total balance in smart account)
    const stakedTotal = stakingBalance.b3tr + stakingBalance.vot3;
    const stakedBalance = `${stakedTotal.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} B3TR`;

    // Format available to stake balance (available B3TR in user account)
    const availableToStake = `${accountBalance.availableB3tr.toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )} B3TR`;

    // Format earned rewards
    const youEarned = `${rewards.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })} B3TR`;

    return {
      apy,
      stakedBalance,
      availableToStake,
      youEarned,
    };
  }, [accountBalance, stakingBalance, rewards, loading]);

  return { data, loading };
}
