import { useState, useEffect, useCallback } from "react";
import { useConnex } from "@vechain/dapp-kit-react";

export interface NetworkStatus {
  isOnline: boolean;
  isConnexReady: boolean;
  blockHeight: number | null;
  lastUpdate: number | null;
  error: string | null;
}

export function useNetworkStatus() {
  const connex = useConnex();
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    isConnexReady: false,
    blockHeight: null,
    lastUpdate: null,
    error: null,
  });

  const checkNetworkStatus = useCallback(async () => {
    try {
      if (!connex) {
        setStatus(prev => ({
          ...prev,
          isConnexReady: false,
          error: "Connex not available",
          lastUpdate: Date.now(),
        }));
        return;
      }

      // Try to get the latest block to verify connection
      const bestBlock = connex.thor.status.head;
      
      setStatus(prev => ({
        ...prev,
        isConnexReady: true,
        blockHeight: bestBlock.number,
        error: null,
        lastUpdate: Date.now(),
      }));
    } catch (error) {
      console.error("Network status check failed:", error);
      setStatus(prev => ({
        ...prev,
        isConnexReady: false,
        error: error instanceof Error ? error.message : "Network check failed",
        lastUpdate: Date.now(),
      }));
    }
  }, [connex]);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }));
      checkNetworkStatus();
    };

    const handleOffline = () => {
      setStatus(prev => ({ 
        ...prev, 
        isOnline: false,
        error: "No internet connection"
      }));
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [checkNetworkStatus]);

  // Periodic network status check
  useEffect(() => {
    checkNetworkStatus();
    
    const interval = setInterval(checkNetworkStatus, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [checkNetworkStatus]);

  const isHealthy = status.isOnline && status.isConnexReady && !status.error;

  return {
    ...status,
    isHealthy,
    refresh: checkNetworkStatus,
  };
}
