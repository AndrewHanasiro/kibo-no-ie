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

  const handleCreate = async (e: React.SubmitEvent) => {
    e.preventDefault();

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
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Novo Produto
        </h3>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Categoria
            </label>
            <input
              list="categories"
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-400 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
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
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Nome do produto
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-400 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Preço (R$)
            </label>
            <input
              type="number"
              step="0.01"
              required
              className="w-full px-4 py-2 border border-gray-400 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Criar
            </button>
            <button
              type="button"
              onClick={() => props.setIsModalOpen(false)}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}