"use client";

import React from "react";
import {
  useConnectModal,
  useAccountModal,
  useWallet,
} from "@vechain/vechain-kit";
import { Button, Text, Icon } from "@chakra-ui/react";
import { EthereumAvatar } from "./EthereumAvatar";

const ConnectButton: React.FC = () => {
  const { connection, connectedWallet } = useWallet();
  const { open: openConnectModal } = useConnectModal();
  const { open: openAccountModal } = useAccountModal();

  const handleClick = () => {
    if (connection.isConnected) {
      openAccountModal();
    } else {
      openConnectModal();
    }
  };

  if (connection.isConnected) {
    return (
      <Button
        onClick={openAccountModal}
        border="1px"
        borderColor="rgba(0, 0, 0, 0.1)"
        bg="white"
        color="rgba(0, 0, 0, 1)"
        fontWeight="600"
        fontSize="14px"
        lineHeight="20px"
        height="32px"
        minW="111px"
        p="6px 8px"
        borderRadius="8px"
        display="flex"
        alignItems="center"
        gap="1"
      >
        {connectedWallet?.address ? (
          <EthereumAvatar address={connectedWallet?.address || ""} size={16} />
        ) : null}
        <Text flex="none" order={1} flexGrow={0}>
          {`${connectedWallet?.address?.slice(
            0,
            3
          )}...${connectedWallet?.address?.slice(-4)}`}
        </Text>
      </Button>
    );
  }

  return (
    <Button
      onClick={handleClick}
      bg="primary.500"
      color="white"
      fontWeight="600"
      fontSize="14px"
      lineHeight="20px"
      height="32px"
      minW="111px"
      p="6px 8px"
      borderRadius="8px"
    >
      <Text flex="none" order={1} flexGrow={0}>
        Connect Wallet
      </Text>
    </Button>
  );
};

export default ConnectButton;
