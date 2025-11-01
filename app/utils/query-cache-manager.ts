import { QueryClient } from "@tanstack/react-query";
import { QueryKeys } from "../hooks/query-utils";
import { Addresses, APP_CONFIG } from "../hooks/consts";
import type { TokenBalance } from "../types";

/**
 * Query cache management utilities for VeDelegate staking
 */
export class QueryCacheManager {
  constructor(private queryClient: QueryClient) {}

  private readonly balanceContracts = {
    B3TR: Addresses.B3TR,
    VOT3: Addresses.VOT3,
  };

  private readonly userInfoContracts = {
    VeDelegate: Addresses.VeDelegate,
    VePassport: Addresses.VePassport,
  };

  private getBalanceKey(address?: string) {
    if (!address) return null;
    return QueryKeys.balance(address, this.balanceContracts);
  }

  private getUserInfoKey(address: string) {
    return QueryKeys.userInfo(
      address,
      this.userInfoContracts,
      APP_CONFIG.APP_ID
    );
  }

  private updateBalanceCache(
    address: string,
    updater: (oldBalance: TokenBalance) => TokenBalance
  ) {
    const key = this.getBalanceKey(address);
    if (!key) return;

    this.queryClient.setQueryData<TokenBalance>(key, (oldData) => {
      if (!oldData) return oldData;
      return updater(oldData);
    });
  }

  /**
   * Invalidate all balance-related queries for a user
   */
  invalidateBalances(userAddress?: string, smartAccountAddress?: string) {
    const promises = [];

    if (userAddress) {
      const userBalanceKey = this.getBalanceKey(userAddress);
      if (userBalanceKey) {
        promises.push(
          this.queryClient.invalidateQueries({
            queryKey: userBalanceKey,
            refetchType: "active",
          })
        );
      }
    }

    if (smartAccountAddress) {
      const stakingBalanceKey = this.getBalanceKey(smartAccountAddress);
      if (stakingBalanceKey) {
        promises.push(
          this.queryClient.invalidateQueries({
            queryKey: stakingBalanceKey,
            refetchType: "active",
          })
        );
      }
      promises.push(
        this.queryClient.invalidateQueries({
          queryKey: QueryKeys.rewards(smartAccountAddress),
          refetchType: "active",
        })
      );
    }

    return Promise.all(promises);
  }

  /**
   * Invalidate staking-related data after a successful operation
   */
  async invalidateStakingData(userAddress: string, smartAccountAddress?: string) {
    const promises = [
      // Invalidate user balances
      this.invalidateBalances(userAddress, smartAccountAddress),
      
      // Invalidate staking data
      this.queryClient.invalidateQueries({
        queryKey: QueryKeys.stakingData(userAddress, smartAccountAddress),
        refetchType: "active",
      }),
      
      // Invalidate rewards
      smartAccountAddress &&
        this.queryClient.invalidateQueries({
          queryKey: QueryKeys.rewards(smartAccountAddress),
          refetchType: "active",
        }),
      
      // Invalidate user info (might affect pool status)
      this.queryClient.invalidateQueries({
        queryKey: this.getUserInfoKey(userAddress),
        refetchType: "active",
      }),
    ].filter(Boolean);

    await Promise.all(promises);
  }

  /**
   * Prefetch balance data for better UX
   */
  async prefetchBalances(userAddress: string, smartAccountAddress?: string) {
    const keys = [
      this.getBalanceKey(userAddress),
      smartAccountAddress ? this.getBalanceKey(smartAccountAddress) : null,
    ].filter(Boolean) as ReturnType<typeof QueryKeys.balance>[];

    if (keys.length === 0) return;

    await Promise.all(
      keys.map((key) =>
        this.queryClient.refetchQueries({
          queryKey: key,
          type: "active",
        })
      )
    );
  }

  /**
   * Clear stale data older than specified time
   */
  clearStaleData(maxAge: number = 30 * 60 * 1000) { // 30 minutes default
    const now = Date.now();
    
    this.queryClient.getQueryCache().getAll().forEach(query => {
      if (query.state.dataUpdatedAt && (now - query.state.dataUpdatedAt) > maxAge) {
        this.queryClient.removeQueries({ queryKey: query.queryKey });
      }
    });
  }

