import { UseQueryOptions } from "@tanstack/react-query";

// Optimized query configurations for VeDelegate staking
export const QueryConfig = {
  // Token balances (B3TR, VOT3) - frequently updated during staking
  BALANCE: {
    staleTime: 15 * 1000, // 15 seconds - more frequent for active staking
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex: number) =>
      Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  },

  // User info and smart account data - changes less frequently
  USER_INFO: {
    staleTime: 3 * 60 * 1000, // 3 minutes - reduced for better UX
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    retryDelay: (attemptIndex: number) =>
      Math.min(1000 * 2 ** attemptIndex, 5000),
    refetchOnWindowFocus: false,
  },

  // Staking rewards - updated periodically by VeDelegate
  REWARDS: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex: number) =>
      Math.min(1000 * 2 ** attemptIndex, 10000),
    refetchOnWindowFocus: true,
  },

  // Static contract data (addresses, configurations)
  STATIC: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 1,
    retryDelay: () => 2000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  },

  // Real-time transaction data
  REALTIME: {
    staleTime: 5 * 1000, // 5 seconds - very fresh for tx status
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    retryDelay: (attemptIndex: number) =>
      Math.min(500 * 2 ** attemptIndex, 5000),
    refetchOnWindowFocus: true,
  },

  // VeDelegate specific - pool and delegation status
  DELEGATION: {
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex: number) =>
      Math.min(1000 * 2 ** attemptIndex, 8000),
    refetchOnWindowFocus: false,
  },
} as const;

// Query key factories for consistent caching
export const QueryKeys = {
  // Balance queries
  balance: (address?: string, contractAddresses?: Record<string, string>) =>
    ["balance", address, contractAddresses] as const,

  // User info queries
  userInfo: (
    account?: string,
    contractAddresses?: Record<string, string>,
    appId?: string
  ) => ["userInfo", account, contractAddresses, appId] as const,

  // Rewards queries
  rewards: (smartAccountAddress?: string, rewarderAddress?: string) =>
    ["rewards", smartAccountAddress, rewarderAddress] as const,

  // Staking data queries
  stakingData: (userAccount?: string, smartAccount?: string) =>
    ["stakingData", userAccount, smartAccount] as const,

  // Receipt queries
  receipts: (account?: string, filters?: Record<string, any>) =>
    ["receipts", account, filters] as const,

  // Weekly points queries
  weeklyPoints: (account?: string, week?: string) =>
    ["weeklyPoints", account, week] as const,

  // Daily limit queries
  dailyLimit: (account?: string, date?: string) =>
    ["dailyLimit", account, date] as const,

  // Blacklist queries
  blacklist: (account?: string) => ["blacklist", account] as const,

  // Vote preference queries
  votePreference: (
    address?: string,
    contractAddresses?: Record<string, string>
  ) => ["votePreference", address, contractAddresses] as const,

  // VeDelegate specific queries
  stakingPool: (tokenId?: string, smartAccountAddress?: string) =>
    ["stakingPool", tokenId, smartAccountAddress] as const,

  delegationStatus: (userAddress?: string, smartAccountAddress?: string) =>
    ["delegationStatus", userAddress, smartAccountAddress] as const,

  poolStatistics: (poolAddress?: string) =>
    ["poolStatistics", poolAddress] as const,

  stakingHistory: (userAddress?: string, limit?: number) =>
    ["stakingHistory", userAddress, limit] as const,

  // Network and health queries
  networkStatus: () => ["networkStatus"] as const,

  contractHealth: (contractAddress?: string) =>
    ["contractHealth", contractAddress] as const,
} as const;

import { parseError, formatErrorMessage, shouldRetryError } from "../utils";

// Error handling utilities
export const handleQueryError = (error: unknown): string => {
  const parsedError = parseError(error);
  return formatErrorMessage(parsedError);
};

// Common retry condition
export const shouldRetry = (failureCount: number, error: unknown): boolean => {
  const parsedError = parseError(error);

  // Use standardized retry logic
  if (!shouldRetryError(parsedError)) {
    return false;
  }

  // Retry up to 3 times for retryable errors
  return failureCount < 3;
};

// Create a standardized query options factory
export const createQueryOptions = <T>(
  config: keyof typeof QueryConfig,
  options: Partial<UseQueryOptions<T>> = {}
): UseQueryOptions<T> => {
  const baseConfig = QueryConfig[config];

  return {
    ...baseConfig,
    ...options,
    retry: options.retry ?? shouldRetry,
  } as UseQueryOptions<T>;
};
