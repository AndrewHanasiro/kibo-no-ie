"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const navLinks = [
    { name: "Mapa do Evento", href: "/home", icon: "🗺️" },
    { name: "Produtos", href: "/produto", icon: "🍱" },
    { name: "Lojas & Barracas", href: "/loja", icon: "🎪" },
    { name: "Avisos", href: "/avisos", icon: "⚠️" },
  ];

  return (
    <header className="bg-[#8cb83e] text-[#1e4d2b] shadow-md sticky top-0 z-50 border-b border-[#7ab02d]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo & Name */}
          <Link href="/home" className="flex items-center group flex-shrink-0">
            <div className="relative h-8 w-28 sm:h-10 sm:w-48 group-hover:scale-105 transition-transform">
              <Image
                src="/festival-logo.png"
                alt="Logo Kibô-no-Iê 46ª Festa do Verde"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2 flex-1 justify-center sm:justify-start px-2 overflow-x-auto no-scrollbar">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  title={link.name}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex-shrink-0 ${isActive
                      ? "bg-[#1e4d2b] text-white shadow-sm font-bold"
                      : "text-[#1e4d2b] hover:bg-[#1e4d2b]/10"
                    }`}
                >
                  <span className="text-sm sm:text-base">{link.icon}</span>
                  <span className="hidden sm:inline">{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile / Logout */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {user?.email && (
              <span className="text-xs text-[#1e4d2b]/80 hidden md:inline truncate max-w-[150px]">
                {user.email}
              </span>
            )}
            <button
              onClick={logout}
              title="Sair da Conta"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#b91c1c] hover:text-white bg-[#fef2f2] hover:bg-[#ef4444] border border-[#f87171] rounded-xl transition-all shadow-sm"
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