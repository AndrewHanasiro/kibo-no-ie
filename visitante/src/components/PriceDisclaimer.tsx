import { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { isPriceDisclaimerEnabled } from '../config/features';

interface PriceDisclaimerProps {
  allowDismiss?: boolean;
  className?: string;
}

const STORAGE_KEY = 'kibo_dismiss_price_disclaimer';

export default function PriceDisclaimer({
  allowDismiss = true,
  className = '',
}: PriceDisclaimerProps) {
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (!allowDismiss || typeof window === 'undefined') return false;
    try {
      return window.sessionStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const isEnabled = isPriceDisclaimerEnabled();
  const isVisible = isEnabled && (!allowDismiss || !isDismissed);

  const handleDismiss = () => {
    setIsDismissed(true);
    if (allowDismiss && typeof window !== 'undefined') {
      try {
        window.sessionStorage.setItem(STORAGE_KEY, 'true');
      } catch {
        // Ignora caso sessionStorage esteja indisponível (modo restrito/navegação privada)
      }
    }
  };

  if (!isVisible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`mx-4 mt-2 mb-1 bg-[#FEF9EE] border border-[#F4DCAC] rounded-xl p-3 flex items-start gap-2.5 text-xs text-[#61460B] shadow-sm transition-all animate-in fade-in duration-200 ${className}`}
    >
      <AlertCircle size={17} className="text-[#C2821A] shrink-0 mt-0.5" />
      <div className="flex-1 leading-relaxed">
        <span className="font-bold block text-[#523A07] mb-0.5">
          Aviso sobre os preços
        </span>
        <span>
          Os preços exibidos são informativos para divulgação prévia e estão sujeitos a alterações até a data do evento.
        </span>
      </div>
      {allowDismiss && (
        <button
          onClick={handleDismiss}
          aria-label="Fechar aviso"
          className="text-[#9A7326] hover:text-[#523A07] hover:bg-[#F3E6CB] p-1 rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}

