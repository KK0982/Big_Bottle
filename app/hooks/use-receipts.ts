import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@vechain/vechain-kit";
import { BottleReceipt } from "./types";
import { API_HOST } from "./consts";

async function fetchReceipts(address: string): Promise<BottleReceipt[]> {
  try {
    const response = await fetch(`${API_HOST}/cardinfo`, {
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
          return (data.data?.drink_infos ?? []).map((info: any) => {
            const isAvailable = info?.is_availd;
            const isTimeout = info?.is_time_threshold;
            const isDeleted = info?.is_delete;

            const status = isDeleted
              ? "unusable"
              : isTimeout
              ? "timeout"
              : isAvailable
              ? "available"
              : "unusable";

            return {
              drinkName: info.drink_name as string,
              drinkCapacity: Number(info.drink_capacity) as number,
              drinkAmount: Number(info.drink_amout) as number,
              points: Number(info.points) as number,
              receiptUploadTime: info.receipt_upload_time as string,
              status,
            };
          });
        case 305:
          return [];
        default:
          return [];
      }
    }

    return [];
  } catch (error) {
    console.error(error);
    return [];
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
