"use client";

import React, { useState } from "react";
import { auth } from "../../lib/firebase";
import { Product } from "@/hooks/product";

type UpdateProductModalProps = {
  selectedProduct: Product;
  setIsModalOpen: (b: boolean) => void;
  fetchProdutos: () => void;
};

export default function UpdateProductModal(props: UpdateProductModalProps) {
  const [price, setPrice] = useState(props.selectedProduct.price);
  const [isAvailable, setIsAvailable] = useState(
    props.selectedProduct.isAvailable,
  );

  const handleUpdate = async (e: React.SubmitEvent) => {
    e.preventDefault();

    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(
        `https://updateproduct-veumhwpskq-uc.a.run.app`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: props.selectedProduct.id,
            price: price,
            isAvailable: isAvailable,
          }),
        },
      );

      if (response.ok) {
        props.setIsModalOpen(false);
        props.fetchProdutos();
      }
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Atualizar {props.selectedProduct?.name}
        </h3>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Preço (R$)
            </label>
            <input
              type="number"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-400 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </div>
          <div className="flex items-center gap-3 py-2">
            <input
              type="checkbox"
              id="available"
              className="w-5 h-5 text-blue-600 border-gray-400 rounded focus:ring-blue-500"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
            />
            <label htmlFor="available" className="text-sm font-medium text-gray-700">
              Disponível para venda
            </label>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Salvar
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
