"use client";

import { useState } from "react";
import useWarnings from "@/hooks/warning";

export default function AvisosPage() {
  const { warnings, loading, createWarning, deleteWarning, deleteAllWarnings } = useWarnings();
  const [newWarningText, setNewWarningText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWarningText.trim()) return;

    setIsSubmitting(true);
    const success = await createWarning(newWarningText);
    if (success) {
      setNewWarningText("");
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja remover este aviso?")) {
      await deleteWarning(id);
    }
  };

  const handleDeleteAll = async () => {
    if (warnings.length === 0) return;
    if (
      confirm(
        `Tem certeza que deseja apagar TODOS os ${warnings.length} aviso(s)? Esta ação não pode ser desfeita.`
      )
    ) {
      setIsDeletingAll(true);
      await deleteAllWarnings();
      setIsDeletingAll(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e1ebe0] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">⚠️</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1b261d]">
              Central de Avisos
            </h1>
          </div>
          <p className="text-sm text-[#566755]">
            Gerencie os avisos sobre os produtos e eventos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 bg-[#f5f8f2] border border-[#e1ebe0] rounded-2xl">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8cb83e]" />
            <span className="text-xs font-bold text-[#1e4d2b]">
              {warnings.length} {warnings.length === 1 ? "Aviso" : "Avisos"}
            </span>
          </div>
          {warnings.length > 0 && (
            <button
              onClick={handleDeleteAll}
              disabled={isDeletingAll}
              className="flex items-center gap-2 px-4 py-2 bg-[#fef2f2] hover:bg-[#fee2e2] text-[#dc2626] hover:text-[#b91c1c] border border-[#fecaca] font-bold text-sm rounded-2xl transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeletingAll ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#dc2626] border-t-transparent" />
              ) : (
                <span>🗑️</span>
              )}
              <span>{isDeletingAll ? "Apagando..." : "Apagar Todos"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Create Warning Form */}
      <div className="bg-white rounded-3xl p-6 border border-[#e1ebe0] shadow-sm">
        <h2 className="text-lg font-bold text-[#1b261d] mb-4">Novo Aviso</h2>
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Digite o texto do aviso..."
            value={newWarningText}
            onChange={(e) => setNewWarningText(e.target.value)}
            className="flex-1 px-4 py-3 border border-[#e1ebe0] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8cb83e] bg-[#f8faf7] text-sm text-[#1b261d]"
          />
          <button
            type="submit"
            disabled={isSubmitting || !newWarningText.trim()}
            className="px-6 py-3 bg-[#1e4d2b] hover:bg-[#163d21] disabled:bg-[#1e4d2b]/50 text-white font-bold text-sm rounded-2xl transition-all shadow-sm flex items-center justify-center sm:min-w-[120px]"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              "Adicionar"
            )}
          </button>
        </form>
      </div>

      {/* Warnings List */}
      <div className="space-y-4">
        {loading && (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#8cb83e] border-t-transparent"></div>
            <p className="text-sm font-medium text-[#566755]">Carregando avisos...</p>
          </div>
        )}

        {!loading && warnings.length === 0 && (
          <div className="text-center py-10 bg-white rounded-3xl border border-[#e1ebe0] text-[#566755]">
            Nenhum aviso encontrado.
          </div>
        )}

        {!loading &&
          warnings.map((warning) => (
            <div
              key={warning.id}
              className="bg-white p-5 rounded-2xl border border-[#e1ebe0] shadow-sm flex justify-between items-start gap-4 hover:border-[#8cb83e]/50 transition-colors"
            >
              <div>
                <p className="text-[#1b261d] font-medium">{warning.text}</p>
                <p className="text-xs text-[#7b8e79] mt-2">
                  {new Date(warning.timestamp).toLocaleString("pt-BR")}
                </p>
              </div>
              <button
                onClick={() => handleDelete(warning.id)}
                className="text-[#ef4444] hover:text-white hover:bg-[#ef4444] px-3 py-1.5 rounded-lg text-sm font-bold transition-colors border border-[#ef4444]/20"
              >
                Remover
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
