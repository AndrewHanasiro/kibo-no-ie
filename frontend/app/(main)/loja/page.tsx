"use client";

import { useState } from "react";
import Image from "next/image";
import UpdateShopModal from "./_updateModal";
import CreateShopModal from "./_createModal";
import useShops, { Shop } from "@/hooks/shop";

export default function LojasPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

  const { shops, loading, refetch } = useShops();

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e1ebe0] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🎪</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1b261d]">
              Lojas & Barracas
            </h1>
          </div>
          <p className="text-sm text-[#566755]">
            45ª Festa do Verde — Gerenciamento de pontos de venda, geolocalização e fotos
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-[#f5f8f2] border border-[#e1ebe0] rounded-2xl">
            <span className="text-xs font-bold text-[#1e4d2b]">
              {shops?.length || 0} Barracas Cadastradas
            </span>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-[#1e4d2b] hover:bg-[#163d21] text-white font-bold text-sm rounded-2xl transition-all shadow-md hover:shadow-lg cursor-pointer"
          >
            <span>+</span>
            <span>Nova Loja</span>
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#8cb83e] border-t-transparent"></div>
          <p className="text-sm font-medium text-[#566755]">Carregando barracas...</p>
        </div>
      )}

      {/* Shop Cards Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shops?.map((p) => (
            <div
              key={p.id}
              className="p-5 bg-white border border-[#e1ebe0] rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4 group hover:border-[#8cb83e]/50"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-[#f5f8f2] border border-[#e1ebe0] flex-shrink-0 flex items-center justify-center">
                  {p.image ? (
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="text-2xl text-[#8cb83e]">🎪</span>
                  )}
                </div>

                <div className="min-w-0">
                  <span className="inline-block px-2 py-0.5 bg-[#eff7e1] text-[#1e4d2b] text-[10px] font-extrabold rounded-full mb-1">
                    Ponto do Evento
                  </span>
                  <p className="text-base font-bold text-[#1b261d] truncate group-hover:text-[#1e4d2b] transition-colors">
                    {p.name}
                  </p>
                  <p className="text-xs text-[#7b8e79] mt-0.5 flex items-center gap-1">
                    <span>📍</span>
                    {p.latitude && p.longitude
                      ? `${p.latitude.toFixed(4)}, ${p.longitude.toFixed(4)}`
                      : "Local não definido"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedShop(p);
                  setIsModalOpen(true);
                }}
                className="px-3.5 py-2 text-xs font-bold bg-[#f5f8f2] hover:bg-[#8cb83e] text-[#1e4d2b] hover:text-[#13301a] border border-[#d2dfd0] rounded-xl transition-all shadow-sm flex-shrink-0 cursor-pointer"
              >
                Editar ✏️
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Floating Add Button for Bottom of Page */}
      <div className="flex justify-center pt-4 pb-8">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-8 py-3.5 bg-white border-2 border-[#1e4d2b] text-[#1e4d2b] hover:bg-[#eff7e1] font-bold rounded-2xl transition-all shadow-sm hover:shadow cursor-pointer"
        >
          <span className="text-xl">+</span>
          <span>Adicionar Outra Loja</span>
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

