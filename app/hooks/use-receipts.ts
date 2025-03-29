import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@vechain/vechain-kit";
import { BottleStatus, BottleReceipt } from "./types";

function sleep(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function mockReceipts(): BottleReceipt[] {
  return [
    {
      id: "1",
      drinkName: "Lm アールグ レイムトウ",
      drinkCapacity: 2001,
      drinkAmount: 2,
      points: 14,
      status: BottleStatus.COMPLETED,
    },
    {
      id: "2",
      status: BottleStatus.FAILED,
    },
    {
      id: "3",
      status: BottleStatus.PROCESSING,
    },
  ];
}

async function fetchReceipts(address: string) {
  await sleep(3000);

  return mockReceipts();
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
