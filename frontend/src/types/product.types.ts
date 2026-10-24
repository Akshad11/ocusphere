export type ProductType = 
  | 'Eyeglasses'
  | 'Sunglasses'
  | 'Prescription lenses'
  | 'Contact lenses'
  | 'Accessories';

export type PublicationStatus = 'published' | 'draft' | 'archived';

export interface ProductVariant {
  id: string;
  productId: string;
  variantSku: string;
  barcode: string;
  colorName: string;
  colorHex: string;
  size: 'Narrow' | 'Medium' | 'Wide' | 'One Size' | string;
  material: string;
  sellingPrice: number;
  costPrice: number; // Admin-only
  stockOnHand: number;
  reservedQuantity: number;
  reorderLevel: number;
  images: string[];
  isAvailable: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string; // e.g. 'Men', 'Women', 'Unisex', 'Kids', 'Designer'
  productType: ProductType;
  description: string;
  modelCode: string;
  basePrice: number;
  featuredImage: string;
  images: string[];
  variants: ProductVariant[];
  status: PublicationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  productType?: ProductType | 'all';
  category?: string;
  brand?: string;
  status?: PublicationStatus | 'all';
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sortBy?: 'name' | 'price' | 'createdAt' | 'stock';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateProductInput {
  name: string;
  brand: string;
  category: string;
  productType: ProductType;
  description: string;
  modelCode: string;
  basePrice: number;
  status: PublicationStatus;
  images: string[];
  variants: Array<Omit<ProductVariant, 'id' | 'productId' | 'stockOnHand' | 'reservedQuantity'> & {
    initialStock?: number;
  }>;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: string;
}
