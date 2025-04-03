"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button, IconButton, Skeleton, Text } from "@chakra-ui/react";
import { useWallet } from "@vechain/vechain-kit";
import AddIcon from "./icons/add";
import { useDailyLimit } from "../hooks/use-daily-limit";

export function AddReceiptButton() {
  const { data: limit } = useDailyLimit();
  const router = useRouter();
  const { connection } = useWallet();

  const handleClick = () => {
    router.push("/add-receipt");
  };

  const haveNoLimit = limit && limit.current >= limit.max;

  return (
    <Button
      position="fixed"
      left="50%"
      bottom="calc(var(--safe-area-bottom) + 24px)"
      width="64px"
      height="64px"
      borderRadius="20px"
      transform="translateX(-50%)"
      aria-label="add receipt"
      display="flex"
      flexDirection="column"
      gap="4px"
      alignItems="center"
      justifyContent="center"
      disabled={!connection.isConnected || haveNoLimit}
      variant={connection.isConnected ? "primary" : "disabled"}
      size="lg"
      boxShadow="lg"
      onClick={handleClick}
    >
      <AddIcon width="20px" height="20px" fill="currentColor" />
      {limit ? (
        <>
          <Text fontSize="14px" fontWeight="600">
            {limit.current}/{limit.max}
          </Text>
        </>
      ) : (
        <Skeleton width="24px" height="14px" borderRadius="4px" />
      )}
    </Button>
  );
}
