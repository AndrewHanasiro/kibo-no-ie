import { useState, useEffect, useCallback } from "react";

export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  isAvailable: boolean;
  shopId?: string;
};

const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProdutos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/listProducts?t=${Date.now()}`,
        {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = (await response.json()) satisfies Product[];
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await fetchProdutos();
    };
    load();
  }, [fetchProdutos]);

  return { products, loading, error, refetch: fetchProdutos };
};

export default useProducts;
