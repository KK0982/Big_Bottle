// Staking related types and interfaces

// Signing callback function for EIP-712 authorization
export type SigningCallbackFunc = (
  domain: Domain,
  types: ExecuteWithAuthorizationTypes,
  message: ExecuteWithAuthorizationMessage
) => Promise<string>;

// EIP-712 Domain interface
export interface Domain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
}

// EIP-712 Types for executeWithAuthorization
export interface ExecuteWithAuthorizationTypes {
  ExecuteWithAuthorization: Array<{
    name: string;
    type: string;
  }>;
}

// EIP-712 Message for executeWithAuthorization
export interface ExecuteWithAuthorizationMessage {
  to: string;
  value: string;
  data: string;
  validAfter: number;
  validBefore: number;
  nonce: string;
}

// Token balance information
export interface TokenBalance {
  b3tr: bigint;
  vot3: bigint;
  convertedB3tr: bigint;
  availableB3tr: bigint;
  availableVot3: bigint;
}

// Raw token balance (legacy support)
export interface TokenBalanceRaw {
  b3tr: bigint;
  vot3: bigint;
}

// Token balance utilities (legacy support)
export interface TokenBalanceUtils {
  formatBalance: (balance: TokenBalanceRaw) => TokenBalance;
  parseBalance: (balance: TokenBalance) => TokenBalanceRaw;
  formatForDisplay: (amount: number | bigint, decimals?: number) => string;
}

// User information interface
export interface UserInfo {
  account: string | null;
  tokenId: string;
  smartAccountAddress: string;
  stakingTokenId?: string;
  hasPool: boolean;
  passportAddress?: string;
}

// Staking pool information
export interface StakingPool {
  exists: boolean;
  owner: string;
  tokenId: string;
  smartAccountAddress: string;
}

// Staking position details
export interface StakingPosition {
  tokenId: string;
  amount: bigint;
  stakingTimestamp: number;
  withdrawalTimestamp?: number;
  isActive: boolean;
}

// Pool statistics
export interface PoolStatistics {
  totalStaked: bigint;
  totalParticipants: number;
  averageStake: bigint;
  poolCreationTime: number;
}

// Delegation information
export interface DelegationInfo {
  isDelegated: boolean;
  delegatee?: string;
  delegator?: string;
  delegationTimestamp?: number;
}

// Vote preference information
export interface VotePreference {
  hasVOT3: boolean;
  isDelegated: boolean;
  hasStaking: boolean;
  hasVotePreference: boolean;
  canVote: boolean;
  votingEligibility: {
    minimumStake: bigint;
    hasMinimumStake: boolean;
    delegationRequired: boolean;
    isDelegationComplete: boolean;
  };
}

// Rewards information
export interface RewardsInfo {
  totalRewards: bigint;
  pendingRewards: bigint;
  claimableRewards: bigint;
  lastClaimTimestamp?: number;
  rewardRate: number;
}

// Staking operation parameters
export interface StakingOperationParams {
  b3tr: bigint;
  vot3: bigint;
  signingCallback?: SigningCallbackFunc;
}

// Withdrawal operation parameters
export interface WithdrawalOperationParams extends StakingOperationParams {
  recipient: string;
}

// Smart account signature result
export interface SmartAccountSignature {
  to: string;
  value: string;
  data: string;
  validAfter: number;
  validBefore: number;
  nonce: string;
  signature: string;
}

// App configuration
export interface AppConfig {
  APP_ID: string;
  APP_NAME: string;
}

// Contract addresses
export interface ContractAddresses {
  VeDelegate: string;
  B3TR: string;
  VOT3: string;
  VePassport: string;
  VeBetterDAO: string;
}

// Query configuration
export interface QueryConfig {
  staleTime: number;
  refetchInterval?: number;
  retry?: number;
}

// Error types
export interface StakingError extends Error {
  code?: string;
  details?: any;
}

// Transaction result
export interface TransactionResult {
  txid: string;
  meta: {
    blockID: string;
    blockNumber: number;
    blockTimestamp: number;
  };
}

// Loading states
export interface LoadingStates {
  isLoading: boolean;
  isStaking: boolean;
  isUnstaking: boolean;
  isCreatingPool: boolean;
  isDelegating: boolean;
}

// Operation result interface
export interface OperationResult {
  success: boolean;
  txid?: string;
  meta?: {
    blockID: string;
    blockNumber: number;
    blockTimestamp: number;
  };
  error?: StakingError;
}
