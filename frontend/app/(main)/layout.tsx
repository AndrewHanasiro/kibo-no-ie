"use client";

import Navbar from "@/components/Navbar";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="main-container">
      <Navbar />
      <div>
        <main>{children}</main>
      </div>
    </div>
  );
}
