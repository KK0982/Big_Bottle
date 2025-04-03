import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@vechain/vechain-kit";
import { API_HOST } from "./consts";

async function fetchWeeklyPoints(address: string) {
  try {
    const response = await fetch(`${API_HOST}/weekpoints`, {
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
      return 0;
    }

    return Number(data.data.week_points);
  } catch (error) {
    console.error(error);
    return 0;
  }
}

export function useWeeklyPoints() {
  const { connection, connectedWallet } = useWallet();
  const isConnected = connection.isConnected;
  const address = connectedWallet?.address;

  return useQuery({
    queryKey: ["weekly-points", address],
    queryFn: () => {
      if (!address) {
        return 0;
      }

      return fetchWeeklyPoints(address);
    },
    enabled: isConnected && !!address,
    refetchOnMount: true,
  });
}
