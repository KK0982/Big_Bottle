"use client";

import {
  VStack,
  Text,
  Button,
  Alert,
  AlertIcon,
  AlertDescription,
} from "@chakra-ui/react";

interface FormActionsProps {
  isConnected: boolean;
  isLoading: boolean;
  isDisabled: boolean;
  onSubmit: () => void;
  submitText: string;
  validationError?: string | null;
  warningText?: string;
  footerText?: string;
}

export function FormActions({
  isConnected,
  isLoading,
  isDisabled,
  onSubmit,
  submitText,
  validationError,
  warningText,
  footerText,
}: FormActionsProps) {
  return (
    <VStack spacing="12px" align="stretch">
      {validationError && (
        <Alert status="error" borderRadius="12px">
          <AlertIcon />
          <AlertDescription fontSize="14px">{validationError}</AlertDescription>
        </Alert>
      )}

      {!isConnected && (
        <Alert status="warning" borderRadius="12px">
          <AlertIcon />
          <AlertDescription fontSize="14px">
            Please connect your wallet to continue.
          </AlertDescription>
        </Alert>
      )}

      <Button
        bg="rgba(1, 227, 92, 0.5)"
        color="white"
        borderRadius="20px"
        fontWeight="600"
        fontSize="18px"
        height="54px"
        fontFamily="Roboto"
        _hover={{ bg: "rgba(1, 227, 92, 0.7)" }}
        _active={{ bg: "rgba(1, 227, 92, 0.8)" }}
        _disabled={{
          bg: "rgba(1, 227, 92, 0.3)",
          opacity: 1,
          cursor: "not-allowed",
        }}
        isDisabled={isDisabled}
        isLoading={isLoading}
        loadingText="Processing..."
        onClick={onSubmit}
      >
        {!isConnected ? "Connect Wallet" : submitText}
      </Button>

      {(warningText || footerText) && (
        <VStack spacing="12px" align="stretch">
          {warningText && (
            <Text
              fontSize="14px"
              color="rgba(0,0,0,0.5)"
              textAlign="left"
              lineHeight="20px"
              fontFamily="Roboto"
              fontWeight="400"
            >
              When staking, you{" "}
              <Text as="span" fontWeight="600" color="black">
                won&apos;t be able to manually vote
              </Text>{" "}
              on VeBetterDAO as the staking wallet will do it for you.
              <br />
              <br />
              Your new deposit will earn rewards starting on 2025-06-09. Rewards
              will be claimable after 2025-06-16.
            </Text>
          )}
          {footerText && (
            <Text
              fontSize="14px"
              color="rgba(0,0,0,0.5)"
              textAlign="center"
              fontFamily="Roboto"
              fontWeight="400"
            >
              {footerText}
            </Text>
          )}
        </VStack>
      )}
    </VStack>
  );
}
