"use client";

import React, { useState, useCallback } from "react";
import { auth } from "../../../lib/firebase";
import { Shop } from "@/hooks/shop";
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from "@react-google-maps/api";
import Image from "next/image";

const containerStyle = {
  width: "100%",
  height: "320px",
  borderRadius: "0.75rem",
};

const defaultCenter = { lat: -23.435119625012014, lng: -46.35803342659766 }; // Kibô-no-Iê

type UpdateShopModalProps = {
  selectedShop: Shop;
  setIsModalOpen: (b: boolean) => void;
  fetchShop: () => void;
};

export default function UpdateShopModal(props: UpdateShopModalProps) {
  const [name, setName] = useState(props.selectedShop.name);
  const [locations, setLocations] = useState<{ latitude: number; longitude: number }[]>(() => {
    if (Array.isArray(props.selectedShop.locations) && props.selectedShop.locations.length > 0) {
      return props.selectedShop.locations;
    }
    const legacy = props.selectedShop as unknown as { latitude?: number; longitude?: number };
    if (typeof legacy.latitude === "number" && typeof legacy.longitude === "number") {
      return [{ latitude: legacy.latitude, longitude: legacy.longitude }];
    }
    return [];
  });
  const [image, setImage] = useState<string>(props.selectedShop.image ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMarkerIndex, setSelectedMarkerIndex] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);

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

  const handleUpdate = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/updateShop`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: props.selectedShop.id,
            ...(props.selectedShop.name !== name && { name }),
            locations: locations, // Always send current locations to update/replace
            ...(props.selectedShop.image !== image && { image }),
          }),
        },
      );

      if (response.ok) {
        props.setIsModalOpen(false);
        props.fetchShop();
      } else {
        const errorText = await response.text();
        setErrorMessage(errorText || "Ocorreu um erro ao atualizar a barraca.");
      }
    } catch (error) {
      console.error("Update failed:", error);
      setErrorMessage("Erro de conexão ao atualizar a barraca.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. Create location by clicking on map
  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setLocations((prev) => {
        const next = [...prev, { latitude: lat, longitude: lng }];
        setSelectedMarkerIndex(next.length - 1);
        return next;
      });
    }
  }, []);

  // 2. Update location by dragging marker
  const handleMarkerDragEnd = (index: number, e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setLocations((prev) => {
        const updated = [...prev];
        updated[index] = { latitude: lat, longitude: lng };
        return updated;
      });
    }
  };

  // 3. Delete location
  const handleRemoveLocation = (index: number) => {
    setLocations((prev) => prev.filter((_, i) => i !== index));
    if (selectedMarkerIndex === index) {
      setSelectedMarkerIndex(null);
    } else if (selectedMarkerIndex !== null && selectedMarkerIndex > index) {
      setSelectedMarkerIndex(selectedMarkerIndex - 1);
    }
  };

  const handleClearAllLocations = () => {
    if (confirm("Deseja realmente remover todas as localizações desta barraca?")) {
      setLocations([]);
      setSelectedMarkerIndex(null);
    }
  };

  const handleFocusLocation = (index: number) => {
    const loc = locations[index];
    if (loc && map) {
      map.panTo({ lat: loc.latitude, lng: loc.longitude });
      map.setZoom(19);
    }
    setSelectedMarkerIndex(index);
  };

  const onLoad = useCallback(function callback(m: google.maps.Map) {
    setMap(m);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  const center =
    locations.length > 0
      ? { lat: locations[0].latitude, lng: locations[0].longitude }
      : defaultCenter;

  return (
    <div className="fixed inset-0 bg-[#1b261d]/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl overflow-y-auto max-h-[90vh] border border-[#e1ebe0]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎪</span>
            <h3 className="text-xl font-bold text-[#1b261d]">
              Atualizar Barraca: {props.selectedShop?.name}
            </h3>
          </div>
          <button
            onClick={() => props.setIsModalOpen(false)}
            className="w-8 h-8 rounded-full bg-[#f5f8f2] hover:bg-[#e1ebe0] text-[#566755] flex items-center justify-center transition-colors cursor-pointer text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1b261d] mb-1.5">
              Nome da Barraca / Loja
            </label>
            <input
              type="text"
              required
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
              className="w-full text-xs text-[#566755] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#eff7e1] file:text-[#1e4d2b] hover:file:bg-[#8cb83e]/20 cursor-pointer"
              onChange={handleImageChange}
            />
            {image && (
              <div className="mt-3">
                <p className="text-[11px] text-[#7b8e79] mb-1 font-medium">Pré-visualização:</p>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1b261d]">
                Localizações no Mapa ({locations.length})
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#8cb83e] font-bold">
                  Clique no mapa para criar • Arraste para mover
                </span>
                {locations.length > 1 && (
                  <button
                    type="button"
                    onClick={handleClearAllLocations}
                    className="text-[11px] text-red-500 hover:text-red-700 font-semibold underline cursor-pointer"
                  >
                    Limpar todos
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-[#d2dfd0] shadow-inner relative">
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={center}
                  zoom={18}
                  onLoad={onLoad}
                  onUnmount={onUnmount}
                  onClick={onMapClick}
                  options={{
                    streetViewControl: false,
                    mapTypeControl: true,
                  }}
                >
                  {locations.map((loc, index) => (
                    <MarkerF
                      key={`${index}-${loc.latitude}-${loc.longitude}`}
                      position={{ lat: loc.latitude, lng: loc.longitude }}
                      draggable={true}
                      onDragEnd={(e) => handleMarkerDragEnd(index, e)}
                      onClick={() => setSelectedMarkerIndex(index)}
                      label={{
                        text: `${index + 1}`,
                        color: "#ffffff",
                        fontWeight: "bold",
                        fontSize: "12px",
                      }}
                      title={`Ponto ${index + 1} - Arraste para reposicionar`}
                    />
                  ))}

                  {selectedMarkerIndex !== null && locations[selectedMarkerIndex] && (
                    <InfoWindowF
                      position={{
                        lat: locations[selectedMarkerIndex].latitude,
                        lng: locations[selectedMarkerIndex].longitude,
                      }}
                      onCloseClick={() => setSelectedMarkerIndex(null)}
                    >
                      <div className="p-1 min-w-[170px]">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="font-bold text-[#1e4d2b] text-xs">
                            📍 Ponto {selectedMarkerIndex + 1}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 font-mono mb-2">
                          {locations[selectedMarkerIndex].latitude.toFixed(6)},{" "}
                          {locations[selectedMarkerIndex].longitude.toFixed(6)}
                        </p>
                        <p className="text-[10px] text-gray-500 mb-2">
                          💡 Arraste o marcador no mapa para ajustar a posição.
                        </p>
                        <button
                          type="button"
                          onClick={() => handleRemoveLocation(selectedMarkerIndex)}
                          className="w-full py-1 px-2 bg-red-50 hover:bg-red-100 text-red-600 rounded text-xs font-bold transition-colors cursor-pointer border border-red-200"
                        >
                          🗑️ Excluir ponto
                        </button>
                      </div>
                    </InfoWindowF>
                  )}
                </GoogleMap>
              ) : (
                <div className="h-[320px] bg-[#f8faf7] flex items-center justify-center text-[#566755] text-sm">
                  Carregando mapa...
                </div>
              )}
            </div>

            {/* List of locations */}
            <div className="mt-2.5">
              {locations.length === 0 ? (
                <div className="p-3 bg-[#f8faf7] border border-dashed border-[#d2dfd0] rounded-xl text-center">
                  <p className="text-xs text-[#566755]">
                    Nenhuma localização cadastrada. Clique no mapa acima para adicionar o primeiro ponto.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {locations.map((loc, index) => {
                    const isSelected = selectedMarkerIndex === index;
                    return (
                      <div
                        key={index}
                        className={`flex justify-between items-center px-3 py-2 rounded-xl border transition-all ${
                          isSelected
                            ? "bg-[#eff7e1] border-[#8cb83e] shadow-sm"
                            : "bg-[#f8faf7] hover:bg-[#f1f5ef] border-[#e1ebe0]"
                        }`}
                      >
                        <div
                          className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
                          onClick={() => handleFocusLocation(index)}
                          title="Clique para focar no mapa"
                        >
                          <span className="w-5 h-5 rounded-full bg-[#1e4d2b] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                            {index + 1}
                          </span>
                          <span className="text-xs text-[#1b261d] font-mono truncate">
                            {loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)}
                          </span>
                          <span className="text-[10px] text-[#8cb83e] font-semibold hidden sm:inline">
                            (focar)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveLocation(index)}
                          className="text-red-500 hover:text-red-700 text-xs font-bold px-2 py-1 hover:bg-red-50 rounded-lg transition-colors cursor-pointer flex-shrink-0 ml-2"
                        >
                          Remover
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#1e4d2b] hover:bg-[#163d21] text-white py-3 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                "Salvar Alterações"
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

