"use client";

import {
  VStack,
  HStack,
  Text,
  Input,
  Box,
  Flex,
  Image,
  Button,
} from "@chakra-ui/react";
import { forwardRef } from "react";

interface TokenInputProps {
  value: string;
  onChange: (value: string) => void;
  balance: bigint;
  tokenSymbol: string;
  tokenIcon: string;
  placeholder?: string;
  isDisabled?: boolean;
  onPercentageClick?: (percentage: number) => void;
}

export const TokenInput = forwardRef<HTMLInputElement, TokenInputProps>(
  (
    {
      value,
      onChange,
      balance,
      tokenSymbol,
      tokenIcon,
      placeholder = "0.0",
      isDisabled = false,
      onPercentageClick,
    },
    ref
  ) => {
    const percentageButtons = [25, 50, 75, 100];

    const formatBalance = (balance: bigint) => {
      const formatted = Number(balance) / 1e18;
      return formatted.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
    };

    return (
      <Box bg="rgba(0,0,0,0.05)" borderRadius="20px" p="16px">
        <VStack spacing="8px" align="stretch">
          {/* Header with Amount label and Balance */}
          <Flex justify="space-between" align="center">
            <Text
              fontSize="14px"
              fontWeight="400"
              color="rgba(0,0,0,0.5)"
              fontFamily="Roboto"
            >
              Amount
            </Text>
            <Text
              fontSize="14px"
              fontWeight="400"
              color="rgba(0,0,0,0.5)"
              fontFamily="Roboto"
            >
              Balance: {formatBalance(balance)}
            </Text>
          </Flex>

          {/* Input area with amount and token symbol */}
          <Flex justify="space-between" align="center">
            <Input
              ref={ref}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              flex={1}
              fontSize="24px"
              fontWeight="600"
              color={value ? "black" : "rgba(0,0,0,0.25)"}
              border="none"
              bg="transparent"
              p="0"
              _focus={{ boxShadow: "none" }}
              _placeholder={{ color: "rgba(0,0,0,0.25)" }}
              isDisabled={isDisabled}
              fontFamily="Roboto"
            />

            <HStack spacing="8px">
              <Image
                src={tokenIcon}
                alt={tokenSymbol}
                width="24px"
                height="24px"
              />
              <Text
                fontSize="18px"
                fontWeight="600"
                color="black"
                fontFamily="Roboto"
              >
                {tokenSymbol}
              </Text>
            </HStack>
          </Flex>

          {/* Percentage buttons */}
          {onPercentageClick && (
            <HStack spacing="8px">
              {percentageButtons.map((percentage) => (
                <Button
                  key={percentage}
                  flex="1"
                  height="32px"
                  bg="rgba(0,0,0,0.05)"
                  color="rgba(0,0,0,0.5)"
                  borderRadius="8px"
                  fontWeight="600"
                  fontSize="14px"
                  fontFamily="Roboto"
                  border="none"
                  _hover={{ bg: "rgba(0,0,0,0.08)" }}
                  _active={{ bg: "rgba(0,0,0,0.12)" }}
                  onClick={() => onPercentageClick(percentage)}
                  isDisabled={isDisabled}
                >
                  {percentage}%
                </Button>
              ))}
            </HStack>
          )}
        </VStack>
      </Box>
    );
  }
);

TokenInput.displayName = "TokenInput";
