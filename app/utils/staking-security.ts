import type { StakingError } from "../types";

/**
 * Security validation utilities for staking operations
 */

// Maximum allowed staking amount (to prevent overflow)
export const MAX_STAKING_AMOUNT = BigInt("1000000000000000000000000"); // 1M tokens with 18 decimals

// Minimum staking amount (to prevent dust attacks)
export const MIN_STAKING_AMOUNT = BigInt("1000000000000000"); // 0.001 tokens with 18 decimals

// Maximum gas limit for transactions
export const MAX_GAS_LIMIT = 8000000;

// Rate limiting: max operations per minute
export const MAX_OPERATIONS_PER_MINUTE = 5;

/**
 * Validate staking amount for security
 */
export const validateStakingAmount = (amount: bigint): {
  isValid: boolean;
  error?: string;
} => {
  if (amount <= BigInt(0)) {
    return { isValid: false, error: "Amount must be greater than 0" };
  }

  if (amount < MIN_STAKING_AMOUNT) {
    return { 
      isValid: false, 
      error: `Minimum staking amount is ${Number(MIN_STAKING_AMOUNT) / 1e18} tokens` 
    };
  }

  if (amount > MAX_STAKING_AMOUNT) {
    return { 
      isValid: false, 
      error: `Maximum staking amount is ${Number(MAX_STAKING_AMOUNT) / 1e18} tokens` 
    };
  }

  return { isValid: true };
};

/**
 * Validate wallet address format
 */
export const validateAddress = (address: string): {
  isValid: boolean;
  error?: string;
} => {
  if (!address) {
    return { isValid: false, error: "Address is required" };
  }

  // VeChain address validation (0x + 40 hex characters)
  const addressRegex = /^0x[a-fA-F0-9]{40}$/;
  if (!addressRegex.test(address)) {
    return { isValid: false, error: "Invalid address format" };
  }

  // Check for zero address
  if (address.toLowerCase() === "0x0000000000000000000000000000000000000000") {
    return { isValid: false, error: "Cannot use zero address" };
  }

  return { isValid: true };
};

/**
 * Rate limiting tracker
 */
class RateLimiter {
  private operations: Map<string, number[]> = new Map();

  isAllowed(address: string): boolean {
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute window

    // Get existing operations for this address
    const userOps = this.operations.get(address) || [];
    
    // Filter out operations outside the window
    const recentOps = userOps.filter(timestamp => timestamp > windowStart);
    
    // Update the map
    this.operations.set(address, recentOps);

    // Check if under limit
    return recentOps.length < MAX_OPERATIONS_PER_MINUTE;
  }

  recordOperation(address: string): void {
    const now = Date.now();
    const userOps = this.operations.get(address) || [];
    userOps.push(now);
    this.operations.set(address, userOps);
  }

  getRemainingOperations(address: string): number {
    const now = Date.now();
    const windowStart = now - 60000;
    const userOps = this.operations.get(address) || [];
    const recentOps = userOps.filter(timestamp => timestamp > windowStart);
    return Math.max(0, MAX_OPERATIONS_PER_MINUTE - recentOps.length);
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Validate transaction parameters
 */
export const validateTransactionParams = (params: {
  to: string;
  value: string;
  data: string;
  gasLimit?: number;
}): {
  isValid: boolean;
  error?: string;
} => {
  // Validate recipient address
  const addressValidation = validateAddress(params.to);
  if (!addressValidation.isValid) {
    return addressValidation;
  }

  // Validate value
  try {
    const value = BigInt(params.value);
    if (value < BigInt(0)) {
      return { isValid: false, error: "Value cannot be negative" };
    }
  } catch {
    return { isValid: false, error: "Invalid value format" };
  }

  // Validate data format (must be hex)
  if (params.data && !params.data.startsWith("0x")) {
    return { isValid: false, error: "Data must be hex format" };
  }

  // Validate gas limit
  if (params.gasLimit && params.gasLimit > MAX_GAS_LIMIT) {
    return { isValid: false, error: `Gas limit too high (max: ${MAX_GAS_LIMIT})` };
  }

  return { isValid: true };
};

/**
 * Sanitize user input
 */
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[^\d.]/g, '');
};

/**
 * Check for suspicious patterns
 */
export const detectSuspiciousActivity = (params: {
  amount: bigint;
  userAddress: string;
  frequency: number;
}): {
  isSuspicious: boolean;
  reason?: string;
} => {
  // Check for unusually large amounts
  if (params.amount > MAX_STAKING_AMOUNT / BigInt(10)) {
    return { 
      isSuspicious: true, 
      reason: "Unusually large transaction amount" 
    };
  }

  // Check for high frequency operations
  if (params.frequency > MAX_OPERATIONS_PER_MINUTE / 2) {
    return { 
      isSuspicious: true, 
      reason: "High frequency operations detected" 
    };
  }

  return { isSuspicious: false };
};

/**
 * Create security error
 */
export const createSecurityError = (message: string, code: string): StakingError => {
  const error = new Error(message) as StakingError;
  error.code = code;
  return error;
};

/**
 * Comprehensive security check for staking operations
 */
export const performSecurityCheck = (params: {
  amount: bigint;
  userAddress: string;
  recipientAddress?: string;
}): {
  isSecure: boolean;
  error?: StakingError;
} => {
  // Validate user address
  const userAddressValidation = validateAddress(params.userAddress);
  if (!userAddressValidation.isValid) {
    return {
      isSecure: false,
      error: createSecurityError(userAddressValidation.error!, "INVALID_USER_ADDRESS")
    };
  }

  // Validate recipient address if provided
  if (params.recipientAddress) {
    const recipientValidation = validateAddress(params.recipientAddress);
    if (!recipientValidation.isValid) {
      return {
        isSecure: false,
        error: createSecurityError(recipientValidation.error!, "INVALID_RECIPIENT_ADDRESS")
      };
    }
  }

  // Validate amount
  const amountValidation = validateStakingAmount(params.amount);
  if (!amountValidation.isValid) {
    return {
      isSecure: false,
      error: createSecurityError(amountValidation.error!, "INVALID_AMOUNT")
    };
  }

  // Check rate limiting
  if (!rateLimiter.isAllowed(params.userAddress)) {
    const remaining = rateLimiter.getRemainingOperations(params.userAddress);
    return {
      isSecure: false,
      error: createSecurityError(
        `Rate limit exceeded. Try again in a minute. Remaining operations: ${remaining}`,
        "RATE_LIMIT_EXCEEDED"
      )
    };
  }

  // Check for suspicious activity
  const suspiciousCheck = detectSuspiciousActivity({
    amount: params.amount,
    userAddress: params.userAddress,
    frequency: MAX_OPERATIONS_PER_MINUTE - rateLimiter.getRemainingOperations(params.userAddress)
  });

  if (suspiciousCheck.isSuspicious) {
    return {
      isSecure: false,
      error: createSecurityError(
        `Suspicious activity detected: ${suspiciousCheck.reason}`,
        "SUSPICIOUS_ACTIVITY"
      )
    };
  }

  return { isSecure: true };
};
