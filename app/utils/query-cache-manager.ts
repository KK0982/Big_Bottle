import { QueryClient } from "@tanstack/react-query";
import { QueryKeys } from "../hooks/query-utils";

/**
 * Query cache management utilities for VeDelegate staking
 */
export class QueryCacheManager {
  constructor(private queryClient: QueryClient) {}

  /**
   * Invalidate all balance-related queries for a user
   */
  invalidateBalances(userAddress?: string, smartAccountAddress?: string) {
    const promises = [];

    if (userAddress) {
      promises.push(
        this.queryClient.invalidateQueries({
          queryKey: QueryKeys.balance(userAddress),
        })
      );
    }

    if (smartAccountAddress) {
      promises.push(
        this.queryClient.invalidateQueries({
          queryKey: QueryKeys.balance(smartAccountAddress),
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
      }),
      
      // Invalidate rewards
      smartAccountAddress && this.queryClient.invalidateQueries({
        queryKey: QueryKeys.rewards(smartAccountAddress),
      }),
      
      // Invalidate user info (might affect pool status)
      this.queryClient.invalidateQueries({
        queryKey: QueryKeys.userInfo(userAddress),
      }),
    ].filter(Boolean);

    await Promise.all(promises);
  }

  /**
   * Prefetch balance data for better UX
   */
  async prefetchBalances(userAddress: string, smartAccountAddress?: string) {
    const promises = [
      this.queryClient.prefetchQuery({
        queryKey: QueryKeys.balance(userAddress),
        staleTime: 15 * 1000, // 15 seconds
      }),
    ];

    if (smartAccountAddress) {
      promises.push(
        this.queryClient.prefetchQuery({
          queryKey: QueryKeys.balance(smartAccountAddress),
          staleTime: 15 * 1000,
        })
      );
    }

    await Promise.all(promises);
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
    operation: 'stake' | 'unstake',
    amount: number
  ) {
    if (operation === 'stake') {
      // Staking: 用户 B3TR 减少
      this.queryClient.setQueryData(
        QueryKeys.balance(userAddress),
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            b3tr: oldData.b3tr - BigInt(Math.floor(amount * 1e18)),
          };
        }
      );

      // Staking: Smart Account VOT3 增加
      this.queryClient.setQueryData(
        QueryKeys.balance(smartAccountAddress),
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            vot3: oldData.vot3 + BigInt(Math.floor(amount * 1e18)),
          };
        }
      );
    } else {
      // Unstaking: 用户 B3TR 增加 (直接兑换为 B3TR)
      this.queryClient.setQueryData(
        QueryKeys.balance(userAddress),
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            b3tr: oldData.b3tr + BigInt(Math.floor(amount * 1e18)),
          };
        }
      );

      // Unstaking: Smart Account VOT3 减少
      this.queryClient.setQueryData(
        QueryKeys.balance(smartAccountAddress),
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            vot3: oldData.vot3 > BigInt(Math.floor(amount * 1e18))
              ? oldData.vot3 - BigInt(Math.floor(amount * 1e18))
              : BigInt(0),
          };
        }
      );
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
