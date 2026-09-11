import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Utensils, ChevronLeft, WifiOff, Plus, Minus, Calculator, X, Trash2, Info } from 'lucide-react';
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
  const [isCalculatorMode, setIsCalculatorMode] = useState<boolean>(false);

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
    const load = async () => {
      await fetchProducts();
    };
    load();
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

  const clearQuantities = () => {
    setAllProducts(currentProducts =>
      currentProducts.map(product => ({
        ...product,
        quantity: 0
      }))
    );
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
      <main className="flex-1 overflow-y-auto flex flex-col relative pb-36">
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

            {/* Banner explicativo quando o Modo Calculadora está ativo */}
            {isCalculatorMode && (
              <div className="mx-4 mt-2 mb-1 bg-[#EFF7E1] border border-secondary-leaf/50 rounded-xl p-3 flex items-start gap-2.5 text-xs text-primary-forest shadow-sm">
                <Info size={16} className="text-secondary-leaf shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold block">Modo Calculadora Ativo</span>
                  <span className="text-[#3c5e3f]">
                    Utilize os botões + e - para somar seus itens. O pagamento é feito presencialmente nos caixas físicos do evento.
                  </span>
                </div>
              </div>
            )}

            {/* Product List */}
            <div className="px-4 py-2 space-y-3">
              {displayedProducts.map((product) => (
                <ProductItemTile
                  key={product.id}
                  product={product}
                  isCalculatorMode={isCalculatorMode}
                  onAdd={() => updateTotal(product, true)}
                  onRemove={() => updateTotal(product, false)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Rodapé quando Calculadora está Inativa */}
      {!isCalculatorMode && !isLoading && !error && allProducts.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#E1EBE0] p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] z-20 pb-safe">
          <button
            onClick={() => setIsCalculatorMode(true)}
            className="w-full bg-primary-forest hover:bg-[#163a20] active:scale-[0.99] text-white py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Calculator size={18} className="text-secondary-leaf" />
            <span>Ativar modo calculadora</span>
          </button>
          <p className="text-[11px] text-center text-[#566755] mt-2 font-medium">
            Some os itens para saber o total antes de ir ao caixa físico
          </p>
        </div>
      )}

      {/* Rodapé quando Calculadora está Ativa */}
      {isCalculatorMode && !isLoading && !error && allProducts.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 bg-primary-forest shadow-[0_-4px_16px_rgba(0,0,0,0.2)] z-20 pb-safe text-white">
          <div className="p-4 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-secondary-leaf p-2 rounded-xl">
                  <Calculator size={20} className="text-[#13301A]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[#C5E1B8] text-[11px] font-semibold uppercase tracking-wider">
                    Total para o caixa
                  </span>
                  <span className="text-white/80 text-xs font-medium">
                    {totalItemsCount} {totalItemsCount === 1 ? 'item selecionado' : 'itens selecionados'}
                  </span>
                </div>
              </div>
              <div className="text-white font-black text-2xl tracking-tight">
                R$ {Math.max(0, totalValue).toFixed(2).replace('.', ',')}
              </div>
            </div>

            {/* Ações da calculadora */}
            <div className="flex items-center justify-between pt-2 border-t border-white/15 text-xs">
              <button
                onClick={clearQuantities}
                disabled={totalItemsCount === 0}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors ${
                  totalItemsCount > 0 ? 'text-[#C5E1B8] hover:text-white hover:bg-white/10 cursor-pointer' : 'text-white/30 cursor-not-allowed'
                }`}
              >
                <Trash2 size={14} />
                <span>Zerar valores</span>
              </button>

              <button
                onClick={() => {
                  clearQuantities();
                  setIsCalculatorMode(false);
                }}
                className="flex items-center gap-1.5 text-white/90 hover:text-white bg-white/15 hover:bg-white/25 active:bg-white/30 px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer"
              >
                <X size={14} />
                <span>Fechar calculadora</span>
              </button>
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
  isCalculatorMode,
  onAdd,
  onRemove
}: {
  product: Product,
  isCalculatorMode: boolean,
  onAdd: () => void,
  onRemove: () => void
}) {
  const isAvailable = product.isAvailable;
  const quantity = product.quantity || 0;

  return (
    <div className={`bg-white rounded-[18px] border overflow-hidden transition-all duration-200 ${
      isCalculatorMode && quantity > 0
        ? 'border-secondary-leaf shadow-md'
        : 'border-[#E1EBE0] shadow-sm hover:shadow-md'
    }`}>
      <div className="p-4 flex items-center justify-between">
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

        {/* Stepper Controls ou Status */}
        {isCalculatorMode ? (
          isAvailable ? (
            <div className="flex items-center bg-kibo-bg rounded-xl border border-[#E1EBE0] h-9 ml-2">
              <button
                onClick={onRemove}
                disabled={quantity <= 0}
                aria-label="Diminuir quantidade"
                className={`px-2 h-full flex items-center justify-center rounded-l-xl transition-colors ${
                  quantity > 0 ? 'text-red-600 hover:bg-red-50 active:bg-red-100' : 'text-gray-300'
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
                aria-label="Aumentar quantidade"
                className="px-2 h-full flex items-center justify-center bg-secondary-leaf/30 text-primary-forest hover:bg-secondary-leaf/50 active:bg-secondary-leaf/70 rounded-r-xl transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          ) : (
            <div className="bg-gray-100 px-3 py-1.5 rounded-lg ml-2">
              <span className="text-gray-500 text-xs font-bold">Esgotado</span>
            </div>
          )
        ) : (
          !isAvailable && (
            <div className="bg-gray-100 px-3 py-1.5 rounded-lg ml-2">
              <span className="text-gray-500 text-xs font-bold">Esgotado</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}
