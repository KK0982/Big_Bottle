import { useQuery } from "@tanstack/react-query";
import { useConnex } from "@vechain/dapp-kit-react";
import { Addresses } from "./consts";
import { QueryKeys, createQueryOptions, handleQueryError } from "./query-utils";

export interface VotePreferenceData {
  // Delegation status
  isDelegated: boolean;
  delegatedTo: string | null;

  // Staking information
  stakedAmount: number;
  vot3Balance: number;

  // Voting eligibility
  canVote: boolean;
  hasMinimumStake: boolean;

  // Vote preference settings (from veDelegate contract)
  votePreference: {
    isActive: boolean;
    preferredApps: string[];
    autoVoteEnabled: boolean;
  };
}

const getEmptyVotePreference = (): VotePreferenceData => ({
  isDelegated: false,
  delegatedTo: null,
  stakedAmount: 0,
  vot3Balance: 0,
  canVote: false,
  hasMinimumStake: false,
  votePreference: {
    isActive: false,
    preferredApps: [],
    autoVoteEnabled: false,
  },
});

export function useVotePreference(address?: string) {
  const connex = useConnex();

  const fetchVotePreference = async (
    userAddress: string
  ): Promise<VotePreferenceData> => {
    if (!connex || !userAddress) return getEmptyVotePreference();

    try {
      // 1. Check VOT3 balance and delegation status
      const [vot3BalanceResult, delegationResult] = await Promise.all([
        // Get VOT3 balance
        connex.thor
          .account(Addresses.VOT3)
          .method({
            inputs: [{ name: "account", type: "address" }],
            name: "balanceOf",
            outputs: [{ name: "balance", type: "uint256" }],
          })
          .call(userAddress),

        // Check if user has delegated their voting power
        connex.thor
          .account(Addresses.VOT3)
          .method({
            inputs: [{ name: "delegator", type: "address" }],
            name: "delegates",
            outputs: [{ name: "delegatee", type: "address" }],
          })
          .call(userAddress),
      ]);

      const vot3Balance = Number(
        BigInt(vot3BalanceResult.decoded.balance) / BigInt(1e18)
      );
      const delegatedTo = delegationResult.decoded.delegatee as string;
      const isDelegated =
        delegatedTo !== "0x0000000000000000000000000000000000000000" &&
        delegatedTo.toLowerCase() !== userAddress.toLowerCase();

      // 2. Check staking amount from veDelegate contract
      const stakingResult = await connex.thor
        .account(Addresses.VeDelegate)
        .method({
          inputs: [{ name: "user", type: "address" }],
          name: "getStakedAmount",
          outputs: [{ name: "amount", type: "uint256" }],
        })
        .call(userAddress);

      const stakedAmount = Number(
        BigInt(stakingResult.decoded.amount) / BigInt(1e18)
      );

      // 3. Check vote preference from veDelegate contract
      const [votePreferenceResult, autoVoteResult] = await Promise.all([
        // Check if user has set vote preferences
        connex.thor
          .account(Addresses.VeDelegate)
          .method({
            inputs: [{ name: "user", type: "address" }],
            name: "getVotePreference",
            outputs: [
              { name: "isActive", type: "bool" },
              { name: "apps", type: "bytes32[]" },
            ],
          })
          .call(userAddress)
          .catch(() => ({ decoded: { isActive: false, apps: [] } })),

        // Check auto-vote setting
        connex.thor
          .account(Addresses.VeDelegate)
          .method({
            inputs: [{ name: "user", type: "address" }],
            name: "isAutoVoteEnabled",
            outputs: [{ name: "enabled", type: "bool" }],
          })
          .call(userAddress)
          .catch(() => ({ decoded: { enabled: false } })),
      ]);

      const isVotePreferenceActive = votePreferenceResult.decoded.isActive;
      const preferredApps =
        (votePreferenceResult.decoded.apps as string[]) || [];
      const autoVoteEnabled = autoVoteResult.decoded.enabled;

      // 4. Determine voting eligibility
      const hasMinimumStake = stakedAmount > 0;
      const canVote = vot3Balance >= 1 && (isDelegated || hasMinimumStake);

      return {
        isDelegated,
        delegatedTo: isDelegated ? delegatedTo : null,
        stakedAmount,
        vot3Balance,
        canVote,
        hasMinimumStake,
        votePreference: {
          isActive: isVotePreferenceActive,
          preferredApps,
          autoVoteEnabled,
        },
      };
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to fetch vote preference";
      console.error("Error fetching vote preference:", err);
      throw new Error(errorMsg);
    }
  };

  const {
    data: votePreferenceData = getEmptyVotePreference(),
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    ...createQueryOptions<VotePreferenceData>("USER_INFO"),
    queryKey: QueryKeys.votePreference(address, {
      VeDelegate: Addresses.VeDelegate,
      VOT3: Addresses.VOT3,
    }),
    queryFn: () => fetchVotePreference(address!),
    enabled: !!address && !!connex,
  });

  return {
    votePreferenceData,
    loading,
    error: error ? handleQueryError(error) : null,
    refetch,
  };
}
