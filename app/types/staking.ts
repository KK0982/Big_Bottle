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

// Token balance information (raw blockchain values)
export interface TokenBalanceRaw {
  b3tr: bigint;
  vot3: bigint;
}

// Token balance information (formatted for display)
export interface TokenBalance {
  b3tr: number;
  vot3: number;
}

// Token balance utilities
export interface TokenBalanceUtils {
  formatBalance: (balance: TokenBalanceRaw) => TokenBalance;
  parseBalance: (balance: TokenBalance) => TokenBalanceRaw;
  formatForDisplay: (amount: number, decimals?: number) => string;
}

// User information interface
export interface UserInfo {
  account: string | null;
  stakingTokenId: string;
  stakingWallet: string;
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

// Base operation parameters
export interface BaseOperationParams {
  signingCallback?: SigningCallbackFunc;
}

// Staking operation parameters
export interface StakingOperationParams extends BaseOperationParams {
  b3tr: bigint;
  vot3: bigint;
}

// Withdrawal operation parameters
export interface WithdrawalOperationParams extends StakingOperationParams {
  recipient: string;
}

// Simplified staking parameters for UI
export interface StakingUIParams {
  amount: string;
  tokenType: 'B3TR' | 'VOT3';
}

// Operation result interface
export interface OperationResult {
  success: boolean;
  txid?: string;
  error?: StakingError;
  meta?: {
    blockID: string;
    blockNumber: number;
    blockTimestamp: number;
  };
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
  VeBetterPassport: string;
  VeBetterDAO: string;
  XAllocationVoting: string;
  Treasury: string;
  Emissions: string;
  GovernorContract: string;
  TimelockController: string;
  VotingEscrow: string;
  RewardPool: string;
  XAllocationPool: string;
  QuadraticFunding: string;
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
