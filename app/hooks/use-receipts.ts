import { useQuery } from "@tanstack/react-query";

function fetchReceipts() {
  return [];
}

export function useReceipts() {
  const data = useQuery({
    queryKey: ["receipts"],
    queryFn: () => {
      return [];
    },
  });

  return data;
}
