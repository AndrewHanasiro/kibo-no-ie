"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

const LoginPage = () => {
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push("/home");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(
        (err as Error).message || "Credenciais inválidas. Verifique seu e-mail e senha.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f8f2]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#8cb83e] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f8f2] px-4 py-12">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#8cb83e]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#1e4d2b]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="w-full max-w-md bg-white shadow-xl rounded-3xl p-8 sm:p-10 border border-[#e1ebe0] relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="relative w-48 h-16 sm:w-56 sm:h-20 mb-2">
            <Image
              src="/festival-logo.png"
              alt="Logo Kibô-no-Iê 46ª Festa do Verde"
              fill
              className="object-contain"
              priority
            />
          </div>
          <p className="text-sm text-[#566755] mt-1 font-medium">
            Painel de Gestão & Administração
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 text-sm text-[#d32f2f] bg-[#fef2f2] rounded-xl border border-[#fecaca] flex items-center gap-2 font-medium">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1b261d] mb-1.5">
              E-mail de Acesso
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 bg-[#f8faf7] border border-[#d2dfd0] text-[#1b261d] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#8cb83e] focus:border-[#1e4d2b] outline-none placeholder-[#8f9f8e] text-sm transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@kibonoie.org.br"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1b261d] mb-1.5">
              Senha
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 bg-[#f8faf7] border border-[#d2dfd0] text-[#1b261d] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#8cb83e] focus:border-[#1e4d2b] outline-none placeholder-[#8f9f8e] text-sm transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-[#1e4d2b] hover:bg-[#163d21] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#8cb83e] focus:ring-offset-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 text-sm"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <span>Entrar no Painel</span>
                <span>➔</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#edf2eb] text-center text-xs text-[#7b8e79]">
          <p>Sociedade Beneficente Kibô-no-Iê</p>
          <p className="mt-0.5">Casa da Esperança • Itaquaquecetuba - SP</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

