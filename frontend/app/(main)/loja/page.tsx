"use client";

import { useState } from "react";
import Image from "next/image";
import UpdateShopModal from "./_updateModal";
import CreateShopModal from "./_createModal";
import useShops, { Shop } from "@/hooks/shop";

export default function ProdutosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

  const { shops, loading, refetch } = useShops();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <header className="max-w-4xl mx-auto flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lojas</h1>
          <p className="text-gray-600">Gerencie as informações de cada loja</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
          >
            + Nova Loja
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-10">
        {shops?.map((p) => (
          <div
            key={p.id}
            className="p-6 border border-gray-100 rounded-xl flex justify-between items-center bg-white shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-6">
              {p.image && (
                <Image
                  src={p.image}
                  alt={p.name}
                  width={80}
                  height={80}
                  className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                />
              )}

              <p className="text-xl font-bold text-gray-900">{p.name}</p>
            </div>
            <button
              onClick={() => {
                setSelectedShop(p);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 text-sm font-semibold bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
            >
              Editar
            </button>
          </div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto mt-12 mb-8 flex justify-center">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-2xl border-2 border-blue-600 hover:bg-blue-50 transition-all shadow-sm"
        >
          <span className="text-2xl">+</span>
          Adicionar Nova Loja
        </button>
      </div>

      {isModalOpen && selectedShop && (
        <UpdateShopModal
          selectedShop={selectedShop}
          setIsModalOpen={setIsModalOpen}
          fetchShop={refetch}
        />
      )}

      {isCreateModalOpen && (
        <CreateShopModal
          setIsModalOpen={setIsCreateModalOpen}
          fetchShop={refetch}
        />
      )}
    </div>
  );
}
