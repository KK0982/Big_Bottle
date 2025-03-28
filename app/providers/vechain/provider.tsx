"use client";

import React, { ReactNode } from "react";
import dynamic from "next/dynamic";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a QueryClient instance
const queryClient = new QueryClient();

// Dynamically import to avoid SSR issues
const VeChainKitProviderComponent = dynamic(
  async () => (await import("@vechain/vechain-kit")).VeChainKitProvider,
  { ssr: false }
);

interface VeChainProviderProps {
  children: ReactNode;
}

export const VeChainProvider = ({ children }: VeChainProviderProps) => {
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
