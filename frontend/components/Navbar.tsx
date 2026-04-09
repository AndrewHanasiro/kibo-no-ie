"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const navLinks = [
    { name: "Home", href: "/home" },
    { name: "Produtos", href: "/produto" },
    { name: "Lojas", href: "/loja" },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-semibold transition-colors hover:text-blue-600 flex items-center h-16 border-b-2 ${
                    isActive
                      ? "text-blue-600 border-blue-600"
                      : "text-gray-600 border-transparent"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Sair da Conta
          </button>
        </div>
      </div>
    </nav>
  );
}