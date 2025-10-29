"use client";

import React, { ReactNode, useEffect } from "react";
import dynamic from "next/dynamic";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createQueryCacheManager } from "../../utils/query-cache-manager";

// Create an optimized QueryClient instance for VeDelegate staking
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (user errors)
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) return false;
        }
        // Don't retry on network errors after 3 attempts
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1, // Only retry mutations once
    },
  },
});

// Initialize cache manager
const cacheManager = createQueryCacheManager(queryClient);

// Dynamically import to avoid SSR issues
const VeChainKitProviderComponent = dynamic(
  async () => (await import("@vechain/vechain-kit")).VeChainKitProvider,
  { ssr: false }
);

interface VeChainProviderProps {
  children: ReactNode;
}

export const VeChainProvider = ({ children }: VeChainProviderProps) => {
  // Setup automatic cache cleanup
  useEffect(() => {
    const cleanup = cacheManager.setupAutomaticCleanup();
    return cleanup;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <VeChainKitProviderComponent
        loginMethods={[{ method: "dappkit", gridColumn: 4 }]}
        dappKit={{
          allowedWallets: ["veworld", "sync2"],
        }}
        darkMode={false}
        language="en"
        network={{
          type: "main",
        }}
      >
        {children}
      </VeChainKitProviderComponent>
    </QueryClientProvider>
  );
};
