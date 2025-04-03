import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@vechain/vechain-kit";
import { API_HOST } from "./consts";

interface DailyLimitResponse {
  max: number;
  current: number;
}

async function fetchDailyLimit(address: string): Promise<DailyLimitResponse> {
  const response = await fetch(`${API_HOST}/countlimit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      wallet_address: address,
    }),
  });

  const data = await response.json();

  if (data.code !== 200) {
    return {
      max: 0,
      current: 0,
    };
  }

  return {
    max: data.data.count_max,
    current: data.data.count_current,
  };
}

export function useDailyLimit() {
  const { connection, connectedWallet } = useWallet();
  const isConnected = connection.isConnected;
  const address = connectedWallet?.address;

  const { data, isLoading, error } = useQuery({
    queryKey: ["daily-limit", address],
    queryFn: () => {
      if (!isConnected || !address) {
        return {
          max: 0,
          current: 0,
        };
      }

      return fetchDailyLimit(address);
    },
    refetchOnMount: true,
    enabled: isConnected && !!address,
  });

  return { data, isLoading, error };
}
