import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@vechain/vechain-kit";
import { BottleReceipt, BottleStatus } from "./types";
import { API_HOST } from "./consts";

async function fetchReceipts(address: string): Promise<BottleReceipt> {
  const response = await fetch(`${API_HOST}/bigbottle/cardinfo`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      wallet_address: address,
    }),
  });
  const data = await response.json();

  if (response.ok) {
    if (data.code === 200) {
      return {
        status: BottleStatus.COMPLETED,
        ...data.data,
      };
    } else {
      return {
        status: BottleStatus.FAILED,
      };
    }
  }

  return {
    status: BottleStatus.FAILED,
  };
}

export function useReceipts() {
  const { connection, connectedWallet } = useWallet();
  const isConnected = connection.isConnected;
  const address = connectedWallet?.address;

  return useQuery({
    queryKey: ["receipts", address],
    queryFn: () => {
      if (!address) throw new Error("No address");

      return fetchReceipts(address);
    },
    enabled: isConnected && !!address,
    refetchOnMount: true,
  });
}
