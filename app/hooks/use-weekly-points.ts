import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@vechain/vechain-kit";

function sleep(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

async function mockWeeklyPoints() {
  await sleep(3000);

  return 100;
}

async function fetchWeeklyPoints() {
  await sleep(3000);

  return mockWeeklyPoints();
}

export function useWeeklyPoints() {
  const { connection, connectedWallet } = useWallet();
  const isConnected = connection.isConnected;
  const address = connectedWallet?.address;

  return useQuery({
    queryKey: ["weekly-points", address],
    queryFn: () => fetchWeeklyPoints(),
    enabled: isConnected && !!address,
  });
}
