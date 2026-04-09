import { useState, useEffect, useCallback } from "react";

export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  isAvailable: boolean;
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
        `https://listproducts-veumhwpskq-uc.a.run.app`,
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
    fetchProdutos();
  }, [fetchProdutos]);

  return { products, loading, error, refetch: fetchProdutos };
};

export default useProducts;
