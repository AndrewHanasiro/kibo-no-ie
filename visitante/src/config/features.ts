/**
 * Feature flags do aplicativo do Visitante.
 * 
 * Permite alternar funcionalidades via variáveis de ambiente (Vite)
 * ou query parameter na URL (útil para testes rápidos em preview).
 */

export function isPriceDisclaimerEnabled(): boolean {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const paramVal = params.get('priceDisclaimer');
    if (paramVal === 'true') return true;
    if (paramVal === 'false') return false;
  }

  // Padrão: ativado (true), a menos que explicitamente configurado como 'false'
  return import.meta.env.VITE_SHOW_PRICE_DISCLAIMER !== 'false';
}

export const features = {
  get showPriceDisclaimer(): boolean {
    return isPriceDisclaimerEnabled();
  },
};

