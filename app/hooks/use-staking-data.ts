import { useMemo } from "react";
import { useUserInfo } from "./use-user-info";
import { useBalanceQuery } from "./use-balance-query";
import { B3TR } from "../utils/token-balance";

export interface StakingData {
  stakedBalance: string;
  availableToStake: string;
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
    useBalanceQuery(userInfo.smartAccountAddress || undefined);

  const loading =
    userLoading ||
    accountBalanceLoading ||
    stakingBalanceLoading;

  const data: StakingData | null = useMemo(() => {
    if (loading) return null;

    // Format staked balance - show total as B3TR equivalent
    const totalStakedAmount = stakingBalance.b3tr + stakingBalance.vot3;
    const stakedBalance = B3TR.formatWithSymbol(totalStakedAmount);

    // Format available to stake balance (available B3TR in user account)
    const availableToStake = B3TR.formatWithSymbol(accountBalance.b3tr);

    return {
      stakedBalance,
      availableToStake,
      poolExists: userInfo.hasPool,
    };
  }, [accountBalance, stakingBalance, userInfo.hasPool, loading]);

  return { data, loading };
}
