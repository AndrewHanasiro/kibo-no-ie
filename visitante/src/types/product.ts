export interface Product {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
  category: string;
  shopId?: string;
  quantity?: number; // Propriedade local para o carrinho (não vai para o banco)
}
