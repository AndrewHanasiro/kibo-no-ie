import { useState, useEffect, useCallback } from "react";
import { auth } from "@/lib/firebase";

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

  const deleteProduct = async (id: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/deleteProduct`,
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
        setProducts((prev) => prev.filter((p) => p.id !== id));
        await fetchProdutos();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Delete product failed:", err);
      return false;
    }
  };

  const resetProductsAvailability = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/resetProductsAvailability`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Se o endpoint retornar 404 (ex: backend ainda não reimplantado), faz fallback atualizando um a um
      if (response.status === 404) {
        const unavailableProducts = products.filter((p) => !p.isAvailable);
        const updatePromises = unavailableProducts.map((p) =>
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/updateProduct`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ id: p.id, isAvailable: true }),
          })
        );
        await Promise.all(updatePromises);
        setProducts((prev) =>
          prev.map((p) => ({ ...p, isAvailable: true }))
        );
        await fetchProdutos();
        return true;
      }

      if (response.ok) {
        setProducts((prev) =>
          prev.map((p) => ({ ...p, isAvailable: true }))
        );
        await fetchProdutos();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Reset products availability failed:", err);
      return false;
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchProdutos();
    };
    load();
  }, [fetchProdutos]);

  return { products, loading, error, refetch: fetchProdutos, deleteProduct, resetProductsAvailability };
};

export default useProducts;

