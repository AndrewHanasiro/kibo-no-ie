"use client";

import React, { useState } from "react";
import { auth } from "../../../lib/firebase";

type CreateProductModalProps = {
  categoryList: string[];
  setIsModalOpen: (b: boolean) => void;
  fetchProdutos: () => void;
};

export default function CreateProductModal(props: CreateProductModalProps) {
  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(
        `https://createproduct-veumhwpskq-uc.a.run.app`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: name,
            category: category,
            price: price,
            isAvailable: true,
          }),
        },
      );

      if (response.ok) {
        props.setIsModalOpen(false);
        props.fetchProdutos();
      }
    } catch (error) {
      console.error("Creation failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1b261d]/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#e1ebe0]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <h3 className="text-xl font-bold text-[#1b261d]">
              Novo Produto
            </h3>
          </div>
          <button
            onClick={() => props.setIsModalOpen(false)}
            className="w-8 h-8 rounded-full bg-[#f5f8f2] hover:bg-[#e1ebe0] text-[#566755] flex items-center justify-center transition-colors cursor-pointer text-sm font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1b261d] mb-1.5">
              Categoria
            </label>
            <input
              list="categories"
              type="text"
              required
              placeholder="Ex: Sushis, Doces, Bebidas"
              className="w-full px-4 py-2.5 bg-[#f8faf7] border border-[#d2dfd0] text-[#1b261d] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#8cb83e] focus:border-[#1e4d2b] outline-none text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <datalist id="categories">
              {props.categoryList.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1b261d] mb-1.5">
              Nome do Produto
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Yakisoba Tradicional"
              className="w-full px-4 py-2.5 bg-[#f8faf7] border border-[#d2dfd0] text-[#1b261d] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#8cb83e] focus:border-[#1e4d2b] outline-none text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1b261d] mb-1.5">
              Preço (R$)
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              className="w-full px-4 py-2.5 bg-[#f8faf7] border border-[#d2dfd0] text-[#1b261d] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#8cb83e] focus:border-[#1e4d2b] outline-none text-sm"
              value={price || ""}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#1e4d2b] hover:bg-[#163d21] text-white py-3 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                "Criar Produto"
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