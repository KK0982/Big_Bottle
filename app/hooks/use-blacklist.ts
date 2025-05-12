import { useQuery } from "@tanstack/react-query";
import { API_HOST } from "./consts";
import { useWallet } from "@vechain/vechain-kit";

async function fetchBlacklist(address: string) {
  const response = await fetch(`${API_HOST}/inblacklist`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      wallet_address: address,
    }),
  });

  const data = await response.json();

  if (data.code == 200) {
    return data.data.in_black_list;
  }

  return false;
}

export function useBlacklist() {
  const { connection, connectedWallet } = useWallet();
  const isConnected = connection.isConnected;
  const address = connectedWallet?.address;

  return useQuery({
    queryKey: ["blacklist"],
    queryFn: () => {
      if (!isConnected || !address) {
        return false;
      }

      return fetchBlacklist(address);
    },
    enabled: isConnected && !!address,
    // disable refetching
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}
