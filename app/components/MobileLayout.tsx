"use client";

import React, { ReactNode } from "react";
import Header from "./Header";
import { Box, IconButton } from "@chakra-ui/react";
import { useRouter, usePathname } from "next/navigation";
import FA from "react-fontawesome";

interface MobileLayoutProps {
  title?: string;
  children: ReactNode;
  showBackButton?: boolean;
}

// Mobile layout component with fixed header and scrollable content
const MobileLayout = ({
  title,
  children,
  showBackButton,
}: MobileLayoutProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const shouldShowBackButton =
    showBackButton !== undefined ? showBackButton : pathname !== "/";

  const handleBack = () => {
    router.back();
  };

  return (
    <Box
      display="flex"
      height="100vh"
      width="100vw"
      position="relative"
      overflow="hidden"
      backgroundColor="white"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      borderRadius="20px"
      background="rgba(0, 0, 0, 0.05)"
    >
      <Header
        title={title}
        leftContent={
          shouldShowBackButton ? (
            <IconButton
              aria-label="back"
              icon={<FA name="arrow-left" />}
              variant="ghost"
              size="sm"
              onClick={handleBack}
            />
          ) : undefined
        }
      />
      <Box
        as="main"
        flex="1"
        overflowY="auto"
        p="24px"
        mt="44px"
        w="full"
        h="calc(100vh - 44px)"
      >
        {children}
      </Box>
    </Box>
  );
};

export default MobileLayout;
