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