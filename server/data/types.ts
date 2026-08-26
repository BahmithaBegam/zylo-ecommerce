export interface RawProductSpec {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  brand: string;
  price: number;
  originalPrice: number;
  discount: number;
  photoId: string;
  stock: number;
  sku: string;
  colors: string[];
  sizes: string[];
  fabric?: string;
  occasion?: string;
  pattern?: string;
  badge?: string;
  rating: number;
  reviewCount: number;
  featured?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
  isFlashDeal?: boolean;
  dealType?: string;
  description: string;
  features: string[];
  specifications: Record<string, string>;
}
