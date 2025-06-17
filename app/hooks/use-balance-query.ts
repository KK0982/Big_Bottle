import { useState, useEffect } from "react";
import { useConnex, useWallet } from "@vechain/dapp-kit-react";
import { Addresses } from "./consts";

export interface TokenBalance {
  b3tr: number;
  vot3: number;
  availableB3tr: number;
  availableVot3: number;
}

const getEmptyBalance = (): TokenBalance => ({
  b3tr: 0,
  vot3: 0,
  availableB3tr: 0,
  availableVot3: 0,
});

export function useBalanceQuery(address?: string) {
  const connex = useConnex();
  const [balance, setBalance] = useState<TokenBalance>(getEmptyBalance());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async (targetAddress: string): Promise<TokenBalance> => {
    if (!connex || !targetAddress) return getEmptyBalance();

    try {
      setError(null);

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

      const b3trBalance = Number(
        BigInt(b3trResult.decoded.balance) / BigInt(1e18)
      );
      const vot3Balance = Number(
        BigInt(vot3Result.decoded.balance) / BigInt(1e18)
      );

      return {
        b3tr: b3trBalance,
        vot3: vot3Balance,
        availableB3tr: b3trBalance,
        availableVot3: vot3Balance,
      };
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to fetch balance";
      setError(errorMsg);
      console.error("Error fetching balance:", err);
      return getEmptyBalance();
    }
  };

  const refetch = async () => {
    if (!address) return;

    setLoading(true);
    try {
      const newBalance = await fetchBalance(address);
      setBalance(newBalance);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      refetch();
    } else {
      setBalance(getEmptyBalance());
    }
  }, [address, connex]);

  return {
    balance,
    loading,
    error,
    refetch,
  };
}
