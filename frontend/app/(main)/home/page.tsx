"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from "@react-google-maps/api";
import useShops, { Shop } from "@/hooks/shop";
import Image from "next/image";

const containerStyle = {
  width: "100%",
  height: "calc(100vh - 64px)", // Adjust based on your header height
};

const defaultCenter = { lat: -23.435119625012014, lng: -46.35803342659766 }; // São Paulo

export default function ProdutosPage() {
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={defaultCenter}
            zoom={18}
            options={{
              streetViewControl: false,
              mapTypeControl: false,
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
                <div className="p-2 flex flex-col items-center gap-2 min-w-[120px]">
                  <p className="font-bold text-gray-900 text-sm">{selectedShop.name}</p>
                  {selectedShop.image && (
                    <Image
                      src={selectedShop.image}
                      alt={selectedShop.name}
                      width={120}
                      height={80}
                      className="rounded-md object-cover border border-gray-100"
                      unoptimized
                    />
                  )}
                </div>
              </InfoWindowF>
            )}
          </GoogleMap>
        ) : (
          <div className="h-screen flex items-center justify-center text-gray-400">
            Carregando mapa...
          </div>
        )}
      </div>
    </div>
  );
}
