import { useCallback, useEffect, useState } from "react";
import { useWallet, useConnex } from "@vechain/dapp-kit-react";
import { useUserInfo } from "./use-user-info";
import { Addresses, APP_CONFIG } from "./consts";
import { useBeats } from "./use-beats";
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
  createEmptyBalance,
} from "../utils/token-balance";
import { performSecurityCheck, rateLimiter } from "../utils/staking-security";
const generateNonce = () => {
  const timestamp = BigInt(Date.now());
  const random = BigInt(Math.floor(Math.random() * 1_000_000));
  const combined = (timestamp << 20n) | random;
  return `0x${combined.toString(16).padStart(64, "0")}`;
};

export function useStakingOperations() {
  const { account } = useWallet();
  const connex = useConnex();
  const { userInfo } = useUserInfo();

  const [accountBalance, setAccountBalance] = useState(createEmptyBalance());
  const [stakingBalance, setStakingBalance] = useState(createEmptyBalance());
  const [isBalancesLoading, setIsBalancesLoading] = useState(true);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const beats = useBeats([account, userInfo.smartAccountAddress]);

  /**
   * Helper to load VeBetter balances for a given address
   */
  const getVeBetterBalance = useCallback(
    async (target?: string | null) => {
      if (!connex || !target) {
        return createEmptyBalance();
      }

      try {
        const [b3trRes, vot3Res, convertedRes] = await Promise.all([
          connex.thor
            .account(Addresses.B3TR)
            .method({
              inputs: [{ name: "account", type: "address" }],
              name: "balanceOf",
              outputs: [{ name: "balance", type: "uint256" }],
            })
            .call(target),
          connex.thor
            .account(Addresses.VOT3)
            .method({
              inputs: [{ name: "account", type: "address" }],
              name: "balanceOf",
              outputs: [{ name: "balance", type: "uint256" }],
            })
            .call(target),
          connex.thor
            .account(Addresses.VOT3)
            .method({
              inputs: [{ name: "account", type: "address" }],
              name: "convertedB3trOf",
              outputs: [{ name: "amount", type: "uint256" }],
            })
            .call(target),
        ]);

        const b3tr = BigInt(b3trRes.decoded.balance ?? 0);
        const vot3 = BigInt(vot3Res.decoded.balance ?? 0);
        const converted = BigInt(convertedRes.decoded.amount ?? 0);

        const availableB3tr = b3tr + converted;
        const availableVot3 = vot3 > converted ? vot3 - converted : 0n;

        return {
          b3tr,
          vot3,
          convertedB3tr: converted,
          availableB3tr,
          availableVot3,
        };
      } catch (error) {
        console.error("Failed to load VeBetter balance", error);
        return createEmptyBalance();
      }
    },
    [connex]
  );

  const refetch = useCallback(() => {
    setUpdateTrigger(Date.now());
  }, []);

  useEffect(() => {
    if (beats) {
      refetch();
    }
  }, [beats, refetch]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!connex || !account) {
        if (!cancelled) {
          setAccountBalance(createEmptyBalance());
          setStakingBalance(createEmptyBalance());
          setIsBalancesLoading(false);
        }
        return;
      }

      setIsBalancesLoading(true);

      try {
        const [accountResult, stakingResult] = await Promise.all([
          getVeBetterBalance(account),
          getVeBetterBalance(userInfo.smartAccountAddress),
        ]);

        if (!cancelled) {
          setAccountBalance(accountResult);
          setStakingBalance(stakingResult);
        }
      } catch (error) {
        console.error("Failed to refresh staking balances", error);
        if (!cancelled) {
          setAccountBalance(createEmptyBalance());
          setStakingBalance(createEmptyBalance());
        }
      } finally {
        if (!cancelled) {
          setIsBalancesLoading(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [
    connex,
    account,
    userInfo.smartAccountAddress,
    getVeBetterBalance,
    updateTrigger,
  ]);

  /**
   * Create a standardized staking error
   */
  const createStakingError = useCallback(
    (message: string, code?: string, details?: unknown): StakingError => {
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
      if (!connex || !userInfo.smartAccountAddress) {
        throw new Error("Missing required dependencies");
      }

      const genesis = await connex.thor.genesis;
      const chainId =
        genesis && genesis.id ? parseInt(genesis.id.slice(2), 16) : 0;

      const domain: Domain = {
        name: "vedelegate.vet",
        version: "1",
        chainId,
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
        to,
        value,
        data,
        validAfter,
        validBefore,
        nonce,
      };

      const signature = await signCallback(domain, types, message);

      return {
        to,
        value,
        data,
        validAfter,
        validBefore,
        nonce,
        signature,
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
        const validAfter = Math.floor(Date.now() / 1000) - 10;
        const validBefore = Math.floor(Date.now() / 1000) + 3600;
        const nonce = generateNonce();

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
      }

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
      !userInfo.smartAccountAddress ||
      !userInfo.stakingTokenId
    ) {
      throw new Error("Missing required dependencies");
    }

    let hasCode = false;
    try {
      const accountInfo = await connex.thor
        .account(userInfo.smartAccountAddress)
        .get();
      hasCode = accountInfo.hasCode;
    } catch {
      hasCode = false;
    }

    if (hasCode) {
      return null;
    }

    return connex.thor
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

      let createdPool = false;
      try {
        const { hasCode } = await connex.thor
          .account(userInfo.smartAccountAddress)
          .get();
        createdPool = !hasCode;
      } catch {
        createdPool = true;
      }

      if (createdPool) {
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

      if (vot3 > 0n) {
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

      if (b3tr > 0n) {
        clauses.push(
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
            .asClause(userInfo.smartAccountAddress, String(b3tr))
        );

        clauses.push(
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
                outputs: [{ name: "success", type: "bool" }],
              })
              .asClause(Addresses.VOT3, String(b3tr)).data,
            0,
            signingCallback
          )
        );

        clauses.push(
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

      const delegatedPassport =
        userInfo.passportAddress?.toLowerCase?.() ?? "";
      if (delegatedPassport !== account.toLowerCase()) {
        clauses.push(
          connex.thor
            .account(Addresses.VePassport)
            .method({
              inputs: [{ name: "delegatee", type: "address" }],
              name: "delegatePassport",
              outputs: [],
            })
            .asClause(userInfo.smartAccountAddress)
        );

        clauses.push(
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

      if (createdPool) {
        clauses.push(
          await executeOnSmartAccount(
            Addresses.VeDelegateVotes,
            "0",
            connex.thor
              .account(Addresses.VeDelegateVotes)
              .method({
                inputs: [
                  { name: "appIds", type: "bytes32[]" },
                  { name: "percentages", type: "uint8[]" },
                ],
                name: "castVotes",
                outputs: [],
              })
              .asClause([APP_CONFIG.APP_ID], [100]).data,
            0,
            signingCallback
          )
        );
      }

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
      if (!connex || !userInfo.smartAccountAddress) {
        throw new Error("Missing wallet connection");
      }

      const clauses: any[] = [];

      if (vot3 > 0n) {
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
                outputs: [{ name: "success", type: "bool" }],
              })
              .asClause(recipient, String(vot3)).data,
            0,
            signingCallback
          )
        );
      }

      if (b3tr > 0n) {
        const convertibleAmount =
          b3tr > stakingBalance.convertedB3tr
            ? stakingBalance.convertedB3tr
            : b3tr;

        if (convertibleAmount > 0n) {
          clauses.push(
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
                .asClause(String(convertibleAmount)).data,
              0,
              signingCallback
            )
          );
        }

        clauses.push(
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
                outputs: [{ name: "success", type: "bool" }],
              })
              .asClause(recipient, String(b3tr)).data,
            0,
            signingCallback
          )
        );
      }

      const totalBefore = stakingBalance.b3tr + stakingBalance.vot3;
      const totalAfter = totalBefore - (b3tr + vot3);
      if (totalAfter <= 0n) {
        clauses.push(
          await executeOnSmartAccount(
            Addresses.VePassport,
            "0",
            connex.thor
              .account(Addresses.VePassport)
              .method({
                inputs: [],
                name: "revokeDelegation",
                outputs: [],
              })
              .asClause().data,
            0,
            signingCallback
          )
        );
      }

      return clauses;
    },
    [connex, userInfo.smartAccountAddress, stakingBalance, executeOnSmartAccount]
  );

  /**
   * Legacy helper to convert string amounts to clauses
   */
  const buildStakeClauses = useCallback(
    async (b3trAmount: string, vot3Amount: string = "0") => {
      const b3trWei = amountToBigInt(b3trAmount, "B3TR");
      const vot3Wei =
        vot3Amount === "0" ? 0n : amountToBigInt(vot3Amount, "VOT3");
      return buildDepositClauses({
        b3tr: b3trWei,
        vot3: vot3Wei,
      });
    },
    [buildDepositClauses]
  );

  const buildUnstakeClauses = useCallback(
    async (b3trAmount: string, vot3Amount: string = "0") => {
      if (!account) {
        throw new Error("Wallet not connected");
      }
      const b3trWei = amountToBigInt(b3trAmount, "B3TR");
      const vot3Wei =
        vot3Amount === "0" ? 0n : amountToBigInt(vot3Amount, "VOT3");
      return buildWithdrawClauses({
        b3tr: b3trWei,
        vot3: vot3Wei,
        recipient: account,
      });
    },
    [buildWithdrawClauses, account]
  );

  /**
   * Staking operation with validation and security checks
   */
  const stake = useCallback(
    async (amount: string): Promise<OperationResult> => {
      try {
        validateStakingPrerequisites();

        const amountValidation = validateTokenAmount(amount);
        if (!amountValidation.isValid || amountValidation.value === undefined) {
          throw createStakingError(amountValidation.error ?? "Invalid amount");
        }

        const balanceCheck = checkSufficientBalance(
          amountValidation.value,
          accountBalance.b3tr,
          "B3TR"
        );
        if (!balanceCheck.isValid) {
          throw createStakingError(
            balanceCheck.error ?? "Insufficient balance",
            "INSUFFICIENT_BALANCE"
          );
        }

        const b3trAmount = amountToBigInt(amount);
        const securityCheck = performSecurityCheck({
          amount: b3trAmount,
          userAddress: account!,
        });

        if (!securityCheck.isSecure) {
          throw securityCheck.error!;
        }

        rateLimiter.recordOperation(account!);

        const clauses = await buildDepositClauses({
          b3tr: b3trAmount,
          vot3: 0n,
        });

        if (!clauses.length) {
          throw createStakingError("No operations to perform", "NO_OPERATIONS");
        }

        const result = await connex!.vendor.sign("tx", clauses).request();

        const waitForConfirmation = async () => {
          try {
            await connex!.thor.transaction(result.txid).getReceipt();
          } finally {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            refetch();
          }
        };

        return {
          success: true,
          txid: result.txid,
          meta: (result as any).meta,
          waitForConfirmation,
        };
      } catch (error) {
        console.error("Staking failed:", error);

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
      validateStakingPrerequisites,
      createStakingError,
      accountBalance.b3tr,
      buildDepositClauses,
      refetch,
    ]
  );

  /**
   * Unstaking operation with validation and security checks
   */
  const unstake = useCallback(
    async (amount: string): Promise<OperationResult> => {
      try {
        validateStakingPrerequisites();

        const amountValidation = validateTokenAmount(amount);
        if (!amountValidation.isValid || amountValidation.value === undefined) {
          throw createStakingError(amountValidation.error ?? "Invalid amount");
        }

        const totalStaked = stakingBalance.b3tr + stakingBalance.vot3;
        const balanceCheck = checkSufficientBalance(
          amountValidation.value,
          totalStaked,
          "VOT3"
        );
        if (!balanceCheck.isValid) {
          throw createStakingError(
            balanceCheck.error ?? "Insufficient staked balance",
            "INSUFFICIENT_STAKED_BALANCE"
          );
        }

        const withdrawAmount = amountToBigInt(amount);
        const securityCheck = performSecurityCheck({
          amount: withdrawAmount,
          userAddress: account!,
          recipientAddress: account!,
        });

        if (!securityCheck.isSecure) {
          throw securityCheck.error!;
        }

        rateLimiter.recordOperation(account!);

        const clauses = await buildWithdrawClauses({
          b3tr: withdrawAmount,
          vot3: 0n,
          recipient: account!,
        });

        if (!clauses.length) {
          throw createStakingError("No operations to perform", "NO_OPERATIONS");
        }

        const result = await connex!.vendor.sign("tx", clauses).request();

        const waitForConfirmation = async () => {
          try {
            await connex!.thor.transaction(result.txid).getReceipt();
          } finally {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            refetch();
          }
        };

        return {
          success: true,
          txid: result.txid,
          meta: (result as any).meta,
          waitForConfirmation,
        };
      } catch (error) {
        console.error("Unstaking failed:", error);

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
      validateStakingPrerequisites,
      createStakingError,
      stakingBalance,
      buildWithdrawClauses,
      refetch,
    ]
  );

  return {
    stake,
    unstake,
    buildDepositClauses,
    buildWithdrawClauses,
    executeOnSmartAccount,
    buildSmartAccountSignature,
    buildStakeClauses,
    buildUnstakeClauses,
    createPool,
    validateStakingPrerequisites,
    createStakingError,
    canStake: !!account && !!connex && !!userInfo.smartAccountAddress,
    isConnected: !!account && !!connex,
    hasSmartAccount: !!userInfo.smartAccountAddress,
    hasPool: userInfo.hasPool,
    accountBalance,
    stakingBalance,
    refetch,
    isBalancesLoading,
    appId: APP_CONFIG.APP_ID,
    appName: APP_CONFIG.APP_NAME,
  };
}
