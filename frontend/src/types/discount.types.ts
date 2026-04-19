export interface Discount {
  id: number;
  name: string;
  percentage: number;          // ej: 10 = 10%
  applyToAll: boolean;         // true = aplica a todos los productos
  productIds: number[];        // IDs de productos específicos (vacío si applyToAll = true)
  active: boolean;
  createdAt: string;
  updatedAt: string;
  products?: { id: number; name: string }[];
}

export interface CreateDiscountDto {
  name: string;
  percentage: number;
  applyToAll: boolean;
  productIds: number[];
}

export interface UpdateDiscountDto {
  name?: string;
  percentage?: number;
  applyToAll?: boolean;
  productIds?: number[];
}