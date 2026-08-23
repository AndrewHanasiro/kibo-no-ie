import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Utensils, ChevronLeft, WifiOff, Receipt, Plus, Minus } from 'lucide-react';
import type { Product } from '../types/product';

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const MOCK_URL = 'https://listproducts-veumhwpskq-uc.a.run.app';
const apiUrl = backendUrl ? `${backendUrl}/listProducts` : MOCK_URL;

export default function Produtos() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['Todos']);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Não precisamos de state para o valor total, calculamos de forma derivada para evitar bugs no setState duplo do React Strict Mode
  const totalValue = useMemo(() => {
    return allProducts.reduce((sum, item) => sum + (item.price * (item.quantity || 0)), 0);
  }, [allProducts]);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Erro: ${response.status} - ${response.statusText}`);
      }
      const data = await response.json();

      const products: Product[] = data.map((item: any) => ({
        ...item,
        quantity: 0
      }));

      setAllProducts(products);

      // Extrair categorias únicas
      const uniqueCategories = Array.from(new Set(products.map(p => p.category)));
      setCategories(['Todos', ...uniqueCategories]);

    } catch (err: any) {
      console.error("Erro ao buscar produtos:", err);
      setError(err.message || 'Falha ao carregar os produtos do cardápio');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateTotal = (productToUpdate: Product, isAdding: boolean) => {
    setAllProducts(currentProducts => {
      return currentProducts.map(product => {
        if (product.id === productToUpdate.id) {
          const currentQty = product.quantity || 0;
          
          if (isAdding) {
            return { ...product, quantity: currentQty + 1 };
          } else if (currentQty > 0) {
            return { ...product, quantity: currentQty - 1 };
          }
        }
        return product;
      });
    });
  };

  const totalItemsCount = useMemo(() => {
    return allProducts.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }, [allProducts]);

  const displayedProducts = useMemo(() => {
    if (selectedCategory === 'Todos') return allProducts;
    return allProducts.filter(p => p.category === selectedCategory);
  }, [allProducts, selectedCategory]);

  return (
    <div className="flex flex-col h-screen bg-kibo-bg overflow-hidden relative">
      {/* App Bar equivalente */}
      <header className="bg-primary-forest text-white shadow-md z-10 flex-shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-1 rounded-full hover:bg-white/10 transition-colors">
              <ChevronLeft size={24} />
            </Link>
            <div className="bg-secondary-leaf p-1.5 rounded-lg flex items-center justify-center">
              <Utensils size={20} className="text-[#13301A]" />
            </div>
            <div className="flex flex-col">
              <h1 className="font-bold text-lg leading-tight">46ª Festa do Verde</h1>
              <span className="text-[#C5E1B8] text-xs font-medium">Cardápio de Comidas & Bebidas</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto flex flex-col relative pb-32">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-4 border-secondary-leaf border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#566755] text-sm font-medium">Carregando delícias do evento...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4 text-center">
            <WifiOff size={48} className="text-red-500" />
            <p className="text-[#566755] text-sm">{error}</p>
            <button
              onClick={fetchProducts}
              className="mt-2 flex items-center gap-2 bg-primary-forest text-white px-4 py-2 rounded-xl font-medium hover:bg-opacity-90 transition shadow-sm"
            >
              Tentar Novamente
            </button>
          </div>
        ) : allProducts.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[#566755]">Nenhum produto cadastrado no momento.</p>
          </div>
        ) : (
          <>
            {/* Horizontal Category Chips */}
            {categories.length > 0 && (
              <div className="flex-shrink-0 w-full overflow-x-auto no-scrollbar py-3 px-4 shadow-sm bg-kibo-bg sticky top-0 z-10">
                <div className="flex gap-2">
                  {categories.map((category) => {
                    const isSelected = selectedCategory === category;
                    return (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${isSelected
                            ? 'bg-white border-secondary-leaf text-[#13301A] font-bold shadow-sm'
                            : 'bg-white border-[#E1EBE0] text-[#566755] hover:bg-gray-50'
                          }`}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Product List */}
            <div className="px-4 py-2 space-y-3">
              {displayedProducts.map((product) => (
                <ProductItemTile
                  key={product.id}
                  product={product}
                  onAdd={() => updateTotal(product, true)}
                  onRemove={() => updateTotal(product, false)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Modern Bottom Checkout Bar */}
      {!isLoading && !error && allProducts.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 bg-primary-forest shadow-[0_-4px_10px_rgba(0,0,0,0.15)] z-20 pb-safe">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-secondary-leaf p-2 rounded-xl">
                <Receipt size={20} className="text-[#13301A]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[#C5E1B8] text-xs font-medium">Pedir no caixa:</span>
                <span className="text-white/80 text-xs font-medium">
                  {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'itens'} selecionados
                </span>
              </div>
            </div>
            <div className="text-white font-black text-xl tracking-wide">
              R$ {Math.max(0, totalValue).toFixed(2).replace('.', ',')}
            </div>
          </div>
        </div>
      )}

      {/* Custom styles to hide scrollbar */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom, 1rem);
        }
      `}</style>
    </div>
  );
}

// --- Product List Item Widget ---
function ProductItemTile({
  product,
  onAdd,
  onRemove
}: {
  product: Product,
  onAdd: () => void,
  onRemove: () => void
}) {
  const isAvailable = product.isAvailable;
  const quantity = product.quantity || 0;

  return (
    <div className={`bg-white rounded-[18px] border overflow-hidden transition-all duration-200 ${quantity > 0
        ? 'border-secondary-leaf shadow-md'
        : 'border-[#E1EBE0] shadow-sm hover:shadow-md'
      }`}>
      <div className="p-4 flex items-center">
        {/* Product Details */}
        <div className="flex-1 flex flex-col justify-center">
          <h3 className={`text-[15px] font-bold ${isAvailable ? 'text-[#1B261D]' : 'text-gray-400'}`}>
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="bg-[#EFF7E1] text-primary-forest text-[10px] font-bold px-2 py-0.5 rounded-lg">
              {product.category}
            </span>
            <span className="text-primary-forest text-sm font-extrabold">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>

        {/* Stepper Controls */}
        {isAvailable ? (
          <div className="flex items-center bg-kibo-bg rounded-xl border border-[#E1EBE0] h-9 ml-2">
            <button
              onClick={onRemove}
              disabled={quantity <= 0}
              className={`px-2 h-full flex items-center justify-center rounded-l-xl transition-colors ${quantity > 0 ? 'text-red-600 hover:bg-red-50 active:bg-red-100' : 'text-gray-300'
                }`}
            >
              <Minus size={16} />
            </button>
            <div className="px-2 min-w-[32px] text-center flex items-center justify-center">
              <span className={`text-[15px] font-extrabold ${quantity > 0 ? 'text-primary-forest' : 'text-[#566755]'}`}>
                {quantity}
              </span>
            </div>
            <button
              onClick={onAdd}
              className="px-2 h-full flex items-center justify-center bg-secondary-leaf/30 text-primary-forest hover:bg-secondary-leaf/50 active:bg-secondary-leaf/70 rounded-r-xl transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
        ) : (
          <div className="bg-gray-100 px-3 py-1.5 rounded-lg ml-2">
            <span className="text-gray-500 text-xs font-bold">Esgotado</span>
          </div>
        )}
      </div>
    </div>
  );
}
