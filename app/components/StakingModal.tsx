"use client";

import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  DrawerHeader,
  VStack,
  HStack,
  Text,
  Button,
  Box,
} from "@chakra-ui/react";
import { useState, useRef, useEffect } from "react";
import { BaseStakingForm } from "./staking/BaseStakingForm";

interface StakingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function TabButton({ isActive, onClick, children }: TabButtonProps) {
  return (
    <Button
      flex="1"
      bg={isActive ? "#01E35C" : "transparent"}
      color={isActive ? "white" : "gray.900"}
      borderRadius="20px"
      fontWeight="600"
      fontSize="18px"
      height="48px"
      _hover={{
        bg: isActive ? "#00C84A" : "gray.100",
      }}
      _active={{
        bg: isActive ? "#00A038" : "gray.200",
      }}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export function StakingModal({ isOpen, onClose }: StakingModalProps) {
  const [activeTab, setActiveTab] = useState<"stake" | "unstake">("stake");
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab("stake");
    }
  }, [isOpen]);

  return (
    <Drawer isOpen={isOpen} placement="bottom" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent
        ref={modalRef}
        borderTopRadius="20px"
        borderBottomRadius="0"
        maxH="80vh"
        pb="env(safe-area-inset-bottom)"
        bg="white"
      >
        {/* Header with title and close button */}
        <Box px="24px" pt="24px" position="relative">
          <HStack justify="space-between" align="center">
            <Text
              fontSize="24px"
              fontWeight="600"
              color="black"
              fontFamily="Roboto"
            >
              Stake to Earn
            </Text>
            <DrawerCloseButton
              position="static"
              size="sm"
              color="gray.600"
              _hover={{ bg: "gray.100" }}
            />
          </HStack>
        </Box>

        <DrawerBody px="24px" pb="24px" pt="12px">
          <VStack spacing="12px" align="stretch">
            {/* Tab buttons */}
            <Box
              bg="rgba(0,0,0,0.05)"
              borderRadius="20px"
              p="2px"
              height="48px"
            >
              <HStack spacing="0" height="100%">
                <TabButton
                  isActive={activeTab === "stake"}
                  onClick={() => setActiveTab("stake")}
                >
                  Stake
                </TabButton>
                <TabButton
                  isActive={activeTab === "unstake"}
                  onClick={() => setActiveTab("unstake")}
                >
                  Unstake
                </TabButton>
              </HStack>
            </Box>

            <BaseStakingForm mode={activeTab} onClose={onClose} />
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
