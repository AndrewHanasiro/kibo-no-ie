import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Megaphone, AlertCircle, RefreshCw, MessageSquareWarning } from 'lucide-react';
import type { Warning } from '../types/warning';

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const MOCK_URL = 'https://listwarning-veumhwpskq-uc.a.run.app';
const apiUrl = backendUrl ? `${backendUrl}/listWarning` : MOCK_URL;

export default function Avisos() {
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWarnings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if ('caches' in window) {
        try {
          const cacheKeys = await caches.keys();
          for (const key of cacheKeys) {
            const cache = await caches.open(key);
            const reqs = await cache.keys();
            for (const req of reqs) {
              if (req.url.toLowerCase().includes('listwarning')) {
                await cache.delete(req);
              }
            }
          }
        } catch {
          // ignore cache storage errors
        }
      }

      const response = await fetch(`${apiUrl}?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });
      if (!response.ok) {
        throw new Error(`Erro: ${response.status} - ${response.statusText}`);
      }
      const data = await response.json();
      
      const sortedWarnings = data.sort((a: any, b: any) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
      
      setWarnings(sortedWarnings);
    } catch (err: any) {
      console.error("Erro ao buscar avisos:", err);
      setError(err.message || 'Falha ao carregar comunicados oficiais');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await fetchWarnings();
    };
    load();
  }, [fetchWarnings]);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} às ${hours}:${minutes}`;
  };

  return (
    <div className="flex flex-col h-screen bg-kibo-bg overflow-hidden">
      {/* App Bar equivalente */}
      <header className="bg-primary-forest text-white shadow-md z-10 flex-shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-1 rounded-full hover:bg-white/10 transition-colors">
              <ChevronLeft size={24} />
            </Link>
            <div className="bg-secondary-leaf p-1.5 rounded-lg flex items-center justify-center">
              <Megaphone size={20} className="text-[#13301A]" />
            </div>
            <div className="flex flex-col">
              <h1 className="font-bold text-lg leading-tight">Quadro de Avisos</h1>
              <span className="text-[#C5E1B8] text-xs font-medium">Comunicados e Recados da Organização</span>
            </div>
          </div>
          <button
            onClick={() => fetchWarnings()}
            disabled={isLoading}
            aria-label="Atualizar avisos"
            className="p-2 rounded-full hover:bg-white/10 transition-colors text-white disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center p-8 space-y-4 min-h-[60vh]">
            <div className="w-10 h-10 border-4 border-secondary-leaf border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#566755] text-sm font-medium">Carregando avisos...</p>
          </div>
        ) : error ? (
          <div className="h-full flex flex-col items-center justify-center p-8 space-y-4 text-center min-h-[60vh]">
            <AlertCircle size={48} className="text-red-500" />
            <p className="text-[#566755] text-sm">{error}</p>
            <button 
              onClick={fetchWarnings}
              className="mt-2 flex items-center gap-2 bg-primary-forest text-white px-4 py-2 rounded-xl font-medium hover:bg-opacity-90 transition shadow-sm cursor-pointer"
            >
              <RefreshCw size={18} />
              Atualizar
            </button>
          </div>
        ) : warnings.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4 min-h-[60vh]">
            <MessageSquareWarning size={56} className="text-secondary-leaf" />
            <h2 className="text-lg font-bold text-[#1B261D]">Nenhum comunicado no momento</h2>
            <p className="text-[#566755] text-sm">
              Os avisos importantes sobre os eventos, apresentações e bingos aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {warnings.map((warning, index) => (
              <div 
                key={warning.id} 
                className="bg-white rounded-[18px] border border-[#E1EBE0] shadow-sm flex shrink-0 overflow-hidden"
              >
                {/* Left Color Bar */}
                <div className={`w-1.5 shrink-0 ${index === 0 ? 'bg-secondary-leaf' : 'bg-primary-forest'}`}></div>
                
                <div className="p-4 flex gap-3.5 flex-1 min-w-0">
                  <div className="bg-[#EFF7E1] p-2 rounded-xl h-fit shrink-0">
                    <Megaphone size={20} className="text-primary-forest" />
                  </div>
                  
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-primary-forest leading-tight">Aviso Oficial</span>
                        <span className="text-[10px] text-[#566755] mt-0.5">{formatDate(warning.timestamp)}</span>
                      </div>
                      {index === 0 && (
                        <div className="bg-secondary-leaf px-1.5 py-0.5 rounded-md shrink-0">
                          <span className="text-[9px] font-bold text-[#13301A] uppercase tracking-wider">Recente</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm font-medium text-[#1B261D] mt-2 leading-relaxed break-words">
                      {warning.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
