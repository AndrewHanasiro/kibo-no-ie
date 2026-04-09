import { useState, useEffect, useCallback } from "react";

export type Shop = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  image: string;
};

const useShops = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchShops = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://listshop-veumhwpskq-uc.a.run.app`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      const data = (await response.json()) satisfies Shop[];
      setShops(data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  return { shops, loading, error, refetch: fetchShops };
};

export default useShops;
