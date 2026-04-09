"use client";

import { useState, useMemo } from "react";
import UpdateProductModal from "./_updateModal";
import CreateProductModal from "./_createModal";
import useProducts, { Product } from "@/hooks/product";

export default function ProdutosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { products, refetch } = useProducts();

  const list = useMemo(() => {
    return Object.groupBy(products, (product) => {
      return product.category;
    });
  }, [products]);

  const categoryList = useMemo(() => {
    return new Set(products.map((product) => product.category));
  }, [products]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <header className="max-w-4xl mx-auto flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-600">Gerencie o catálogo de itens</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
          >
            + Novo Produto
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-10">
        {Object.entries(list).map(([category, categoryProducts]) => (
          <section key={category} className="space-y-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-gray-800 whitespace-nowrap">
                {category}
              </h2>
              <div className="h-px bg-gray-200 w-full" />
            </div>
            <div className="grid gap-4">
              {categoryProducts?.map((p) => (
                <div
                  key={p.id}
                  className="p-6 border border-gray-100 rounded-xl flex justify-between items-center bg-white shadow-md hover:shadow-lg transition-shadow"
                >
                  <div>
                    <p className="text-lg font-bold text-gray-900">{p.name}</p>
                    <p className="text-sm text-gray-500">
                      {p.isAvailable ? (
                        <span className="text-green-600 font-medium">
                          ● Disponível
                        </span>
                      ) : (
                        <span className="text-gray-400 font-medium">
                          ○ Indisponível
                        </span>
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
          </section>
        ))}
      </div>

      <div className="max-w-4xl mx-auto mt-12 mb-8 flex justify-center">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-2xl border-2 border-blue-600 hover:bg-blue-50 transition-all shadow-sm"
        >
          <span className="text-2xl">+</span>
          Adicionar Novo Produto
        </button>
      </div>

      {isModalOpen && selectedProduct && (
        <UpdateProductModal
          selectedProduct={selectedProduct}
          setIsModalOpen={setIsModalOpen}
          fetchProdutos={refetch}
          categoryList={Array.from(categoryList)}
        />
      )}

      {isCreateModalOpen && (
        <CreateProductModal
          setIsModalOpen={setIsCreateModalOpen}
          fetchProdutos={refetch}
          categoryList={Array.from(categoryList)}
        />
      )}
    </div>
  );
}
