"use client";

import React from "react";
import MobileLayout from "../components/MobileLayout";
import StakingCard from "../components/StakingCard";
import { StakingModal } from "../components/StakingModal";
import { Box, Text, Button, VStack, useDisclosure } from "@chakra-ui/react";
import { useStakingOperations } from "../hooks/use-staking-operations";
import { B3TR } from "../utils/token-balance";

export default function Staking() {
  const {
    accountBalance,
    stakingBalance,
    hasPool,
    isBalancesLoading,
  } = useStakingOperations();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const totalStaked = stakingBalance.b3tr + stakingBalance.vot3;
  const stakedBalance = B3TR.formatWithSymbol(totalStaked);
  const availableToStake = B3TR.formatWithSymbol(accountBalance.b3tr);

  const summary = {
    stakedBalance,
    availableToStake,
    poolExists: hasPool,
  };

  const loading = isBalancesLoading;

  const handleManage = () => {
    onOpen();
  };

  return (
    <MobileLayout title="Staking" showBackButton={false}>
      <VStack
        spacing="0.75rem"
        align="stretch"
        pt={{ base: "1rem", md: "1.5rem" }}
        pb={{ base: "1rem", md: "1.5rem" }}
        px={{ base: "0", md: "1rem" }}
        minH="calc(100vh - 104px - 60px)" // Header height - Nav height
        justify="space-between"
      >
        {/* Content Section */}
        <VStack spacing="0.75rem" align="stretch">
          {/* Title */}
          <Text
            as="h1"
            fontFamily="Roboto"
            fontWeight="600"
            fontSize={{ base: "1.5rem", md: "2rem" }}
            lineHeight="1.5"
            color="black"
            textAlign="left"
          >
            Stake to Earn
          </Text>

          {/* Staking Card */}
          <StakingCard data={loading ? null : summary} loading={loading} />
        </VStack>

        {/* Manage Button Section */}
        <Box
          as="section"
          pt={{ base: "1.5rem", md: "2rem" }}
          aria-label="Staking actions"
        >
          <Button
            w="100%"
            h={{ base: "3.375rem", md: "3.75rem" }}
            bg="primary.500"
            color="white"
            borderRadius="1.25rem"
            fontFamily="Roboto"
            fontWeight="600"
            fontSize={{ base: "1.125rem", md: "1.25rem" }}
            lineHeight="1.56"
            onClick={handleManage}
            variant="primary"
            size="lg"
            _hover={{
              bg: "primary.600",
              transform: "translateY(-1px)",
              boxShadow: "lg",
            }}
            _active={{
              bg: "primary.600",
              transform: "translateY(0)",
            }}
            transition="all 0.2s ease"
          >
            Manage
          </Button>
        </Box>
      </VStack>

      {/* Staking Modal */}
      <StakingModal isOpen={isOpen} onClose={onClose} />
    </MobileLayout>
  );
}
