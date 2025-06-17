import { useCallback } from "react";
import { useConnex, useWallet } from "@vechain/dapp-kit-react";
import { Addresses, APP_CONFIG } from "./consts";
import { useUserInfo } from "./use-user-info";

export function useStakingOperations() {
  const { account } = useWallet();
  const connex = useConnex();
  const { userInfo } = useUserInfo();

  /**
   * Create staking pool if it doesn't exist
   */
  const createPool = useCallback(async () => {
    if (!connex || !account || !userInfo.tokenId) {
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
        .asClause(userInfo.tokenId, account, `embed:${APP_CONFIG.APP_NAME}`);

      return clause;
    }

    return null; // Pool already exists
  }, [connex, account, userInfo]);

  /**
   * Build staking transaction clauses
   */
  const buildStakeClauses = useCallback(
    async (b3trAmount: string, vot3Amount: string = "0") => {
      if (!connex || !account) {
        throw new Error("Missing wallet connection");
      }

      const clauses: any[] = [];
      const b3trWei = BigInt(parseFloat(b3trAmount) * 1e18);
      const vot3Wei = BigInt(parseFloat(vot3Amount) * 1e18);

      // 1. Create staking pool if needed
      const createPoolClause = await createPool();
      if (createPoolClause) {
        clauses.push(createPoolClause);
      }

      // 2. If there's VOT3, transfer directly to smart account
      if (vot3Wei > BigInt(0)) {
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
            .asClause(userInfo.smartAccountAddress, String(vot3Wei))
        );
      }

      // 3. If there's B3TR, transfer and convert to VOT3
      if (b3trWei > BigInt(0)) {
        // Transfer B3TR to smart account
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
            .asClause(userInfo.smartAccountAddress, String(b3trWei))
        );

        // TODO: Add conversion operations within smart account
        // This requires executeOnSmartAccount method to handle authorization and conversion
      }

      // 4. Delegate Passport if needed
      if (userInfo.passportAddress.toLowerCase() !== account.toLowerCase()) {
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
      }

      return clauses;
    },
    [connex, account, userInfo, createPool]
  );

  /**
   * Build unstaking transaction clauses
   */
  const buildUnstakeClauses = useCallback(
    async (b3trAmount: string, vot3Amount: string = "0") => {
      if (!connex || !account) {
        throw new Error("Missing wallet connection");
      }

      const clauses: any[] = [];
      const b3trWei = BigInt(parseFloat(b3trAmount) * 1e18);
      const vot3Wei = BigInt(parseFloat(vot3Amount) * 1e18);

      // TODO: Implement unstaking logic
      // This requires smart account execution permissions to transfer funds back to user account

      return clauses;
    },
    [connex, account, userInfo]
  );

  /**
   * Execute staking operation
   */
  const stake = useCallback(
    async (amount: string) => {
      try {
        const clauses = await buildStakeClauses(amount);

        if (clauses.length === 0) {
          throw new Error("No operations to perform");
        }

        // Send transaction
        const result = await connex.vendor.sign("tx", clauses).request();
        return result;
      } catch (error) {
        console.error("Staking failed:", error);
        throw error;
      }
    },
    [connex, buildStakeClauses]
  );

  /**
   * Execute unstaking operation
   */
  const unstake = useCallback(
    async (amount: string) => {
      try {
        const clauses = await buildUnstakeClauses(amount);

        if (clauses.length === 0) {
          throw new Error("No operations to perform");
        }

        // Send transaction
        const result = await connex.vendor.sign("tx", clauses).request();
        return result;
      } catch (error) {
        console.error("Unstaking failed:", error);
        throw error;
      }
    },
    [connex, buildUnstakeClauses]
  );

  return {
    stake,
    unstake,
    buildStakeClauses,
    buildUnstakeClauses,
    createPool,
    // Export useful states
    canStake: !!account && !!connex && !!userInfo.smartAccountAddress,
    appId: APP_CONFIG.APP_ID,
    appName: APP_CONFIG.APP_NAME,
  };
}