  /**
   * Optimistically update balance after staking operation
   */
  optimisticallyUpdateBalance(
    userAddress: string,
    smartAccountAddress: string,
    operation: "stake" | "unstake",
    amountWei: bigint
  ) {
    const delta = amountWei;

    if (operation === 'stake') {
      // Staking: 用户 B3TR 减少
      this.updateBalanceCache(userAddress, (oldData) => {
        const nextB3tr =
          oldData.b3tr > delta ? oldData.b3tr - delta : BigInt(0);
        return {
          ...oldData,
          b3tr: nextB3tr,
          availableB3tr: nextB3tr + oldData.convertedB3tr,
        };
      });

      // Staking: Smart Account VOT3 增加
      this.updateBalanceCache(smartAccountAddress, (oldData) => {
        const nextVot3 = oldData.vot3 + delta;
        const availableVot3 =
          nextVot3 > oldData.convertedB3tr
            ? nextVot3 - oldData.convertedB3tr
            : BigInt(0);
        return {
          ...oldData,
          vot3: nextVot3,
          availableVot3,
        };
      });
    } else {
      // Unstaking: 用户 B3TR 增加 (直接兑换为 B3TR)
      this.updateBalanceCache(userAddress, (oldData) => {
        const nextB3tr = oldData.b3tr + delta;
        return {
          ...oldData,
          b3tr: nextB3tr,
          availableB3tr: nextB3tr + oldData.convertedB3tr,
        };
      });

      // Unstaking: Smart Account VOT3 减少
      this.updateBalanceCache(smartAccountAddress, (oldData) => {
        const nextVot3 = oldData.vot3 > delta ? oldData.vot3 - delta : BigInt(0);
        const availableVot3 =
          nextVot3 > oldData.convertedB3tr
            ? nextVot3 - oldData.convertedB3tr
            : BigInt(0);
        return {
          ...oldData,
          vot3: nextVot3,
          availableVot3,
        };
      });
    }
  }

  /**
   * Revert optimistic updates on operation failure
   */
  revertOptimisticUpdates(userAddress: string, smartAccountAddress: string) {
    // Simply invalidate the queries to fetch fresh data
    this.invalidateBalances(userAddress, smartAccountAddress);
  }

  /**
   * Get cache statistics for debugging
   */
  getCacheStats() {
    const cache = this.queryClient.getQueryCache();
    const queries = cache.getAll();
    
    const stats = {
      totalQueries: queries.length,
      staleQueries: queries.filter(q => q.isStale()).length,
      loadingQueries: queries.filter(q => q.state.status === 'pending').length,
      errorQueries: queries.filter(q => q.state.status === 'error').length,
      cacheSize: this.estimateCacheSize(queries),
    };

    return stats;
  }

  private estimateCacheSize(queries: any[]): string {
    // Rough estimation of cache size
    const totalEntries = queries.length;
    const avgSizePerEntry = 1024; // 1KB estimate per query
    const totalBytes = totalEntries * avgSizePerEntry;
    
    if (totalBytes < 1024) return `${totalBytes} B`;
    if (totalBytes < 1024 * 1024) return `${(totalBytes / 1024).toFixed(1)} KB`;
    return `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  /**
   * Setup automatic cache cleanup
   */
  setupAutomaticCleanup() {
    // Clean up stale data every 10 minutes
    const interval = setInterval(() => {
      this.clearStaleData();
    }, 10 * 60 * 1000);

    // Return cleanup function
    return () => clearInterval(interval);
  }
}

/**
 * Create a singleton instance for the app
 */
let cacheManager: QueryCacheManager | null = null;

export const createQueryCacheManager = (queryClient: QueryClient): QueryCacheManager => {
  if (!cacheManager) {
    cacheManager = new QueryCacheManager(queryClient);
  }
  return cacheManager;
};

export const getQueryCacheManager = (): QueryCacheManager | null => {
  return cacheManager;
};
