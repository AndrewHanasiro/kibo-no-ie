import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kibô-no-Iê — 46ª Festa do Verde | Painel de Gestão",
  description:
    "Sistema de Gestão e Administração de Produtos, Lojas e Evento da Sociedade Beneficente Kibô-no-Iê.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#f5f8f2] text-[#1b261d]`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

