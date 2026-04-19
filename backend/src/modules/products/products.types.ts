export interface CreateProductDTO {
  name: string;
  price: number;
  stock: number;
  minStock?: number;
  imageUrl?: string;
}

export interface UpdateProductDTO {
  name?: string;
  price?: number;
  stock?: number;
  minStock?: number;
  imageUrl?: string;
}