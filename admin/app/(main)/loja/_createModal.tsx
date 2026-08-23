"use client";

import React, { useState, useCallback } from "react";
import { auth } from "../../../lib/firebase";
import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api";
import Image from "next/image";

const containerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "0.75rem",
};

const defaultCenter = { lat: -23.435119625012014, lng: -46.35803342659766 }; // Kibô-no-Iê

type CreateShopModalProps = {
  setIsModalOpen: (b: boolean) => void;
  fetchShop: () => void;
};

export default function CreateShopModal(props: CreateShopModalProps) {
  const [name, setName] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [image, setImage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  const [_, setMap] = useState<google.maps.Map | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/createShop`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: name,
            latitude: lat,
            longitude: lng,
            image: image,
          }),
        },
      );

      if (response.ok) {
        props.setIsModalOpen(false);
        props.fetchShop();
      }
    } catch (error) {
      console.error("Creation failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setLat(e.latLng.lat());
      setLng(e.latLng.lng());
    }
  }, []);

  const onLoad = useCallback(function callback(m: google.maps.Map) {
    setMap(m);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  return (
    <div className="fixed inset-0 bg-[#1b261d]/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl overflow-y-auto max-h-[90vh] border border-[#e1ebe0]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <h3 className="text-xl font-bold text-[#1b261d]">
              Nova Barraca / Loja
            </h3>
          </div>
          <button
            onClick={() => props.setIsModalOpen(false)}
            className="w-8 h-8 rounded-full bg-[#f5f8f2] hover:bg-[#e1ebe0] text-[#566755] flex items-center justify-center transition-colors cursor-pointer text-sm font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1b261d] mb-1.5">
              Nome da Barraca / Loja
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Barraca do Yakisoba, Floricultura"
              className="w-full px-4 py-2.5 bg-[#f8faf7] border border-[#d2dfd0] text-[#1b261d] rounded-xl focus:bg-white focus:ring-2 focus:ring-[#8cb83e] focus:border-[#1e4d2b] outline-none text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1b261d] mb-1.5">
              Foto da Barraca
            </label>
            <input
              type="file"
              accept="image/*"
              required
              className="w-full text-xs text-[#566755] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#eff7e1] file:text-[#1e4d2b] hover:file:bg-[#8cb83e]/20 cursor-pointer"
              onChange={handleImageChange}
            />
            {image && (
              <div className="mt-3">
                <p className="text-[11px] text-[#7b8e79] mb-1 font-medium">Prévia da imagem:</p>
                <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-[#e1ebe0] shadow-sm">
                  <Image
                    src={image}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1b261d]">
                Localização no Mapa
              </label>
              <span className="text-[11px] text-[#8cb83e] font-bold">
                (Clique no mapa para marcar)
              </span>
            </div>
            <div className="rounded-2xl overflow-hidden border border-[#d2dfd0] shadow-inner">
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={defaultCenter}
                  zoom={18}
                  onLoad={onLoad}
                  onUnmount={onUnmount}
                  onClick={onMapClick}
                  options={{
                    streetViewControl: false,
                    mapTypeControl: true,
                  }}
                >
                  {lat !== null && lng !== null && (
                    <MarkerF position={{ lat, lng }} />
                  )}
                </GoogleMap>
              ) : (
                <div className="h-[250px] bg-[#f8faf7] flex items-center justify-center text-[#566755] text-sm">
                  Carregando mapa...
                </div>
              )}
            </div>
            {lat && (
              <p className="mt-2 text-xs text-[#7b8e79] flex items-center gap-1 font-medium">
                <span>📍 Coordenadas:</span>
                <span className="font-bold text-[#1e4d2b]">{lat.toFixed(6)}, {lng?.toFixed(6)}</span>
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#1e4d2b] hover:bg-[#163d21] text-white py-3 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                "Criar Barraca"
              )}
            </button>
            <button
              type="button"
              onClick={() => props.setIsModalOpen(false)}
              className="flex-1 bg-[#f5f8f2] text-[#566755] hover:bg-[#e1ebe0] py-3 rounded-xl font-bold transition-colors cursor-pointer text-sm border border-[#d2dfd0]"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

