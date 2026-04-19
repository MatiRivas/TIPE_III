export interface OrderItem {
  productId: number;
  quantity: number;
}

export interface Order {
  id: number;
  total: number;
  paymentMethod: 'CASH' | 'CARD';
  status: string;
  createdAt: string;
  items: { product: { name: string }; quantity: number; price: number }[];
}
