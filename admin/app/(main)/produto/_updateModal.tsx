"use client";

import React, { useState } from "react";
import { auth } from "../../../lib/firebase";
import { Product } from "@/hooks/product";
import useShops from "@/hooks/shop";
type UpdateProductModalProps = {
  selectedProduct: Product;
  categoryList: string[];
  setIsModalOpen: (b: boolean) => void;
  fetchProdutos: () => void;
};

export default function UpdateProductModal(props: UpdateProductModalProps) {
  const [category, setCategory] = useState(props.selectedProduct.category);
  const [name, setName] = useState(props.selectedProduct.name);
  const [price, setPrice] = useState(props.selectedProduct.price);
  const [isAvailable, setIsAvailable] = useState(
    props.selectedProduct.isAvailable,
  );
  const [shopId, setShopId] = useState(props.selectedProduct.shopId || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { shops } = useShops();

  const handleUpdate = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/updateProduct`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: props.selectedProduct.id,
            name: name,
            category: category,
            price: price,
            isAvailable: isAvailable,
            shopId: shopId || null,
          }),
        },
      );

      if (response.ok) {
        props.setIsModalOpen(false);
        props.fetchProdutos();
      }
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1b261d]/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#e1ebe0]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍱</span>
            <h3 className="text-xl font-bold text-[#1b261d]">
              Editar Produto
            </h3>
          </div>
          <button
            onClick={() => props.setIsModalOpen(false)}
            className="w-8 h-8 rounded-full bg-[#f5f8f2] hover:bg-[#e1ebe0] text-[#566755] flex items-center justify-center transition-colors cursor-pointer text-sm font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1b261d] mb-1.5">
              Barraca (Opcional)
            </label>
            <select
              className="w-full px-4 py-2.5 bg-[#f8faf7] border border-[#d2dfd0] text-[#1b261d] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#8cb83e] focus:border-[#1e4d2b] outline-none text-sm"
              value={shopId}
              onChange={(e) => setShopId(e.target.value)}
            >
              <option value="">Selecione uma barraca</option>
              {shops?.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1b261d] mb-1.5">
              Categoria
            </label>
            <input
              list="categories"
              type="text"
              required
              className="w-full px-4 py-2.5 bg-[#f8faf7] border border-[#d2dfd0] text-[#1b261d] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#8cb83e] focus:border-[#1e4d2b] outline-none text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <datalist id="categories">
              {props.categoryList.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>

            {props.categoryList.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {props.categoryList.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className="px-2.5 py-1 text-xs font-medium bg-[#e1ebe0] text-[#1e4d2b] rounded-lg hover:bg-[#8cb83e] hover:text-[#13301a] transition-colors cursor-pointer"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1b261d] mb-1.5">
              Nome do Produto
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2.5 bg-[#f8faf7] border border-[#d2dfd0] text-[#1b261d] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#8cb83e] focus:border-[#1e4d2b] outline-none text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1b261d] mb-1.5">
              Preço de Venda (R$)
            </label>
            <input
              type="number"
              step="0.01"
              required
              className="w-full px-4 py-2.5 bg-[#f8faf7] border border-[#d2dfd0] text-[#1b261d] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#8cb83e] focus:border-[#1e4d2b] outline-none text-sm"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </div>

          <div className="flex items-center gap-3 p-3 bg-[#f5f8f2] rounded-xl border border-[#e1ebe0]">
            <input
              type="checkbox"
              id="available"
              className="w-5 h-5 accent-[#1e4d2b] rounded cursor-pointer"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
            />
            <label
              htmlFor="available"
              className="text-xs font-bold text-[#1b261d] cursor-pointer"
            >
              Disponível para venda no caixa
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#1e4d2b] hover:bg-[#163d21] text-white py-3 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                "Salvar Alterações"
              )}
            </button>
            <button
              type="button"
              onClick={() => props.setIsModalOpen(false)}
              className="flex-1 bg-[#f5f8f2] text-[#566755] hover:bg-[#e1ebe0] py-3 rounded-xl font-bold transition-colors cursor-pointer text-sm border border-[#d2dfd0]"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

