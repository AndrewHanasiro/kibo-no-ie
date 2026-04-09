"use client";

import React, { useState, useCallback } from "react";
import { auth } from "../../../lib/firebase";
import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api";
import Image from "next/image";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = { lat: -23.435119625012014, lng: -46.35803342659766 }; // Default to São Paulo

type CreateShopModalProps = {
  setIsModalOpen: (b: boolean) => void;
  fetchShop: () => void;
};

export default function CreateShopModal(props: CreateShopModalProps) {
  const [name, setName] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [image, setImage] = useState<string>("");

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!, // Replace with your actual API Key
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

    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(
        `https://createshop-veumhwpskq-uc.a.run.app`,
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
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl overflow-y-auto max-h-[90vh]">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Nova Loja</h3>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Nome da loja
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-400 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Imagem da loja
            </label>
            <input
              type="file"
              accept="image/*"
              required
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              onChange={handleImageChange}
            />
            {image && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Prévia:</p>
                <Image
                  src={image}
                  alt="Preview"
                  width={128}
                  height={128}
                  className="object-cover rounded-lg border border-gray-200"
                  unoptimized
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Localização (Clique no mapa)
            </label>
            <div className="rounded-lg overflow-hidden border border-gray-300">
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={defaultCenter}
                  zoom={18}
                  onLoad={onLoad}
                  onUnmount={onUnmount}
                  onClick={onMapClick}
                >
                  {lat !== null && lng !== null && (
                    <MarkerF position={{ lat, lng }} />
                  )}
                </GoogleMap>
              ) : (
                <div className="h-[250px] bg-gray-100 flex items-center justify-center text-gray-400">
                  Carregando mapa...
                </div>
              )}
            </div>
            {lat && (
              <p className="mt-2 text-xs text-gray-500">
                Coordenadas: {lat.toFixed(6)}, {lng?.toFixed(6)}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Criar
            </button>
            <button
              type="button"
              onClick={() => props.setIsModalOpen(false)}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
