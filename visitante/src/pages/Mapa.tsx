import { useState, useEffect, useCallback, useMemo } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import { Link } from 'react-router-dom';
import { ChevronLeft, MapPin, Search, Store } from 'lucide-react';
import type { Shop } from '../types/shop';
import type { Product } from '../types/product';

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const SHOP_URL = backendUrl ? `${backendUrl}/listShop` : 'https://listshop-veumhwpskq-uc.a.run.app';
const PRODUCT_URL = backendUrl ? `${backendUrl}/listProducts` : 'https://listproducts-veumhwpskq-uc.a.run.app';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const center = {
  lat: -23.435119625012014,
  lng: -46.35803342659766,
};

const mapOptions = {
  mapTypeId: 'satellite',
  disableDefaultUI: true,
  zoomControl: false,
  minZoom: 18,
  maxZoom: 20,
  restriction: {
    latLngBounds: {
      south: -23.4365,
      west: -46.3595,
      north: -23.4335,
      east: -46.3565,
    },
    strictBounds: true,
  },
};

export default function Mapa() {
  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}>
      <MapaInner />
    </APIProvider>
  );
}

function MapaInner() {
  const map = useMap();

  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const fetchShops = useCallback(async () => {
    try {
      const res = await fetch(SHOP_URL);
      if (res.ok) {
        const data = await res.json();
        setShops(data);
      }
    } catch (e) {
      console.error("Erro ao buscar barracas:", e);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch(PRODUCT_URL);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (e) {
      console.error("Erro ao buscar produtos:", e);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchShops(), fetchProducts()]).finally(() => {
      setIsLoading(false);
    });
  }, [fetchShops, fetchProducts]);

  const handleShopSelect = useCallback((shop: Shop) => {
    setSelectedShop(shop);
    setSelectedShopId(shop.id);
    setSearchError(null);
    if (map) {
      map.panTo({ lat: shop.latitude, lng: shop.longitude });
      map.setZoom(19.5);
    }
  }, [map]);

  const handleProductSelect = useCallback((product: Product) => {
    setSearchQuery(product.name);
    setShowDropdown(false);

    if (product.shopId) {
      const shop = shops.find(s => s.id === product.shopId);
      if (shop) {
        handleShopSelect(shop);
      } else {
        setSearchError('Barraca não encontrada para este produto.');
      }
    } else {
      setSearchError('Este produto não está associado a nenhuma barraca.');
    }
  }, [shops, handleShopSelect]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return [];
    return products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, products]);

  // Handle outside click for autocomplete
  useEffect(() => {
    const handleClickOutside = () => {
      if (showDropdown) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showDropdown]);

  return (
    <div className="relative w-full h-screen bg-kibo-bg overflow-hidden flex flex-col">
      {/* App Bar equivalente */}
      <header className="bg-primary-forest text-white shadow-md z-10 flex-shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-1 rounded-full hover:bg-white/10 transition-colors">
              <ChevronLeft size={24} />
            </Link>
            <div className="bg-secondary-leaf p-1.5 rounded-lg flex items-center justify-center">
              <MapPin size={20} className="text-[#13301A]" />
            </div>
            <div className="flex flex-col">
              <h1 className="font-bold text-lg leading-tight">Mapa do Evento</h1>
              <span className="text-[#C5E1B8] text-xs font-medium">
                {isLoading ? 'Carregando barracas...' : `${shops.length} barracas • Toque para detalhes`}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container for Map and Search */}
      <div className="flex-1 w-full h-full relative">
        {/* Search Overlay */}
        <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
          <div className="px-4 mt-4 flex flex-col gap-3 max-w-lg mx-auto pointer-events-auto">
          <div className="relative">
            <div className="bg-white/90 backdrop-blur rounded-2xl border border-[#E1EBE0] shadow-sm flex items-center px-4 py-3">
              <Search size={20} className="text-primary-forest mr-3" />
              <input
                type="text"
                placeholder="Pesquisar produto..."
                className="flex-1 bg-transparent border-none outline-none text-[#1B261D] placeholder:text-[#566755] text-sm"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                  setSearchError(null);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (searchQuery) setShowDropdown(true);
                }}
              />
            </div>
            
            {showDropdown && filteredProducts.length > 0 && (
              <div 
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-[#E1EBE0] overflow-hidden max-h-60 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {filteredProducts.map(product => (
                  <button
                    key={product.id}
                    className="w-full text-left px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 flex flex-col transition-colors"
                    onClick={() => handleProductSelect(product)}
                  >
                    <span className="text-sm font-bold text-[#1B261D]">{product.name}</span>
                    <span className="text-xs text-primary-forest font-semibold mt-0.5">
                      R$ {product.price.toFixed(2).replace('.', ',')}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Error Toast */}
          {searchError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-xs font-medium shadow-sm animate-in slide-in-from-top-2">
              {searchError}
            </div>
          )}
        </div>
      </div>

      {/* Google Map */}
      <div className="flex-1 w-full h-full relative z-10">
        <Map
          mapId="DEMO_MAP_ID"
          defaultCenter={center}
          defaultZoom={18.5}
          style={containerStyle}
          {...mapOptions}
          onClick={() => {
            if (selectedShop) setSelectedShop(null);
          }}
        >
          {shops.map((shop) => {
            const isSelected = selectedShopId === null || selectedShopId === shop.id;
            const isHighlighted = selectedShopId === shop.id;

            return (
              <AdvancedMarker
                key={shop.id}
                position={{ lat: shop.latitude, lng: shop.longitude }}
                onClick={() => handleShopSelect(shop)}
                style={{ opacity: isSelected ? 1.0 : 0.4 }}
              >
                <Pin
                  background={isHighlighted ? '#1e4d2b' : '#E53935'}
                  borderColor={isHighlighted ? '#13301A' : '#B71C1C'}
                  glyphColor={'#ffffff'}
                />
              </AdvancedMarker>
            );
          })}
        </Map>
      </div>

      {/* Shop Details Modal (Bottom Sheet style) */}
      {selectedShop && (
        <div className="absolute inset-0 z-30 flex items-end justify-center sm:items-center bg-black/20 backdrop-blur-sm pointer-events-auto" onClick={() => setSelectedShop(null)}>
          <div 
            className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header badge */}
            <div className="bg-[#EFF7E1] px-3 py-1.5 rounded-full flex items-center gap-1.5 mb-4">
              <Store size={14} className="text-primary-forest" />
              <span className="text-[11px] font-bold text-primary-forest">
                Ponto Oficial da Festa
              </span>
            </div>

            {/* Shop Name */}
            <h3 className="text-xl font-bold text-[#1B261D] text-center mb-4 leading-tight">
              {selectedShop.name}
            </h3>

            {/* Shop Image */}
            <div className="w-full mb-4">
              {selectedShop.image ? (
                <div className="w-full h-40 rounded-2xl overflow-hidden border border-[#E1EBE0]">
                  <img 
                    src={selectedShop.image} 
                    alt={selectedShop.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      e.currentTarget.parentElement?.classList.add('bg-[#F5F8F2]', 'flex', 'items-center', 'justify-center');
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-28 bg-[#F5F8F2] rounded-2xl flex items-center justify-center">
                  <Store size={40} className="text-secondary-leaf" />
                </div>
              )}
            </div>

            {/* Coordinates */}
            <div className="bg-[#F5F8F2] px-3 py-1.5 rounded-lg mb-6">
              <span className="text-[10px] font-semibold text-[#566755]">
                Local: {selectedShop.latitude.toFixed(4)}, {selectedShop.longitude.toFixed(4)}
              </span>
            </div>

            {/* Close Button */}
            <button 
              onClick={() => setSelectedShop(null)}
              className="w-full bg-primary-forest text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-opacity-90 transition-colors shadow-md"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      <style>{`
        .pt-safe-top {
          padding-top: env(safe-area-inset-top, 0.5rem);
        }
      `}</style>
      </div>
    </div>
  );
}

