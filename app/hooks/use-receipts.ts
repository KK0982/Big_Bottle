import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@vechain/vechain-kit";
import { BottleReceipt } from "./types";
import { API_HOST } from "./consts";
import dayjs from "dayjs";

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
    const isWaitingForAnalysis =
      localStorage.getItem("waiting-for-analysis") === "true";
    localStorage.removeItem("waiting-for-analysis");

    if (!response.ok) return [];

    switch (data.code) {
      case 200:
        const list = (data.data?.drink_infos ?? []).map((info: any) => {
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

        if (isWaitingForAnalysis) {
          list.unshift({
            drinkName: "Waiting for analysis",
            drinkCapacity: 0,
            drinkAmount: 0,
            points: 0,
            receiptUploadTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
            status: "waiting",
          });
        }

        return list;
      case 305:
        return [];
      default:
        return [];
    }
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
    refetchInterval: 10000,
    refetchOnMount: true,
    enabled: isConnected && !!address,
  });
}
