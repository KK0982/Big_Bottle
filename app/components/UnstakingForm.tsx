"use client";

import {
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Box,
  Flex,
  Image,
} from "@chakra-ui/react";
import { useState } from "react";
import { useUserInfo } from "../hooks/use-user-info";
import { useBalanceQuery } from "../hooks/use-balance-query";
import { useStakingOperations } from "../hooks/use-staking-operations";

interface UnstakingFormProps {
  onClose: () => void;
}

export function UnstakingForm({ onClose }: UnstakingFormProps) {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { userInfo } = useUserInfo();
  const { balance: stakingBalance } = useBalanceQuery(
    userInfo.smartAccountAddress || undefined
  );
  const { unstake, canStake } = useStakingOperations();
  const stakedBalance = stakingBalance.b3tr + stakingBalance.vot3;
  const percentageButtons = [25, 50, 75, 100];

  const handlePercentageClick = (percentage: number) => {
    const calculatedAmount = (stakedBalance * percentage) / 100;
    setAmount(calculatedAmount.toFixed(2));
  };

  const handleUnstake = async () => {
    if (!amount || parseFloat(amount) <= 0 || !canStake) return;

    setIsLoading(true);
    try {
      await unstake(amount);
      onClose();
      // TODO: 显示成功消息并刷新数据
    } catch (error) {
      console.error("取消质押失败:", error);
      // TODO: 显示错误消息
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VStack spacing="1.5rem" align="stretch">
      {/* Amount Input Section */}
      <Box bg="gray.50" borderRadius="1rem" p="1rem">
        <VStack spacing="1rem" align="stretch">
          <Flex justify="space-between" align="center">
            <Text fontSize="0.875rem" color="gray.600">
              Amount
            </Text>
            <Text fontSize="0.875rem" color="gray.600">
              Balance: {stakedBalance.toFixed(2)}
            </Text>
          </Flex>

          <Flex align="center" justify="space-between">
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              fontSize="1.5rem"
              fontWeight="medium"
              border="none"
              bg="transparent"
              p="0"
              _focus={{ boxShadow: "none" }}
              color="gray.600"
            />
            <HStack spacing="0.5rem" align="center">
              <Image
                src="/icons/b3tr.png"
                alt="B3TR"
                width="1.5rem"
                height="1.5rem"
              />
              <Text fontSize="1rem" fontWeight="medium" color="blue.600">
                B3TR
              </Text>
            </HStack>
          </Flex>

          {/* Percentage Buttons */}
          <HStack spacing="0.5rem">
            {percentageButtons.map((percentage) => (
              <Button
                key={percentage}
                flex="1"
                bg="rgba(0, 0, 0, 0.05)"
                color="rgba(0, 0, 0, 0.5)"
                borderRadius="0.5rem"
                fontWeight="medium"
                fontSize="0.875rem"
                h="2rem"
                _hover={{ bg: "rgba(0, 0, 0, 0.1)" }}
                onClick={() => handlePercentageClick(percentage)}
              >
                {percentage}%
              </Button>
            ))}
          </HStack>
        </VStack>
      </Box>

      {/* Unstake Button */}
      <Button
        bg="#01E35C"
        color="white"
        borderRadius="3rem"
        fontWeight="medium"
        fontSize="1.125rem"
        h="3.375rem"
        _hover={{ bg: "#00C84A" }}
        _disabled={{ bg: "rgba(1, 227, 92, 0.5)", opacity: 1 }}
        isDisabled={!amount || parseFloat(amount) <= 0 || !canStake}
        isLoading={isLoading}
        onClick={handleUnstake}
      >
        Unstake
      </Button>

      {/* Footer - 只有 Powered by */}
      <Text fontSize="0.75rem" color="gray.500" textAlign="center">
        Powered by veDelegate.vet
      </Text>
    </VStack>
  );
}
