import { useState, useEffect } from "react";
import { useConnex, useWallet } from "@vechain/dapp-kit-react";
import { Addresses, APP_CONFIG } from "./consts";

export interface UserInfo {
  account: string | null;
  tokenId: string;
  smartAccountAddress: string;
  hasPool: boolean;
  passportAddress: string;
}

const getEmptyUserInfo = (): UserInfo => ({
  account: null,
  tokenId: "",
  smartAccountAddress: "",
  hasPool: false,
  passportAddress: "",
});

export function useUserInfo() {
  const { account } = useWallet();
  const connex = useConnex();

  const [userInfo, setUserInfo] = useState<UserInfo>(getEmptyUserInfo());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取用户的 tokenId
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
      // 如果没有 token，使用 account 生成一个
      return BigInt(userAccount).toString();
    }
  };

  // 获取智能账户地址
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

  // 获取 Passport 委托地址
  const fetchPassportAddress = async (
    smartAccount: string
  ): Promise<string> => {
    if (!connex || !smartAccount) return "";

    try {
      const result = await connex.thor
        .account(Addresses.VePassport)
        .method({
          inputs: [{ name: "delegatee", type: "address" }],
          name: "getDelegator",
          outputs: [{ name: "user", type: "address" }],
        })
        .call(smartAccount);

      return result.decoded.user;
    } catch (err) {
      console.error("Error getting passport address:", err);
      return "";
    }
  };

  // 检查是否有 Pool
  const checkHasPool = async (smartAccount: string): Promise<boolean> => {
    if (!connex || !smartAccount) return false;

    try {
      const { hasCode } = await connex.thor.account(smartAccount).get();
      return hasCode;
    } catch {
      return false;
    }
  };

  const fetchUserInfo = async () => {
    if (!account || !connex) {
      setUserInfo(getEmptyUserInfo());
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. 获取 tokenId
      const tokenId = await fetchTokenId(account);

      // 2. 获取智能账户地址
      const smartAccountAddress = await fetchSmartAccountAddress(tokenId);

      // 3. 并行获取其他信息
      const [hasPool, passportAddress] = await Promise.all([
        checkHasPool(smartAccountAddress),
        fetchPassportAddress(smartAccountAddress),
      ]);

      setUserInfo({
        account,
        tokenId,
        smartAccountAddress,
        hasPool,
        passportAddress,
      });
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to fetch user info";
      setError(errorMsg);
      console.error("Error fetching user info:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, [account, connex]);

  return {
    userInfo,
    loading,
    error,
    refetch: fetchUserInfo,
  };
}
