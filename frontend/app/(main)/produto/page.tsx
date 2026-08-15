"use client";

import { useState, useMemo } from "react";
import UpdateProductModal from "./_updateModal";
import CreateProductModal from "./_createModal";
import useProducts, { Product } from "@/hooks/product";

export default function ProdutosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const { products, loading, refetch } = useProducts();

  const categoryList = useMemo(() => {
    return Array.from(new Set(products.map((product) => product.category)));
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = products;
    if (activeCategoryFilter !== "ALL") {
      result = result.filter((p) => p.category === activeCategoryFilter);
    }
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(lowerQuery));
    }
    return result;
  }, [products, activeCategoryFilter, searchQuery]);

  const groupedList = useMemo(() => {
    return Object.groupBy(filteredProducts, (product) => product.category);
  }, [filteredProducts]);

  const totalAvailable = useMemo(() => {
    return products.filter((p) => p.isAvailable).length;
  }, [products]);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e1ebe0] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🍱</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1b261d]">
              Catálogo de Produtos
            </h1>
          </div>
          <p className="text-sm text-[#566755]">
            46ª Festa do Verde — Gerenciamento de itens, valores e estoque para os caixas
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 bg-[#f5f8f2] border border-[#e1ebe0] rounded-2xl">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8cb83e]" />
            <span className="text-xs font-bold text-[#1e4d2b]">
              {totalAvailable} / {products.length} Disponíveis
            </span>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-[#1e4d2b] hover:bg-[#163d21] text-white font-bold text-sm rounded-2xl transition-all shadow-md hover:shadow-lg cursor-pointer"
          >
            <span>+</span>
            <span>Novo Produto</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <span className="text-[#566755] text-sm">🔍</span>
        </div>
        <input
          type="text"
          placeholder="Buscar produto pelo nome..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 border border-[#e1ebe0] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8cb83e] bg-white text-sm shadow-sm transition-all text-[#1b261d] placeholder:text-[#7b8e79]"
        />
      </div>

      {/* Category Filter Pills */}
      {categoryList.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveCategoryFilter("ALL")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeCategoryFilter === "ALL"
                ? "bg-[#1e4d2b] text-white shadow-sm"
                : "bg-white text-[#566755] hover:bg-[#eff7e1] border border-[#e1ebe0]"
              }`}
          >
            Todos ({products.length})
          </button>
          {categoryList.map((cat) => {
            const count = products.filter((p) => p.category === cat).length;
            const isActive = activeCategoryFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategoryFilter(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${isActive
                    ? "bg-[#8cb83e] text-[#13301a] shadow-sm"
                    : "bg-white text-[#566755] hover:bg-[#eff7e1] border border-[#e1ebe0]"
                  }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#8cb83e] border-t-transparent"></div>
          <p className="text-sm font-medium text-[#566755]">Carregando catálogo...</p>
        </div>
      )}

      {/* Products Groups */}
      {!loading && (
        <div className="space-y-8">
          {Object.entries(groupedList).map(([category, categoryProducts]) => (
            <section key={category} className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-[#eff7e1] text-[#1e4d2b] font-extrabold text-sm rounded-xl border border-[#8cb83e]/30">
                  {category}
                </span>
                <div className="h-px bg-[#e1ebe0] flex-1" />
                <span className="text-xs text-[#7b8e79] font-medium">
                  {categoryProducts?.length} {categoryProducts?.length === 1 ? "item" : "itens"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryProducts?.map((p) => (
                  <div
                    key={p.id}
                    className="p-5 bg-white border border-[#e1ebe0] rounded-2xl shadow-sm hover:shadow-md transition-all flex justify-between items-center group hover:border-[#8cb83e]/50"
                  >
                    <div className="space-y-1.5 pr-3">
                      <p className="text-base font-bold text-[#1b261d] group-hover:text-[#1e4d2b] transition-colors">
                        {p.name}
                      </p>
                      <div>
                        {p.isAvailable ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#eaf5dd] text-[#36681d]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#5fa824]" />
                            Disponível
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f3f4f6] text-[#6b7280]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#9ca3af]" />
                            Esgotado
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="block text-xs text-[#7b8e79] font-medium">Preço</span>
                        <span className="text-lg font-extrabold text-[#1e4d2b]">
                          R$ {p.price.toFixed(2)}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedProduct(p);
                          setIsModalOpen(true);
                        }}
                        className="px-3.5 py-2 text-xs font-bold bg-[#f5f8f2] hover:bg-[#8cb83e] text-[#1e4d2b] hover:text-[#13301a] border border-[#d2dfd0] rounded-xl transition-all shadow-sm cursor-pointer"
                      >
                        Editar ✏️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
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
          <span>Adicionar Outro Produto</span>
        </button>
      </div>

      {isModalOpen && selectedProduct && (
        <UpdateProductModal
          selectedProduct={selectedProduct}
          setIsModalOpen={setIsModalOpen}
          fetchProdutos={refetch}
          categoryList={categoryList}
        />
      )}

      {isCreateModalOpen && (
        <CreateProductModal
          setIsModalOpen={setIsCreateModalOpen}
          fetchProdutos={refetch}
          categoryList={categoryList}
        />
      )}
    </div>
  );
}

