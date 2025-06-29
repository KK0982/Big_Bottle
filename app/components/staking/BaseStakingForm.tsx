"use client";

import { VStack } from "@chakra-ui/react";
import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useUserInfo } from "../../hooks/use-user-info";
import { useBalanceQuery } from "../../hooks/use-balance-query";
import { useStakingOperations } from "../../hooks/use-staking-operations";
import { useToastNotifications } from "../../hooks/use-toast-notifications";
import {
  validateTokenAmount,
  checkSufficientBalance,
} from "../../utils/token-balance";
import { TokenInput } from "./TokenInput";
import { FormActions } from "./FormActions";

interface BaseStakingFormProps {
  mode: "stake" | "unstake";
  onClose: () => void;
}

export function BaseStakingForm({ mode, onClose }: BaseStakingFormProps) {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { userInfo } = useUserInfo();
  const { balance: accountBalance } = useBalanceQuery(
    userInfo.account || undefined
  );
  const { balance: stakingBalance } = useBalanceQuery(
    userInfo.smartAccountAddress || undefined
  );
  const { stake, unstake, canStake, isConnected } = useStakingOperations();
  const { showOperationResult, showLoadingToast } = useToastNotifications();

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
    return checkSufficientBalance(validation.value!, balance, tokenType);
  }, [amount, balance, isStakeMode]);

  useEffect(() => {
    if (amountValidation.error) {
      setValidationError(amountValidation.error);
    } else {
      setValidationError(null);
    }
  }, [amountValidation]);

  const handlePercentageClick = useCallback(
    (percentage: number) => {
      const balanceNum = Number(balance) / 1e18;
      const newAmount = (balanceNum * percentage) / 100;
      setAmount(newAmount.toString());
    },
    [balance]
  );

  const handleSubmit = useCallback(async () => {
    if (!amountValidation.isValid || !canStake || !isConnected || isLoading)
      return;

    setIsLoading(true);
    setValidationError(null);

    const loadingToastId = showLoadingToast(mode);

    try {
      const operation = isStakeMode ? stake : unstake;
      const result = await operation(amount);

      showOperationResult(result, amount, mode);

      if (result.success) {
        onClose();
      }
    } catch (error) {
      console.error(`${mode} failed:`, error);
      setValidationError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [
    amount,
    amountValidation,
    canStake,
    isConnected,
    isLoading,
    mode,
    isStakeMode,
    stake,
    unstake,
    showLoadingToast,
    showOperationResult,
    onClose,
  ]);

  const submitText = isStakeMode ? "Stake" : "Unstake to B3TR";
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
        onChange={setAmount}
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
        validationError={validationError}
        warningText={warningText}
        footerText={footerText}
      />
    </VStack>
  );
}
