"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { IconButton } from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";
import { useWallet } from "@vechain/vechain-kit";

export function AddReceiptButton() {
  const router = useRouter();
  const { connection } = useWallet();

  const handleClick = () => {
    router.push("/add-receipt");
  };

  return (
    <IconButton
      position="fixed"
      left="50%"
      bottom="calc(var(--safe-area-bottom) + 24px)"
      width="64px"
      height="64px"
      borderRadius="20px"
      transform="translateX(-50%)"
      aria-label="add receipt"
      icon={<FaPlus />}
      disabled={!connection.isConnected}
      variant={connection.isConnected ? "primary" : "disabled"}
      size="lg"
      boxShadow="lg"
      onClick={handleClick}
    />
  );
}
