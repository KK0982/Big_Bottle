// Error handling utilities

import type { StakingError } from "../types";

// Error codes for different types of errors
export const ERROR_CODES = {
  // Network errors
  NETWORK_ERROR: "NETWORK_ERROR",
  CONNECTION_FAILED: "CONNECTION_FAILED",
  TIMEOUT: "TIMEOUT",

  // Authentication errors
  WALLET_NOT_CONNECTED: "WALLET_NOT_CONNECTED",
  INVALID_ACCOUNT: "INVALID_ACCOUNT",
  SIGNATURE_REJECTED: "SIGNATURE_REJECTED",

  // Contract errors
  CONTRACT_ERROR: "CONTRACT_ERROR",
  INSUFFICIENT_BALANCE: "INSUFFICIENT_BALANCE",
  INVALID_AMOUNT: "INVALID_AMOUNT",
  POOL_NOT_FOUND: "POOL_NOT_FOUND",
  DELEGATION_FAILED: "DELEGATION_FAILED",

  // Validation errors
  INVALID_INPUT: "INVALID_INPUT",
  REQUIRED_FIELD: "REQUIRED_FIELD",
  INVALID_ADDRESS: "INVALID_ADDRESS",

  // File upload errors
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  INVALID_FILE_TYPE: "INVALID_FILE_TYPE",
  UPLOAD_FAILED: "UPLOAD_FAILED",

  // API errors
  API_ERROR: "API_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  RATE_LIMITED: "RATE_LIMITED",

  // Unknown errors
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

// Error messages for different error codes
export const ERROR_MESSAGES = {
  [ERROR_CODES.NETWORK_ERROR]:
    "Network connection error. Please check your connection and try again.",
  [ERROR_CODES.CONNECTION_FAILED]:
    "Failed to connect to the blockchain. Please try again later.",
  [ERROR_CODES.TIMEOUT]: "Request timed out. Please try again.",

  [ERROR_CODES.WALLET_NOT_CONNECTED]: "Please connect your wallet to continue.",
  [ERROR_CODES.INVALID_ACCOUNT]:
    "Invalid wallet account. Please check your connection.",
  [ERROR_CODES.SIGNATURE_REJECTED]: "Transaction signature was rejected.",

  [ERROR_CODES.CONTRACT_ERROR]:
    "Smart contract interaction failed. Please try again.",
  [ERROR_CODES.INSUFFICIENT_BALANCE]:
    "Insufficient balance for this transaction.",
  [ERROR_CODES.INVALID_AMOUNT]: "Invalid amount specified.",
  [ERROR_CODES.POOL_NOT_FOUND]: "Staking pool not found.",
  [ERROR_CODES.DELEGATION_FAILED]: "Passport delegation failed.",

  [ERROR_CODES.INVALID_INPUT]: "Invalid input provided.",
  [ERROR_CODES.REQUIRED_FIELD]: "This field is required.",
  [ERROR_CODES.INVALID_ADDRESS]: "Invalid address format.",

  [ERROR_CODES.FILE_TOO_LARGE]:
    "File size is too large. Please choose a smaller file.",
  [ERROR_CODES.INVALID_FILE_TYPE]:
    "Invalid file type. Please choose a valid image file.",
  [ERROR_CODES.UPLOAD_FAILED]: "File upload failed. Please try again.",

  [ERROR_CODES.API_ERROR]: "API request failed. Please try again later.",
  [ERROR_CODES.UNAUTHORIZED]: "Unauthorized access. Please log in again.",
  [ERROR_CODES.FORBIDDEN]:
    "Access forbidden. You don't have permission for this action.",
  [ERROR_CODES.NOT_FOUND]: "Requested resource not found.",
  [ERROR_CODES.RATE_LIMITED]: "Too many requests. Please wait and try again.",

  [ERROR_CODES.UNKNOWN_ERROR]: "An unknown error occurred. Please try again.",
} as const;

// Create a standardized error object
export const createError = (
  code: keyof typeof ERROR_CODES,
  message?: string,
  details?: any
): StakingError => {
  const error = new Error(message || ERROR_MESSAGES[code]) as StakingError;
  error.code = code;
  error.details = details;
  return error;
};

// Parse error from different sources
export const parseError = (error: unknown): StakingError => {
  if (error instanceof Error) {
    // Check if it's already a StakingError
    if ("code" in error) {
      return error as StakingError;
    }

    // Parse VeChain specific errors
    const message = error.message.toLowerCase();

    if (message.includes("insufficient")) {
      return createError(ERROR_CODES.INSUFFICIENT_BALANCE, error.message);
    }

    if (message.includes("rejected") || message.includes("user denied")) {
      return createError(ERROR_CODES.SIGNATURE_REJECTED, error.message);
    }

    if (message.includes("network") || message.includes("connection")) {
      return createError(ERROR_CODES.NETWORK_ERROR, error.message);
    }

    if (message.includes("timeout")) {
      return createError(ERROR_CODES.TIMEOUT, error.message);
    }

    if (message.includes("contract")) {
      return createError(ERROR_CODES.CONTRACT_ERROR, error.message);
    }

    // Default to contract error for Error objects
    return createError(ERROR_CODES.CONTRACT_ERROR, error.message);
  }

  if (typeof error === "string") {
    return createError(ERROR_CODES.UNKNOWN_ERROR, error);
  }

  return createError(ERROR_CODES.UNKNOWN_ERROR);
};

// Check if error should be retried
export const shouldRetryError = (error: StakingError): boolean => {
  const nonRetryableCodes = [
    ERROR_CODES.WALLET_NOT_CONNECTED,
    ERROR_CODES.SIGNATURE_REJECTED,
    ERROR_CODES.INSUFFICIENT_BALANCE,
    ERROR_CODES.INVALID_AMOUNT,
    ERROR_CODES.INVALID_INPUT,
    ERROR_CODES.INVALID_ADDRESS,
    ERROR_CODES.UNAUTHORIZED,
    ERROR_CODES.FORBIDDEN,
    ERROR_CODES.NOT_FOUND,
  ];

  return !nonRetryableCodes.includes(error.code as any);
};

// Format error message for display
export const formatErrorMessage = (error: StakingError): string => {
  // If we have a user-friendly message, use it
  if (error.code && ERROR_MESSAGES[error.code as keyof typeof ERROR_MESSAGES]) {
    return ERROR_MESSAGES[error.code as keyof typeof ERROR_MESSAGES];
  }

  // Otherwise, use the original message
  return error.message || ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR];
};

// Log error for debugging
export const logError = (error: StakingError, context?: string): void => {
  console.error(`[${context || "Error"}]`, {
    code: error.code,
    message: error.message,
    details: error.details,
    stack: error.stack,
  });
};
