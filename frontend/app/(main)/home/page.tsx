"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from "@react-google-maps/api";
import useShops, { Shop } from "@/hooks/shop";
import Image from "next/image";
import Link from "next/link";

const containerStyle = {
  width: "100%",
  height: "calc(100vh - 200px)",
  borderRadius: "1.25rem",
};

const defaultCenter = { lat: -23.435119625012014, lng: -46.35803342659766 }; // Kibô-no-Iê - Itaquaquecetuba

export default function HomePage() {
  const { user } = useAuth();
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const { shops, loading: shopsLoading } = useShops();

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  if (!user) return null;

  if (shopsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#8cb83e] border-t-transparent"></div>
        <p className="text-sm font-medium text-[#566755]">Carregando mapa do evento...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e1ebe0] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🗺️</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1b261d]">
              Mapa do Evento
            </h1>
          </div>
          <p className="text-sm text-[#566755]">
            46ª Festa do Verde — Visualização geográfica das barracas e pontos de atendimento
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-[#eff7e1] border border-[#8cb83e]/40 rounded-2xl text-center">
            <span className="block text-xs font-bold uppercase tracking-wider text-[#1e4d2b]">
              Barracas
            </span>
            <span className="text-xl font-extrabold text-[#1e4d2b]">
              {shops?.length || 0}
            </span>
          </div>
          <Link
            href="/loja"
            className="px-4 py-2.5 bg-[#1e4d2b] hover:bg-[#163d21] text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow"
          >
            Gerenciar Lojas ➔
          </Link>
        </div>
      </div>

      {/* Interactive Map Container */}
      <div className="bg-white p-3 rounded-3xl border border-[#e1ebe0] shadow-md overflow-hidden">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={defaultCenter}
            zoom={18}
            options={{
              streetViewControl: false,
              mapTypeControl: true,
              fullscreenControl: true,
            }}
          >
            {shops?.map((shop) => (
              shop.latitude && shop.longitude && (
                <MarkerF
                  key={shop.id}
                  position={{ lat: shop.latitude, lng: shop.longitude }}
                  title={shop.name}
                  onClick={() => setSelectedShop(shop)}
                />
              )
            ))}

            {selectedShop && selectedShop.latitude && selectedShop.longitude && (
              <InfoWindowF
                position={{ lat: selectedShop.latitude, lng: selectedShop.longitude }}
                onCloseClick={() => setSelectedShop(null)}
              >
                <div className="p-2 flex flex-col items-center gap-2 max-w-[200px] text-center font-sans">
                  <span className="px-2 py-0.5 bg-[#eff7e1] text-[#1e4d2b] font-bold text-[11px] rounded-full">
                    Barraca Oficial
                  </span>
                  <p className="font-bold text-[#1b261d] text-sm">{selectedShop.name}</p>
                  {selectedShop.image && (
                    <Image
                      src={selectedShop.image}
                      alt={selectedShop.name}
                      width={160}
                      height={100}
                      className="rounded-xl object-cover border border-[#e1ebe0] shadow-sm max-h-[100px]"
                      unoptimized
                    />
                  )}
                  <p className="text-[10px] text-[#7b8e79]">
                    Lat: {selectedShop.latitude.toFixed(4)}, Lng: {selectedShop.longitude.toFixed(4)}
                  </p>
                </div>
              </InfoWindowF>
            )}
          </GoogleMap>
        ) : (
          <div className="h-[450px] flex items-center justify-center text-[#566755] bg-[#f8faf7] rounded-2xl">
            Carregando mapa...
          </div>
        )}
      </div>
    </div>
  );
}

