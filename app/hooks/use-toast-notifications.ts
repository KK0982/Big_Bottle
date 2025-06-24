import { useToast } from "@chakra-ui/react";
import { useCallback } from "react";
import type { StakingError, OperationResult } from "../types";

export interface ToastNotificationOptions {
  title: string;
  description?: string;
  status: "success" | "error" | "warning" | "info";
  duration?: number;
  isClosable?: boolean;
}

export function useToastNotifications() {
  const toast = useToast();

  const showToast = useCallback(
    (options: ToastNotificationOptions) => {
      toast({
        title: options.title,
        description: options.description,
        status: options.status,
        duration: options.duration ?? 5000,
        isClosable: options.isClosable ?? true,
        position: "top",
      });
    },
    [toast]
  );

  const showStakingSuccess = useCallback(
    (txid: string, amount: string) => {
      showToast({
        title: "Staking Successful!",
        description: `Successfully staked ${amount} B3TR. Transaction: ${txid.slice(0, 10)}...`,
        status: "success",
        duration: 7000,
      });
    },
    [showToast]
  );

  const showUnstakingSuccess = useCallback(
    (txid: string, amount: string) => {
      showToast({
        title: "Unstaking Successful!",
        description: `Successfully unstaked ${amount} VOT3. Transaction: ${txid.slice(0, 10)}...`,
        status: "success",
        duration: 7000,
      });
    },
    [showToast]
  );

  const showStakingError = useCallback(
    (error: StakingError) => {
      let title = "Staking Failed";
      let description = error.message;

      // Customize error messages based on error code
      switch (error.code) {
        case "NO_ACCOUNT":
          title = "Wallet Not Connected";
          description = "Please connect your wallet to continue staking.";
          break;
        case "INSUFFICIENT_BALANCE":
          title = "Insufficient Balance";
          break;
        case "INVALID_AMOUNT":
          title = "Invalid Amount";
          break;
        case "NO_SMART_ACCOUNT":
          title = "Smart Account Required";
          description = "A smart account is required for staking operations.";
          break;
        case "USER_REJECTED":
          title = "Transaction Cancelled";
          description = "You cancelled the transaction.";
          break;
        default:
          break;
      }

      showToast({
        title,
        description,
        status: "error",
        duration: 8000,
      });
    },
    [showToast]
  );

  const showOperationResult = useCallback(
    (result: OperationResult, amount: string, operation: "stake" | "unstake") => {
      if (result.success && result.txid) {
        if (operation === "stake") {
          showStakingSuccess(result.txid, amount);
        } else {
          showUnstakingSuccess(result.txid, amount);
        }
      } else if (result.error) {
        showStakingError(result.error);
      }
    },
    [showStakingSuccess, showUnstakingSuccess, showStakingError]
  );

  const showLoadingToast = useCallback(
    (operation: "stake" | "unstake") => {
      const title = operation === "stake" ? "Processing Stake..." : "Processing Unstake...";
      const description = "Please confirm the transaction in your wallet.";
      
      return toast({
        title,
        description,
        status: "info",
        duration: null, // Keep open until manually closed
        isClosable: false,
      });
    },
    [toast]
  );

  return {
    showToast,
    showStakingSuccess,
    showUnstakingSuccess,
    showStakingError,
    showOperationResult,
    showLoadingToast,
  };
}
