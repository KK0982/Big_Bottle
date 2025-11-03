import { useState } from 'react';

export function useRefresh<T>(fetcher: () => Promise<T>, initialValue: T) {
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const next = await fetcher();
      setData(next);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, refresh };
}
