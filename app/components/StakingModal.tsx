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
} from "@chakra-ui/react";
import { useState, useRef, useEffect } from "react";
import { StakingForm } from "./StakingForm";
import { UnstakingForm } from "./UnstakingForm";

interface StakingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StakingModal({ isOpen, onClose }: StakingModalProps) {
  const [activeTab, setActiveTab] = useState<"stake" | "unstake">("stake");
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset tab when modal opens
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
        borderTopRadius="1.5rem"
        borderBottomRadius="0"
        maxH="80vh"
        pb="env(safe-area-inset-bottom)"
      >
        <DrawerCloseButton
          size="lg"
          color="gray.600"
          _hover={{ bg: "gray.100" }}
        />

        <DrawerHeader textAlign="center" pb="1rem">
          <Text fontSize="1.25rem" fontWeight="semibold" color="gray.900">
            Stake to Earn
          </Text>
        </DrawerHeader>

        <DrawerBody px="1.5rem" pb="1.5rem">
          <VStack spacing="1.5rem" align="stretch">
            {/* Tab Switcher */}
            <HStack spacing="0" bg="gray.100" borderRadius="3rem" p="0.25rem">
              <Button
                flex="1"
                bg={activeTab === "stake" ? "#01E35C" : "transparent"}
                color={activeTab === "stake" ? "white" : "gray.700"}
                borderRadius="3rem"
                fontWeight="medium"
                fontSize="1rem"
                h="3rem"
                _hover={{
                  bg: activeTab === "stake" ? "#00C84A" : "gray.200",
                }}
                onClick={() => setActiveTab("stake")}
              >
                Stake
              </Button>
              <Button
                flex="1"
                bg={activeTab === "unstake" ? "#01E35C" : "transparent"}
                color={activeTab === "unstake" ? "white" : "gray.700"}
                borderRadius="3rem"
                fontWeight="medium"
                fontSize="1rem"
                h="3rem"
                _hover={{
                  bg: activeTab === "unstake" ? "#00C84A" : "gray.200",
                }}
                onClick={() => setActiveTab("unstake")}
              >
                Unstake
              </Button>
            </HStack>

            {/* Form Content */}
            <VStack spacing="1.5rem" align="stretch">
              {activeTab === "stake" && <StakingForm onClose={onClose} />}
              {activeTab === "unstake" && <UnstakingForm onClose={onClose} />}
            </VStack>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
