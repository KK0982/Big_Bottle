import { useEffect, useMemo, useRef, useState } from "react";
import useWebSocket from "react-use-websocket";
import { BloomFilter, Hex } from "@vechain/sdk-core";
import { NODE_URL } from "./consts";

interface BeatMessage {
  number: number;
  id: string;
  parentID: string;
  timestamp: number;
  txsFeatures: number;
  gasLimit: number;
  bloom: string;
  k: number;
  obsolete: boolean;
}

const RECONNECT_OPTIONS = {
  share: true,
  shouldReconnect: () => true,
};

const SUBSCRIPTION_DELAY_MS = 100;

export function useBeats(
  filters: Array<string | `0x${string}` | null | undefined>
) {
  const [beat, setBeat] = useState<BeatMessage | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const subscriptionUrl = useMemo(() => {
    const baseUrl = NODE_URL.replace(/^http/i, "ws");
    return `${baseUrl.replace(/\/$/, "")}/subscriptions/beat2`;
  }, []);

  const { lastJsonMessage } = useWebSocket(subscriptionUrl, RECONNECT_OPTIONS);

  useEffect(() => {
    const message = lastJsonMessage as BeatMessage | null;
    if (!message) {
      return;
    }

    const values = filters
      .filter((value): value is string => Boolean(value))
      .map((value) => value.toLowerCase());

    if (!values.length) {
      return;
    }

    try {
      const bloomFilter = new BloomFilter(
        Hex.of(message.bloom).bytes,
        message.k
      );

      const containsValue = (value: string) => {
        try {
          return bloomFilter.contains(Hex.of(value));
        } catch {
          return false;
        }
      };

      const hasMatch = values.some(containsValue);

      if (hasMatch) {
        if (timeoutRef.current !== null) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          setBeat(message);
        }, SUBSCRIPTION_DELAY_MS);
      }
    } catch (error) {
      console.error("Failed to process beat message", error);
    }
  }, [lastJsonMessage, filters]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return beat;
}
