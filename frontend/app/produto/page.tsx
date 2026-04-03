"use client";

import React, { useState, useEffect } from "react";
import { auth } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import UpdateProductModal from "./_modal";
import useProducts, { Product } from "@/hooks/product";

export default function ProdutosPage() {
  const { user, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const router = useRouter();

  const { products, loading, refetch } = useProducts();
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user) {
      refetch();
    }
  }, [user, router, refetch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <header className="max-w-4xl mx-auto flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-600">Gerencie o catálogo de itens</p>
        </div>
        <button 
          onClick={logout} 
          className="px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          Sair da Conta
        </button>
      </header>

      <div className="max-w-4xl mx-auto grid gap-4">
        {products.map((p) => (
          <div
            key={p.id}
            className="p-6 border border-gray-100 rounded-xl flex justify-between items-center bg-white shadow-md hover:shadow-lg transition-shadow"
          >
            <div>
              <p className="text-lg font-bold text-gray-900">{p.name}</p>
              <p className="text-sm text-gray-500">
                {p.isAvailable ? (
                  <span className="text-green-600 font-medium">● Disponível</span>
                ) : (
                  <span className="text-gray-400 font-medium">○ Indisponível</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xl font-bold text-blue-600">
                R$ {p.price.toFixed(2)}
              </span>
              <button
                onClick={() => {
                  setSelectedProduct(p);
                  setIsModalOpen(true);
                }}
                className="px-4 py-2 text-sm font-semibold bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
              >
                Editar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Update Modal */}
      {isModalOpen && selectedProduct && (
        <UpdateProductModal
          selectedProduct={selectedProduct}
          setIsModalOpen={setIsModalOpen}
          fetchProdutos={refetch}
        />
      )}
    </div>
  );
}
