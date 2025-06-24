import type { TokenBalance, TokenBalanceRaw, TokenBalanceUtils } from "../types";

/**
 * Token balance conversion utilities
 */
export const tokenBalanceUtils: TokenBalanceUtils = {
  /**
   * Convert raw blockchain values to display format
   */
  formatBalance: (balance: TokenBalanceRaw): TokenBalance => ({
    b3tr: Number(balance.b3tr / BigInt(1e18)),
    vot3: Number(balance.vot3 / BigInt(1e18)),
  }),

  /**
   * Convert display format to raw blockchain values
   */
  parseBalance: (balance: TokenBalance): TokenBalanceRaw => ({
    b3tr: BigInt(Math.floor(balance.b3tr * 1e18)),
    vot3: BigInt(Math.floor(balance.vot3 * 1e18)),
  }),

  /**
   * Format amount for display with proper decimals
   */
  formatForDisplay: (amount: number, decimals: number = 2): string => {
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  },
};

/**
 * Create empty token balance
 */
export const createEmptyBalance = (): TokenBalance => ({
  b3tr: 0,
  vot3: 0,
});

/**
 * Create empty raw token balance
 */
export const createEmptyRawBalance = (): TokenBalanceRaw => ({
  b3tr: BigInt(0),
  vot3: BigInt(0),
});

/**
 * Validate token amount
 */
export const validateTokenAmount = (amount: string): {
  isValid: boolean;
  error?: string;
  value?: number;
} => {
  if (!amount || amount.trim() === "") {
    return { isValid: false, error: "Amount is required" };
  }

  const numericValue = parseFloat(amount);
  
  if (isNaN(numericValue)) {
    return { isValid: false, error: "Invalid amount format" };
  }

  if (numericValue <= 0) {
    return { isValid: false, error: "Amount must be greater than 0" };
  }

  if (numericValue > 1e12) {
    return { isValid: false, error: "Amount is too large" };
  }

  // Check for too many decimal places
  const decimalPlaces = (amount.split('.')[1] || '').length;
  if (decimalPlaces > 18) {
    return { isValid: false, error: "Too many decimal places (max 18)" };
  }

  return { isValid: true, value: numericValue };
};

/**
 * Check if user has sufficient balance
 */
export const checkSufficientBalance = (
  amount: number,
  balance: number,
  tokenType: 'B3TR' | 'VOT3'
): {
  isValid: boolean;
  error?: string;
} => {
  if (amount > balance) {
    return {
      isValid: false,
      error: `Insufficient ${tokenType} balance. Available: ${tokenBalanceUtils.formatForDisplay(balance)}`,
    };
  }

  return { isValid: true };
};

/**
 * Convert string amount to BigInt for blockchain operations
 */
export const amountToBigInt = (amount: string): bigint => {
  const validation = validateTokenAmount(amount);
  if (!validation.isValid || !validation.value) {
    throw new Error(validation.error || "Invalid amount");
  }

  return BigInt(Math.floor(validation.value * 1e18));
};

/**
 * Convert BigInt amount to string for display
 */
export const bigIntToAmount = (amount: bigint): string => {
  return (Number(amount) / 1e18).toString();
};
