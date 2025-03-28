"use client";

import React from "react";
import Logo from "./icons/logo";
import Link from "next/link";
import ConnectButton from "./ConnectButton";
import { Box, Flex, Text } from "@chakra-ui/react";

interface HeaderProps {
  title?: string;
  leftContent?: React.ReactNode;
}

// Header component that displays the app title and optional right content
const Header: React.FC<HeaderProps> = ({
  title = "BigBottle",
  leftContent,
}) => {
  return (
    <Box
      as="header"
      h="44px"
      w="full"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      px={6}
      py="6px"
      bg="white"
      position="fixed"
      top={0}
      left={0}
      zIndex={50}
    >
      <Flex alignItems="center">
        {leftContent}
        <Link href="/">
          <Logo width={32} height={32} />
        </Link>
        <Text
          fontSize="18px"
          fontWeight="semibold"
          lineHeight="28px"
          textAlign="center"
          color="black"
          ml={1}
        >
          {title}
        </Text>
      </Flex>
      <Flex alignItems="center">
        <ConnectButton />
      </Flex>
    </Box>
  );
};

export default Header;
