import mongoose, { Schema } from 'mongoose';

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  subcategory?: string;
  brand: string;
  price: number;
  originalPrice: number;
  discount: number;
  images: string[];
  stock: number;
  sku: string;
  colors: string[];
  sizes: string[];
  specifications: Record<string, string>;
  features: string[];
  warranty?: string;
  rating: number;
  reviewCount: number;
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
  freeDelivery: boolean;
  badge?: string;
  fabric?: string;
  occasion?: string;
  pattern?: string;
  ageGroup?: string;
  gender?: string;
  toyType?: string;
  isFlashDeal?: boolean;
  dealType?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    subcategory: { type: String, index: true },
    brand: { type: String, required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    images: { type: [String], required: true },
    stock: { type: Number, required: true, default: 0, min: 0 },
    sku: { type: String, required: true, unique: true, index: true },
    colors: { type: [String], default: ['Standard'] },
    sizes: { type: [String], default: ['Standard'] },
    specifications: { type: Schema.Types.Mixed, default: {} },
    features: { type: [String], default: [] },
    warranty: { type: String, default: '1 Year Brand Warranty' },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    featured: { type: Boolean, default: false },
    bestseller: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },
    freeDelivery: { type: Boolean, default: true },
    badge: { type: String },
    fabric: { type: String },
    occasion: { type: String },
    pattern: { type: String },
    ageGroup: { type: String },
    gender: { type: String },
    toyType: { type: String },
    isFlashDeal: { type: Boolean, default: false },
    dealType: { type: String },
  },
  { timestamps: true }
);

ProductSchema.index({ name: 'text', description: 'text', brand: 'text', category: 'text' });

export const ProductModel = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
