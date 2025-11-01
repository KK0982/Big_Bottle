"use client";

import { VStack } from "@chakra-ui/react";
import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useUserInfo } from "../../hooks/use-user-info";
import { useStakingOperations } from "../../hooks/use-staking-operations";
import { useToastNotifications } from "../../hooks/use-toast-notifications";
import {
  validateTokenAmount,
  checkSufficientBalance,
  amountToBigInt,
} from "../../utils/token-balance";
import { MIN_STAKING_AMOUNT } from "../../utils/staking-security";
import { TokenInput } from "./TokenInput";
import { FormActions } from "./FormActions";
import type { StakingError, OperationResult } from "../../types";

interface BaseStakingFormProps {
  mode: "stake" | "unstake";
  onClose: () => void;
}

const WEI_PER_B3TR = 10n ** 18n;
const MIN_FIRST_STAKE_AMOUNT_B3TR = 50;
const MIN_FIRST_STAKE_AMOUNT_WEI =
  BigInt(MIN_FIRST_STAKE_AMOUNT_B3TR) * WEI_PER_B3TR;
const MIN_OPERATION_AMOUNT_B3TR = Number(MIN_STAKING_AMOUNT) / 1e18;

export function BaseStakingForm({ mode, onClose }: BaseStakingFormProps) {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [pendingTxId, setPendingTxId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { userInfo } = useUserInfo();
  const {
    stake,
    unstake,
    canStake,
    isConnected,
    accountBalance,
    stakingBalance,
    isBalancesLoading,
  } = useStakingOperations();
  const { showOperationResult } = useToastNotifications();

  const isStakeMode = mode === "stake";
  const balance = isStakeMode
    ? accountBalance.b3tr
    : stakingBalance.b3tr + stakingBalance.vot3;
  const tokenSymbol = "B3TR";
  const tokenIcon = "/icons/b3tr.png";

  const amountValidation = useMemo(() => {
    if (!amount) return { isValid: true };

    const validation = validateTokenAmount(amount);
    if (!validation.isValid) return validation;

    const tokenType = isStakeMode ? "B3TR" : "VOT3";
    const minAmountLabel = `${MIN_OPERATION_AMOUNT_B3TR} B3TR`;
    const balanceCheck = checkSufficientBalance(
      validation.value!,
      balance,
      tokenType
    );
    if (!balanceCheck.isValid) {
      return { ...balanceCheck, value: validation.value };
    }

    // Enforce minimum stake amount to avoid dust operations
    const amountWei = amountToBigInt(amount, tokenType);
    if (isStakeMode && amountWei < MIN_STAKING_AMOUNT) {
      return {
        isValid: false,
        error: `Minimum staking amount is ${minAmountLabel}`,
        value: validation.value,
      };
    }

    const isFirstStake = isStakeMode && !userInfo.hasPool;
    if (isFirstStake) {
      const currentStakeWei = stakingBalance.b3tr + stakingBalance.vot3;
      if (currentStakeWei + amountWei < MIN_FIRST_STAKE_AMOUNT_WEI) {
        return {
          isValid: false,
          error: `Minimum stake amount is ${MIN_FIRST_STAKE_AMOUNT_B3TR} B3TR`,
          value: validation.value,
        };
      }
    }

    return { isValid: true, value: validation.value };
  }, [
    amount,
    balance,
    isStakeMode,
    userInfo.hasPool,
    stakingBalance.b3tr,
    stakingBalance.vot3,
  ]);

  useEffect(() => {
    if (amountValidation.error) {
      setValidationError(amountValidation.error);
    } else {
      setValidationError(null);
    }
  }, [amountValidation]);

  const formatAmount = useCallback((value: number) => {
    if (value === 0) {
      return "0";
    }

    const truncated = Math.floor(value * 10000) / 10000;
    return truncated.toFixed(4);
  }, []);

  const handlePercentageClick = useCallback(
    (percentage: number) => {
      const balanceNum = Number(balance) / 1e18;
      const rawAmount = (balanceNum * percentage) / 100;
      setAmount(formatAmount(rawAmount));
    },
    [balance, formatAmount]
  );

  const handleInputChange = useCallback(
    (rawValue: string) => {
      if (!rawValue) {
        setAmount("");
        return;
      }

      const value = rawValue.replace(/,/g, ".");

      if (!/^\d*\.?\d*$/.test(value)) {
        return;
      }

      if (value === ".") {
        setAmount("0.");
        return;
      }

      const [integerPart, decimalPart = ""] = value.split(".");

      if (decimalPart.length > 4) {
        setAmount(`${integerPart}.${decimalPart.slice(0, 4)}`);
        return;
      }

      if (value === "0" || value === "0.") {
        setAmount(value);
        return;
      }

      if (value.endsWith(".")) {
        setAmount(value);
        return;
      }

      setAmount(value);
    },
    []
  );

  const toStakingError = useCallback(
    (error: unknown, fallbackMessage: string, fallbackCode: string): StakingError => {
      if (error instanceof Error && "code" in error) {
        return error as StakingError;
      }
      const stakingError = new Error(
        error instanceof Error ? error.message : fallbackMessage
      ) as StakingError;
      stakingError.code = fallbackCode;
      stakingError.details = error;
      return stakingError;
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    if (
      !amountValidation.isValid ||
      !canStake ||
      !isConnected ||
      isLoading ||
      isBalancesLoading
    )
      return;

    setIsLoading(true);
    setValidationError(null);
    setPendingTxId(null);

    try {
      const operation = isStakeMode ? stake : unstake;
      const result = await operation(amount);

      const handleFinalResult = (finalResult: OperationResult) => {
        showOperationResult(finalResult, amount, mode);
        if (finalResult.success) {
          onClose();
        } else if (finalResult.error) {
          setValidationError(finalResult.error.message);
        }
      };

      if (result.success && result.txid) {
        setPendingTxId(result.txid);
        try {
          if (result.waitForConfirmation) {
            await result.waitForConfirmation();
          }
          setPendingTxId(null);
          handleFinalResult(result);
        } catch (confirmationError) {
          console.error(`${mode} confirmation failed:`, confirmationError);
          const stakingError = toStakingError(
            confirmationError,
            "Transaction confirmation failed. Please check the transaction status on-chain.",
            "CONFIRMATION_FAILED"
          );
          setPendingTxId(null);
          handleFinalResult({ success: false, error: stakingError });
        }
      } else {
        handleFinalResult(result);
      }
    } catch (error) {
      console.error(`${mode} failed:`, error);

      setValidationError("An unexpected error occurred. Please try again.");
      setPendingTxId(null);
    } finally {
      setIsLoading(false);
    }
  }, [
    amount,
    amountValidation,
    canStake,
    isConnected,
    isLoading,
    isBalancesLoading,
    mode,
    isStakeMode,
    stake,
    unstake,
    showOperationResult,
    toStakingError,
    onClose,
  ]);

  const submitText = isStakeMode ? "Stake" : "Unstake to B3TR";
  const submitLoadingText = isStakeMode ? "Staking..." : "Unstaking...";
  const warningText = isStakeMode
    ? "When staking, you won't be able to manually vote on VeBetterDAO as the staking wallet will do it for you."
    : undefined;
  const footerText = "Powered by veDelegate.vet";

  const isDisabled =
    !amount ||
    !amountValidation.isValid ||
    !canStake ||
    !isConnected ||
    isLoading;

  return (
    <VStack spacing="12px" align="stretch">
      <TokenInput
        ref={inputRef}
        value={amount}
        onChange={handleInputChange}
        balance={balance}
        tokenSymbol={tokenSymbol}
        tokenIcon={tokenIcon}
        isDisabled={isLoading}
        onPercentageClick={handlePercentageClick}
      />

      <FormActions
        isConnected={isConnected}
        isLoading={isLoading}
        isDisabled={isDisabled}
        onSubmit={handleSubmit}
        submitText={submitText}
        loadingText={submitLoadingText}
        validationError={validationError}
        warningText={warningText}
        footerText={footerText}
      />
    </VStack>
  );
}
