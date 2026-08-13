"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const navLinks = [
    { name: "Mapa do Evento", href: "/home", icon: "🗺️" },
    { name: "Produtos", href: "/produto", icon: "🍱" },
    { name: "Lojas & Barracas", href: "/loja", icon: "🎪" },
  ];

  return (
    <header className="bg-[#1e4d2b] text-white shadow-md sticky top-0 z-50 border-b border-[#2d663b]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo & Name */}
          <Link href="/home" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#8cb83e] flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
              <span className="text-xl">🌳</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">
                  Kibô-no-Iê
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#8cb83e] text-[#1e4d2b] px-1.5 py-0.5 rounded-full">
                  45ª Festa
                </span>
              </div>
              <p className="text-[11px] text-[#c5e1b8] leading-none hidden sm:block">
                Sociedade Beneficente Casa da Esperança
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-[#8cb83e] text-[#13301a] shadow-sm font-bold"
                      : "text-[#d8ebd2] hover:bg-[#285d37] hover:text-white"
                  }`}
                >
                  <span className="text-sm">{link.icon}</span>
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile / Logout */}
          <div className="flex items-center gap-3">
            {user?.email && (
              <span className="text-xs text-[#b8d6b0] hidden md:inline truncate max-w-[150px]">
                {user.email}
              </span>
            )}
            <button
              onClick={logout}
              title="Sair da Conta"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#fca5a5] hover:text-white bg-[#d32f2f]/20 hover:bg-[#d32f2f] border border-[#d32f2f]/40 rounded-xl transition-all shadow-sm"
            >
              <span>🚪</span>
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}