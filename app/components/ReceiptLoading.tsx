import { Skeleton } from "@chakra-ui/react";

function LoadingCard() {
  return (
    <Skeleton
      height="120px"
      borderRadius={20}
      startColor="rgba(0, 0, 0, 0.2)"
      endColor="rgba(0, 0, 0, 0.1)"
    />
  );
}

export function ReceiptLoading() {
  return (
    <>
      <LoadingCard />
    </>
  );
}
