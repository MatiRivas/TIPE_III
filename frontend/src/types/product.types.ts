export interface Product {
  id: number;
  name: string;
  price: number;
  available: boolean;
  minStock: number;
  imageUrl?: string;
}
