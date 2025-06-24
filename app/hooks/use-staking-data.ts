import { useMemo } from "react";
import { useUserInfo } from "./use-user-info";
import { useBalanceQuery } from "./use-balance-query";
import { useRewardsQuery } from "./use-rewards-query";
import { tokenBalanceUtils } from "../utils/token-balance";

export interface StakingData {
  apy: string;
  stakedBalance: string;
  availableToStake: string;
  youEarned: string;
  poolExists: boolean;
}

export function useStakingData() {
  // Get user information
  const { userInfo, loading: userLoading } = useUserInfo();

  // Get user account balance
  const { balance: accountBalance, loading: accountBalanceLoading } =
    useBalanceQuery(userInfo.account || undefined);

  // Get smart account balance (staked balance)
  const { balance: stakingBalance, loading: stakingBalanceLoading } =
    useBalanceQuery(userInfo.stakingWallet || undefined);

  // Get rewards
  const { rewards, loading: rewardsLoading } = useRewardsQuery(
    userInfo.stakingWallet || undefined
  );

  const loading =
    userLoading ||
    accountBalanceLoading ||
    stakingBalanceLoading ||
    rewardsLoading;

  const data: StakingData | null = useMemo(() => {
    if (loading) return null;

    // Calculate APY (placeholder)
    const apy = "~113.08%";

    // Format staked balance - use VOT3 from smart contract
    const stakedBalance = `${tokenBalanceUtils.formatForDisplay(stakingBalance.vot3)} VOT3`;

    // Format available to stake balance (available B3TR in user account)
    const availableToStake = `${tokenBalanceUtils.formatForDisplay(accountBalance.b3tr)} B3TR`;

    // Format earned rewards
    const youEarned = `${tokenBalanceUtils.formatForDisplay(rewards, 0)} B3TR`;

    return {
      apy,
      stakedBalance,
      availableToStake,
      youEarned,
      poolExists: userInfo.hasPool,
    };
  }, [accountBalance, stakingBalance, rewards, userInfo.hasPool, loading]);

  return { data, loading };
}
