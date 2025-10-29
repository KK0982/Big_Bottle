import { useQuery } from "@tanstack/react-query";
import { useConnex, useWallet } from "@vechain/dapp-kit-react";
import { Addresses, APP_CONFIG } from "./consts";
import { QueryKeys, createQueryOptions, handleQueryError } from "./query-utils";
import type { UserInfo } from "../types";

const getEmptyUserInfo = (): UserInfo => ({
  account: null,
  tokenId: "",
  smartAccountAddress: "",
  stakingTokenId: "", // 兼容性别名
  hasPool: false,
  passportAddress: undefined,
});

export function useUserInfo() {
  const { account } = useWallet();
  const connex = useConnex();

  // Get user's tokenId
  const fetchTokenId = async (userAccount: string): Promise<string> => {
    if (!connex) return "";

    try {
      const result = await connex.thor
        .account(Addresses.VeDelegate)
        .method({
          inputs: [
            { name: "owner", type: "address" },
            { name: "tokenIndex", type: "uint256" },
          ],
          name: "tokenOfOwnerByIndex",
          outputs: [{ name: "tokenId", type: "uint256" }],
        })
        .call(userAccount, 0);

      if (!result.reverted) {
        return result.decoded.tokenId;
      }
      throw new Error("No token found");
    } catch {
      // If no token exists, generate one using account
      return BigInt(userAccount).toString();
    }
  };

  // Get smart account address
  const fetchSmartAccountAddress = async (tokenId: string): Promise<string> => {
    if (!connex || !tokenId) return "";

    try {
      const result = await connex.thor
        .account(Addresses.VeDelegate)
        .method({
          inputs: [{ name: "tokenId", type: "uint256" }],
          name: "getPoolAddress",
          outputs: [{ name: "tbaAddress", type: "address" }],
        })
        .call(tokenId);

      return result.decoded.tbaAddress;
    } catch (err) {
      console.error("Error getting smart account address:", err);
      return "";
    }
  };

  // Check who has delegated their passport to the smart account
  const fetchPassportDelegation = async (
    smartAccount: string
  ): Promise<string | undefined> => {
    if (!connex || !smartAccount) return undefined;

    try {
      // Check who has delegated their passport to this smart account (official method)
      const result = await connex.thor
        .account(Addresses.VePassport)
        .method({
          inputs: [{ name: "delegatee", type: "address" }],
          name: "getDelegator",
          outputs: [{ name: "user", type: "address" }],
        })
        .call(smartAccount);

      const user = result.decoded.user;

      // Return undefined if it's zero address or empty
      if (!user || user === "0x0000000000000000000000000000000000000000") {
        return undefined;
      }

      return user;
    } catch (err) {
      console.error("Error getting passport delegation:", err);
      return undefined;
    }
  };

  // Check if pool exists
  const checkHasPool = async (smartAccount: string): Promise<boolean> => {
    if (!connex || !smartAccount) return false;

    try {
      const { hasCode } = await connex.thor.account(smartAccount).get();
      return hasCode;
    } catch {
      return false;
    }
  };

  const fetchUserInfo = async (): Promise<UserInfo> => {
    if (!account || !connex) {
      return getEmptyUserInfo();
    }

    try {
      // 1. Get tokenId
      const tokenId = await fetchTokenId(account);

      // 2. Get smart account address
      const smartAccountAddress = await fetchSmartAccountAddress(tokenId);

      // 3. Get other info in parallel
      const [hasPool, passportDelegatedTo] = await Promise.all([
        checkHasPool(smartAccountAddress),
        fetchPassportDelegation(smartAccountAddress),
      ]);

      return {
        account,
        tokenId,
        smartAccountAddress,
        stakingTokenId: tokenId, // 兼容性别名
        hasPool,
        passportAddress: passportDelegatedTo,
      };
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to fetch user info";
      console.error("Error fetching user info:", err);
      throw new Error(errorMsg);
    }
  };

  const {
    data: userInfo = getEmptyUserInfo(),
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    ...createQueryOptions<UserInfo>("USER_INFO"),
    queryKey: QueryKeys.userInfo(
      account || undefined,
      { VeDelegate: Addresses.VeDelegate, VePassport: Addresses.VePassport },
      APP_CONFIG.APP_ID
    ),
    queryFn: fetchUserInfo,
    enabled: !!account && !!connex,
  });

  return {
    userInfo,
    loading,
    error: error ? handleQueryError(error) : null,
    refetch,
  };
}
