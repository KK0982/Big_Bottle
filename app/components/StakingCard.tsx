"use client";

import React from "react";
import { Box, Flex, Text, Skeleton, Image } from "@chakra-ui/react";
import { StakingData } from "../hooks/use-staking-data";

interface StakingCardProps {
  data: StakingData | null;
  loading: boolean;
}

interface StakingInfoItemProps {
  label: string;
  value: string;
}

function StakingInfoItem({ label, value }: StakingInfoItemProps) {
  return (
    <Flex as="div" justify="space-between" align="center">
      <Text
        as="dt"
        fontFamily="Roboto"
        fontWeight="400"
        fontSize={{ base: "0.875rem", md: "1rem" }}
        lineHeight="1.43"
        color="rgba(0, 0, 0, 0.5)"
      >
        {label}
      </Text>
      <Text
        as="dd"
        fontFamily="Roboto"
        fontWeight="400"
        fontSize={{ base: "0.875rem", md: "1rem" }}
        lineHeight="1.43"
        color="black"
      >
        {value}
      </Text>
    </Flex>
  );
}

function StakingCardSkeleton() {
  return (
    <Box
      as="section"
      bg="white"
      borderRadius="1.25rem"
      p="1rem"
      w="100%"
      mx="auto"
    >
      <Skeleton height="2rem" mb="1rem" />
      <Skeleton height="3.75rem" mb="0.5rem" />
      <Skeleton height="1.25rem" mb="0.5rem" />
      <Skeleton height="1.25rem" />
    </Box>
  );
}

const StakingCard: React.FC<StakingCardProps> = ({ data, loading }) => {
  if (loading) {
    return <StakingCardSkeleton />;
  }

  return (
    <Box
      as="section"
      bg="white"
      borderRadius="1.25rem"
      p="1rem"
      w="100%"
      mx="auto"
      role="region"
      aria-labelledby="staking-title"
    >
      <Flex align="center" gap="0.25rem" mb="1rem">
        <Image
          src="/icons/b3tr.png"
          alt="B3TR"
          width="1.5rem"
          height="1.5rem"
        />
        <Text
          id="staking-title"
          as="h2"
          fontFamily="Roboto"
          fontWeight="600"
          fontSize={{ base: "1.125rem", md: "1.25rem" }}
          lineHeight="1.33"
          color="black"
        >
          B3TR
        </Text>
      </Flex>

      <Flex as="dl" direction="column" gap="0.5rem">
        <StakingInfoItem
          label="Staked Balance"
          value={data?.stakedBalance || "0 B3TR"}
        />
        <StakingInfoItem
          label="Available to Stake"
          value={data?.availableToStake || "0 B3TR"}
        />
      </Flex>
    </Box>
  );
};

export default StakingCard;
