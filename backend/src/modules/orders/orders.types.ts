export interface OrderItemDTO {
  productId: number;
  quantity: number;
}

export interface CreateOrderDTO {
  items: OrderItemDTO[];
  paymentMethod: 'CASH' | 'CARD';
}
