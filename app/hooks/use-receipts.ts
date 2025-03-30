import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@vechain/vechain-kit";
import { BottleReceipt, BottleStatus } from "./types";
import { API_HOST } from "./consts";

async function fetchReceipts(address: string): Promise<BottleReceipt> {
  try {
    const response = await fetch(`${API_HOST}/bigbottle/cardinfo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        wallet_address: address,
      }),
    });
    const data = await response.json();

    if (response.ok) {
      switch (data.code) {
        case 200:
          return {
            status: BottleStatus.COMPLETED,
            drinkName: data.data.drink_name,
            drinkCapacity: data.data.drink_capacity,
            drinkAmount: data.data.drink_amout,
            points: data.data.points,
          };
        case 305:
          return {
            status: BottleStatus.EMPTY,
          };
        default:
          return {
            status: BottleStatus.FAILED,
          };
      }
    }

    return {
      status: BottleStatus.FAILED,
    };
  } catch (error) {
    console.error(error);
    return {
      status: BottleStatus.FAILED,
    };
  }
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
  });
}
