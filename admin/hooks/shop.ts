import { useState, useEffect, useCallback } from "react";
import { auth } from "@/lib/firebase";

export type Location = {
  latitude: number;
  longitude: number;
};

export type Shop = {
  id: string;
  name: string;
  locations: Location[];
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/listShop`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      const data = (await response.json()) satisfies Shop[];
      setShops(data);
    } catch (err) {
      console.error("Error fetching shops:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteShop = async (id: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/deleteShop`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id }),
        }
      );

      if (response.ok) {
        await fetchShops();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Delete shop failed:", err);
      return false;
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchShops();
    };
    load();
  }, [fetchShops]);

  return { shops, loading, error, refetch: fetchShops, deleteShop };
};

export default useShops;

