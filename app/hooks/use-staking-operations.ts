import { useCallback } from "react";
import { useWallet, useConnex } from "@vechain/dapp-kit-react";
import { useUserInfo } from "./use-user-info";
import { Addresses } from "./consts";
import { APP_CONFIG } from "./consts";
import type {
  SigningCallbackFunc,
  Domain,
  ExecuteWithAuthorizationTypes,
  ExecuteWithAuthorizationMessage,
  StakingOperationParams,
  WithdrawalOperationParams,
  SmartAccountSignature,
  OperationResult,
  StakingError,
} from "../types";
import {
  amountToBigInt,
  validateTokenAmount,
  checkSufficientBalance,
} from "../utils/token-balance";
import { performSecurityCheck, rateLimiter } from "../utils/staking-security";
import { getQueryCacheManager } from "../utils/query-cache-manager";
import { useBalanceQuery } from "./use-balance-query";
import { useQueryClient } from "@tanstack/react-query";

export function useStakingOperations() {
  const { account } = useWallet();
  const connex = useConnex();
  const { userInfo } = useUserInfo();
  const queryClient = useQueryClient();

  // Get user balances for validation
  const { balance: accountBalance } = useBalanceQuery(account || undefined);
  const { balance: stakingBalance } = useBalanceQuery(
    userInfo.smartAccountAddress || undefined
  );

  // Get cache manager for optimizations
  const cacheManager = getQueryCacheManager();

  /**
   * Create a standardized staking error
   */
  const createStakingError = useCallback(
    (message: string, code?: string, details?: any): StakingError => {
      const error = new Error(message) as StakingError;
      error.code = code;
      error.details = details;
      return error;
    },
    []
  );

  /**
   * Validate staking prerequisites
   */
  const validateStakingPrerequisites = useCallback(() => {
    if (!connex) {
      throw createStakingError("Wallet connection not available", "NO_CONNEX");
    }
    if (!account) {
      throw createStakingError("Wallet not connected", "NO_ACCOUNT");
    }
    if (!userInfo.smartAccountAddress) {
      throw createStakingError(
        "Smart account not available",
        "NO_SMART_ACCOUNT"
      );
    }
  }, [connex, account, userInfo.smartAccountAddress, createStakingError]);

  /**
   * Build smart account signature for authorization
   */
  const buildSmartAccountSignature = useCallback(
    async (
      to: string,
      value: string,
      data: string,
      validAfter: number,
      validBefore: number,
      nonce: string,
      signCallback: SigningCallbackFunc
    ) => {
      if (!connex) {
        throw new Error("Missing connex");
      }

      const genesis = await connex.thor.genesis;
      const chainId = genesis.id;

      const domain: Domain = {
        name: "vedelegate.vet",
        version: "1",
        chainId: parseInt(chainId.slice(2), 16), // Convert hex to number
        verifyingContract: userInfo.smartAccountAddress,
      };

      const types: ExecuteWithAuthorizationTypes = {
        ExecuteWithAuthorization: [
          { name: "to", type: "address" },
          { name: "value", type: "uint256" },
          { name: "data", type: "bytes" },
          { name: "validAfter", type: "uint256" },
          { name: "validBefore", type: "uint256" },
          { name: "nonce", type: "bytes32" },
        ],
      };

      const message: ExecuteWithAuthorizationMessage = {
        to: to,
        value: value,
        data: data,
        validAfter: validAfter,
        validBefore: validBefore,
        nonce: nonce,
      };

      const signature = await signCallback(domain, types, message);

      return {
        to: message.to,
        value: message.value,
        data: message.data,
        validAfter: message.validAfter,
        validBefore: message.validBefore,
        nonce: message.nonce,
        signature: signature,
      } as SmartAccountSignature;
    },
    [connex, userInfo.smartAccountAddress]
  );

  /**
   * Execute operation on smart account
   */
  const executeOnSmartAccount = useCallback(
    async (
      to: string,
      value: string,
      data: string,
      operation: number = 0,
      signingCallback?: SigningCallbackFunc
    ) => {
      if (!connex || !userInfo.smartAccountAddress) {
        throw new Error("Missing smart account");
      }

      if (signingCallback) {
        const validAfter = Math.floor(Date.now() / 1000) - 10; // valid after previous block
        const validBefore = Math.floor(Date.now() / 1000) + 3600; // validBefore: 1 hour from now
        const nonce = String(Date.now());

        const signedData = await buildSmartAccountSignature(
          to,
          value,
          data,
          validAfter,
          validBefore,
          nonce,
          signingCallback
        );

        return connex.thor
          .account(userInfo.smartAccountAddress)
          .method({
            inputs: [
              { name: "to", type: "address" },
              { name: "value", type: "uint256" },
              { name: "data", type: "bytes" },
              { name: "validAfter", type: "uint256" },
              { name: "validBefore", type: "uint256" },
              { name: "nonce", type: "bytes32" },
              { name: "signature", type: "bytes" },
            ],
            name: "executeWithAuthorization",
            outputs: [{ name: "result", type: "bytes" }],
          })
          .asClause(
            signedData.to,
            signedData.value,
            signedData.data,
            signedData.validAfter,
            signedData.validBefore,
            signedData.nonce,
            signedData.signature
          );
      } else {
        return connex.thor
          .account(userInfo.smartAccountAddress)
          .method({
            inputs: [
              { name: "to", type: "address" },
              { name: "value", type: "uint256" },
              { name: "data", type: "bytes" },
              { name: "operation", type: "uint256" },
            ],
            name: "execute",
            outputs: [],
          })
          .asClause(to, value, data, operation);
      }
    },
    [connex, userInfo.smartAccountAddress, buildSmartAccountSignature]
  );

  /**
   * Create staking pool if it doesn't exist
   */
  const createPool = useCallback(async () => {
    if (
      !connex ||
      !account ||
      !userInfo.stakingTokenId ||
      !userInfo.smartAccountAddress
    ) {
      throw new Error("Missing required dependencies");
    }

    // Check if smart account already exists
    const { hasCode } = await connex.thor
      .account(userInfo.smartAccountAddress)
      .get();

    if (!hasCode) {
      // Create staking pool
      const clause = connex.thor
        .account(Addresses.VeDelegate)
        .method({
          inputs: [
            { name: "tokenId", type: "uint256" },
            { name: "to", type: "address" },
            { name: "tokenURI", type: "string" },
          ],
          name: "createPool",
          outputs: [],
        })
        .asClause(
          userInfo.stakingTokenId,
          account,
          `embed:${APP_CONFIG.APP_ID}`
        );

      return clause;
    }

    return null; // Pool already exists
  }, [connex, account, userInfo]);

  /**
   * Build deposit (staking) transaction clauses
   */
  const buildDepositClauses = useCallback(
    async ({ b3tr, vot3, signingCallback }: StakingOperationParams) => {
      if (
        !connex ||
        !account ||
        !userInfo.smartAccountAddress ||
        !userInfo.stakingTokenId
      ) {
        throw new Error("Missing wallet connection or user info");
      }

      const clauses: any[] = [];

      // 1. Create staking pool if needed
      const { hasCode } = await connex.thor
        .account(userInfo.smartAccountAddress)
        .get();

      if (!hasCode) {
        clauses.push(
          connex.thor
            .account(Addresses.VeDelegate)
            .method({
              inputs: [
                { name: "tokenId", type: "uint256" },
                { name: "to", type: "address" },
                { name: "tokenURI", type: "string" },
              ],
              name: "createPool",
              outputs: [],
            })
            .asClause(
              userInfo.stakingTokenId,
              account,
              `embed:${APP_CONFIG.APP_ID}`
            )
        );
      }

      // 2. VOT3 is transferred to the staking smart account
      if (vot3 > BigInt(0)) {
        clauses.push(
          connex.thor
            .account(Addresses.VOT3)
            .method({
              inputs: [
                { name: "recipient", type: "address" },
                { name: "amount", type: "uint256" },
              ],
              name: "transfer",
              outputs: [],
            })
            .asClause(userInfo.smartAccountAddress, String(vot3))
        );
      }

      // 3. B3TR is transferred to the staking smart account and converted to VOT3
      if (b3tr > BigInt(0)) {
        clauses.push(
          // Transfer B3TR to smart account
          connex.thor
            .account(Addresses.B3TR)
            .method({
              inputs: [
                { name: "recipient", type: "address" },
                { name: "amount", type: "uint256" },
              ],
              name: "transfer",
              outputs: [],
            })
            .asClause(userInfo.smartAccountAddress, String(b3tr)),

          // Approve B3TR for conversion to VOT3
          await executeOnSmartAccount(
            Addresses.B3TR,
            "0",
            connex.thor
              .account(Addresses.B3TR)
              .method({
                inputs: [
                  { name: "spender", type: "address" },
                  { name: "amount", type: "uint256" },
                ],
                name: "approve",
                outputs: [{ type: "bool" }],
              })
              .asClause(Addresses.VOT3, String(b3tr)).data,
            0,
            signingCallback
          ),

          // Convert B3TR to VOT3
          await executeOnSmartAccount(
            Addresses.VOT3,
            "0",
            connex.thor
              .account(Addresses.VOT3)
              .method({
                inputs: [{ name: "amount", type: "uint256" }],
                name: "convertToVOT3",
                outputs: [],
              })
              .asClause(String(b3tr)).data,
            0,
            signingCallback
          )
        );
      }

      // 4. Active passport if user is not already delegating their passport to the smart wallet
      const isUserPassportDelegated =
        userInfo.passportAddress?.toLowerCase() === account.toLowerCase();

      if (!isUserPassportDelegated) {
        clauses.push(
          // Delegate the Passport
          connex.thor
            .account(Addresses.VePassport)
            .method({
              inputs: [{ name: "delegatee", type: "address" }],
              name: "delegatePassport",
              outputs: [],
            })
            .asClause(userInfo.smartAccountAddress),

          // Accept the Passport on the Smart Wallet
          await executeOnSmartAccount(
            Addresses.VePassport,
            "0",
            connex.thor
              .account(Addresses.VePassport)
              .method({
                inputs: [{ name: "user", type: "address" }],
                name: "acceptDelegation",
                outputs: [],
              })
              .asClause(account).data,
            0,
            signingCallback
          )
        );
      }

      // 6. Set app voting weight to 100%
      clauses.push(
        await executeOnSmartAccount(
          Addresses.VeBetterDAO,
          "0",
          connex.thor
            .account(Addresses.VeBetterDAO)
            .method({
              inputs: [
                { name: "appId", type: "bytes32" },
                { name: "percentage", type: "uint256" },
              ],
              name: "setAppVotingWeight",
              outputs: [],
            })
            .asClause(APP_CONFIG.APP_ID, "100").data,
          0,
          signingCallback
        )
      );

      return clauses;
    },
    [connex, account, userInfo, executeOnSmartAccount]
  );

  /**
   * Build withdraw (unstaking) transaction clauses
   */
  const buildWithdrawClauses = useCallback(
    async ({
      b3tr,
      vot3,
      recipient,
      signingCallback,
    }: WithdrawalOperationParams) => {
      if (!connex || !account) {
        throw new Error("Missing wallet connection");
      }

      const clauses: any[] = [];

      // 1. VOT3 is transferred directly
      if (vot3 > BigInt(0)) {
        clauses.push(
          await executeOnSmartAccount(
            Addresses.VOT3,
            "0",
            connex.thor
              .account(Addresses.VOT3)
              .method({
                inputs: [
                  { name: "recipient", type: "address" },
                  { name: "amount", type: "uint256" },
                ],
                name: "transfer",
                outputs: [],
              })
              .asClause(recipient, String(vot3)).data,
            0,
            signingCallback
          )
        );
      }

      // 2. B3TR is received by converting VOT3 and then transferring to the user
      if (b3tr > BigInt(0)) {
        clauses.push(
          // Convert VOT3 to B3TR
          await executeOnSmartAccount(
            Addresses.VOT3,
            "0",
            connex.thor
              .account(Addresses.VOT3)
              .method({
                inputs: [{ name: "amount", type: "uint256" }],
                name: "convertToB3TR",
                outputs: [],
              })
              .asClause(String(b3tr)).data,
            0,
            signingCallback
          ),

          // Transfer the converted B3TR to the recipient
          await executeOnSmartAccount(
            Addresses.B3TR,
            "0",
            connex.thor
              .account(Addresses.B3TR)
              .method({
                inputs: [
                  { name: "recipient", type: "address" },
                  { name: "amount", type: "uint256" },
                ],
                name: "transfer",
                outputs: [],
              })
              .asClause(recipient, String(b3tr)).data,
            0,
            signingCallback
          )
        );
      }

      // 3. Deactivate passport if the future balance will be zero
      // TODO: Add balance check logic here when balance data is available
      // if ((balance.b3tr + balance.vot3) - (b3tr + vot3) === 0n) {
      //   clauses.push(
      //     await executeOnSmartAccount(
      //       Addresses.VePassport,
      //       "0",
      //       connex.thor
      //         .account(Addresses.VePassport)
      //         .method({
      //           inputs: [],
      //           name: "revokeDelegation",
      //           outputs: [],
      //         })
      //         .asClause().data,
      //       0,
      //       signingCallback
      //     )
      //   );
      // }

      return clauses;
    },
    [connex, account, executeOnSmartAccount]
  );

  /**
   * Legacy method for compatibility - converts string amount to bigint
   */
  const buildStakeClauses = useCallback(
    async (b3trAmount: string, vot3Amount: string = "0") => {
      const b3trWei = BigInt(parseFloat(b3trAmount) * 1e18);
      const vot3Wei = BigInt(parseFloat(vot3Amount) * 1e18);

      return buildDepositClauses({
        b3tr: b3trWei,
        vot3: vot3Wei,
      });
    },
    [buildDepositClauses]
  );

  /**
   * Legacy method for compatibility - converts string amount to bigint
   */
  const buildUnstakeClauses = useCallback(
    async (b3trAmount: string, vot3Amount: string = "0") => {
      const b3trWei = BigInt(parseFloat(b3trAmount) * 1e18);
      const vot3Wei = BigInt(parseFloat(vot3Amount) * 1e18);

      return buildWithdrawClauses({
        b3tr: b3trWei,
        vot3: vot3Wei,
        recipient: account!,
      });
    },
    [buildWithdrawClauses, account]
  );

  /**
   * Improved staking operation with validation
   */
  const stake = useCallback(
    async (amount: string): Promise<OperationResult> => {
      try {
        // Validate prerequisites
        validateStakingPrerequisites();

        // Validate amount
        const amountValidation = validateTokenAmount(amount);
        if (!amountValidation.isValid) {
          throw createStakingError(amountValidation.error!, "INVALID_AMOUNT");
        }

        // Check sufficient balance
        const balanceCheck = checkSufficientBalance(
          amountValidation.value!,
          accountBalance.b3tr,
          "B3TR"
        );
        if (!balanceCheck.isValid) {
          throw createStakingError(balanceCheck.error!, "INSUFFICIENT_BALANCE");
        }

        // Perform security check
        const b3trAmount = amountToBigInt(amount);
        const securityCheck = performSecurityCheck({
          amount: b3trAmount,
          userAddress: account!,
        });

        if (!securityCheck.isSecure) {
          throw securityCheck.error!;
        }

        // Record operation for rate limiting
        rateLimiter.recordOperation(account!);

        // Build transaction clauses
        const clauses = await buildDepositClauses({
          b3tr: b3trAmount,
          vot3: BigInt(0),
        });

        if (clauses.length === 0) {
          throw createStakingError("No operations to perform", "NO_OPERATIONS");
        }

        // Optimistically update cache before transaction
        if (cacheManager) {
          cacheManager.optimisticallyUpdateBalance(
            account!,
            userInfo.smartAccountAddress!,
            "stake",
            amountValidation.value!
          );
        }

        // Send transaction
        const result = await connex!.vendor.sign("tx", clauses).request();

        // Invalidate cache after successful transaction
        if (cacheManager) {
          await cacheManager.invalidateStakingData(
            account!,
            userInfo.smartAccountAddress
          );
        }

        return {
          success: true,
          txid: result.txid,
          meta: (result as any).meta,
        };
      } catch (error) {
        console.error("Staking failed:", error);

        // Revert optimistic updates on failure
        if (cacheManager) {
          cacheManager.revertOptimisticUpdates(
            account!,
            userInfo.smartAccountAddress!
          );
        }

        const stakingError =
          error instanceof Error && "code" in error
            ? (error as StakingError)
            : createStakingError(
                error instanceof Error
                  ? error.message
                  : "Unknown staking error",
                "UNKNOWN_ERROR"
              );

        return {
          success: false,
          error: stakingError,
        };
      }
    },
    [
      connex,
      account,
      userInfo.smartAccountAddress,
      validateStakingPrerequisites,
      createStakingError,
      accountBalance.b3tr,
      buildDepositClauses,
      cacheManager,
    ]
  );

  /**
   * Improved unstaking operation with validation
   */
  const unstake = useCallback(
    async (amount: string): Promise<OperationResult> => {
      try {
        // Validate prerequisites
        validateStakingPrerequisites();

        // Validate amount
        const amountValidation = validateTokenAmount(amount);
        if (!amountValidation.isValid) {
          throw createStakingError(amountValidation.error!, "INVALID_AMOUNT");
        }

        // Check sufficient staked balance
        const totalStaked = stakingBalance.b3tr + stakingBalance.vot3;
        const balanceCheck = checkSufficientBalance(
          amountValidation.value!,
          totalStaked,
          "VOT3"
        );
        if (!balanceCheck.isValid) {
          throw createStakingError(
            balanceCheck.error!,
            "INSUFFICIENT_STAKED_BALANCE"
          );
        }

        // Perform security check
        const withdrawAmount = amountToBigInt(amount);
        const securityCheck = performSecurityCheck({
          amount: withdrawAmount,
          userAddress: account!,
          recipientAddress: account!,
        });

        if (!securityCheck.isSecure) {
          throw securityCheck.error!;
        }

        // Record operation for rate limiting
        rateLimiter.recordOperation(account!);

        // Build transaction clauses - 直接兑换为 B3TR
        const clauses = await buildWithdrawClauses({
          b3tr: withdrawAmount, // 兑换为 B3TR
          vot3: BigInt(0), // 不直接提取 VOT3
          recipient: account!,
        });

        if (clauses.length === 0) {
          throw createStakingError("No operations to perform", "NO_OPERATIONS");
        }

        // Optimistically update cache before transaction
        if (cacheManager) {
          cacheManager.optimisticallyUpdateBalance(
            account!,
            userInfo.smartAccountAddress!,
            "unstake",
            amountValidation.value!
          );
        }

        // Send transaction
        const result = await connex!.vendor.sign("tx", clauses).request();

        // Invalidate cache after successful transaction
        if (cacheManager) {
          await cacheManager.invalidateStakingData(
            account!,
            userInfo.smartAccountAddress
          );
        }

        return {
          success: true,
          txid: result.txid,
          meta: (result as any).meta,
        };
      } catch (error) {
        console.error("Unstaking failed:", error);

        // Revert optimistic updates on failure
        if (cacheManager) {
          cacheManager.revertOptimisticUpdates(
            account!,
            userInfo.smartAccountAddress!
          );
        }

        const stakingError =
          error instanceof Error && "code" in error
            ? (error as StakingError)
            : createStakingError(
                error instanceof Error
                  ? error.message
                  : "Unknown unstaking error",
                "UNKNOWN_ERROR"
              );

        return {
          success: false,
          error: stakingError,
        };
      }
    },
    [
      connex,
      account,
      userInfo.smartAccountAddress,
      validateStakingPrerequisites,
      createStakingError,
      stakingBalance,
      buildWithdrawClauses,
      cacheManager,
    ]
  );

  return {
    // Primary staking operations
    stake,
    unstake,

    // Advanced API methods for custom implementations
    buildDepositClauses,
    buildWithdrawClauses,
    executeOnSmartAccount,
    buildSmartAccountSignature,

    // Legacy methods for backward compatibility (deprecated)
    buildStakeClauses,
    buildUnstakeClauses,
    createPool,

    // Utility functions
    validateStakingPrerequisites,
    createStakingError,

    // State information
    canStake: !!account && !!connex && !!userInfo.smartAccountAddress,
    isConnected: !!account && !!connex,
    hasSmartAccount: !!userInfo.smartAccountAddress,
    accountBalance,
    stakingBalance,

    // App configuration
    appId: APP_CONFIG.APP_ID,
    appName: APP_CONFIG.APP_NAME,
  };
}
