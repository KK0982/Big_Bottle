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
  Alert,
  AlertIcon,
  AlertDescription,
} from "@chakra-ui/react";
import { useState, useRef, useCallback, useMemo } from "react";
import { useUserInfo } from "../hooks/use-user-info";
import { useBalanceQuery } from "../hooks/use-balance-query";
import { useStakingOperations } from "../hooks/use-staking-operations";
import { useToastNotifications } from "../hooks/use-toast-notifications";
import { validateTokenAmount, checkSufficientBalance, tokenBalanceUtils } from "../utils/token-balance";

interface StakingFormProps {
  onClose: () => void;
}

export function StakingForm({ onClose }: StakingFormProps) {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { userInfo } = useUserInfo();
  const { balance: accountBalance } = useBalanceQuery(
    userInfo.account || undefined
  );
  const { stake, canStake, isConnected } = useStakingOperations();
  const { showOperationResult, showLoadingToast } = useToastNotifications();
  const balance = accountBalance.b3tr;
  const percentageButtons = [25, 50, 75, 100];

  // Validate amount in real-time
  const amountValidation = useMemo(() => {
    if (!amount) return { isValid: true };

    const validation = validateTokenAmount(amount);
    if (!validation.isValid) return validation;

    return checkSufficientBalance(validation.value!, balance, 'B3TR');
  }, [amount, balance]);

  // Update validation error when amount changes
  const handleAmountChange = useCallback((value: string) => {
    setAmount(value);
    setValidationError(null);
  }, []);

  const handlePercentageClick = useCallback((percentage: number) => {
    const calculatedAmount = (balance * percentage) / 100;
    handleAmountChange(calculatedAmount.toFixed(2));
  }, [balance, handleAmountChange]);

  const handleStake = useCallback(async () => {
    // Validate before proceeding
    if (!amountValidation.isValid) {
      setValidationError(amountValidation.error || "Invalid amount");
      return;
    }

    if (!canStake || !isConnected) {
      setValidationError("Unable to stake. Please check your wallet connection.");
      return;
    }

    // Blur the input to remove focus before opening VeChain dialog
    if (inputRef.current) {
      inputRef.current.blur();
    }

    setIsLoading(true);
    setValidationError(null);

    // Show loading toast
    const loadingToastId = showLoadingToast("stake");

    try {
      const result = await stake(amount);

      // Close loading toast
      if (loadingToastId) {
        // Note: In a real implementation, you'd want to close the specific toast
        // For now, we'll rely on the result toast to provide feedback
      }

      // Show result
      showOperationResult(result, amount, "stake");

      // Close modal on success
      if (result.success) {
        onClose();
      }
    } catch (error) {
      console.error("Staking failed:", error);
      setValidationError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [amount, amountValidation, canStake, isConnected, stake, showLoadingToast, showOperationResult, onClose]);

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
              Balance: {tokenBalanceUtils.formatForDisplay(balance)} B3TR
            </Text>
          </Flex>

          <Flex align="center" justify="space-between">
            <Input
              ref={inputRef}
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.0"
              fontSize="1.5rem"
              fontWeight="medium"
              border="none"
              bg="transparent"
              p="0"
              _focus={{ boxShadow: "none" }}
              color="gray.600"
              autoFocus={false}
              isDisabled={isLoading}
              isInvalid={!amountValidation.isValid && !!amount}
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
                isDisabled={isLoading}
              >
                {percentage}%
              </Button>
            ))}
          </HStack>
        </VStack>
      </Box>

      {/* Validation Error */}
      {(validationError || (!amountValidation.isValid && !!amount)) && (
        <Alert status="error" borderRadius="0.75rem">
          <AlertIcon />
          <AlertDescription fontSize="0.875rem">
            {validationError || amountValidation.error}
          </AlertDescription>
        </Alert>
      )}

      {/* Connection Warning */}
      {!isConnected && (
        <Alert status="warning" borderRadius="0.75rem">
          <AlertIcon />
          <AlertDescription fontSize="0.875rem">
            Please connect your wallet to stake tokens.
          </AlertDescription>
        </Alert>
      )}

      {/* Stake Button */}
      <Button
        bg="#01E35C"
        color="white"
        borderRadius="3rem"
        fontWeight="medium"
        fontSize="1.125rem"
        h="3.375rem"
        _hover={{ bg: "#00C84A" }}
        _disabled={{ bg: "rgba(1, 227, 92, 0.5)", opacity: 1 }}
        isDisabled={
          !amount ||
          !amountValidation.isValid ||
          !canStake ||
          !isConnected ||
          isLoading
        }
        isLoading={isLoading}
        loadingText="Processing..."
        onClick={handleStake}
      >
        {!isConnected ? "Connect Wallet" : "Stake"}
      </Button>

      {/* Warning Text */}
      <VStack spacing="0.75rem" align="center">
        <Text
          fontSize="0.875rem"
          color="gray.600"
          textAlign="center"
          lineHeight="1.4"
        >
          When staking, you{" "}
          <Text as="span" fontWeight="semibold">
            won&apos;t be able to manually vote
          </Text>{" "}
          on VeBetterDAO as the staking wallet will do it for you.
        </Text>
        <Text
          fontSize="0.875rem"
          color="gray.600"
          textAlign="center"
          lineHeight="1.4"
        >
          Your new deposit will earn rewards starting on 2025-06-09. Rewards
          will be claimable after 2025-06-16.
        </Text>
        <Text
          fontSize="0.75rem"
          color="gray.500"
          textAlign="center"
          mt="0.5rem"
        >
          Powered by veDelegate.vet
        </Text>
      </VStack>
    </VStack>
  );
}
