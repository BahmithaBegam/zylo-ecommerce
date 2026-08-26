import mongoose, { Schema } from 'mongoose';

export interface ICartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface ICart {
  _id: string;
  userId: string;
  items: ICartItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1, min: 1 },
    selectedColor: { type: String, default: 'Standard' },
    selectedSize: { type: String, default: 'Standard' },
  },
  { _id: false }
);

const CartSchema = new Schema<ICart>(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true, unique: true, index: true },
    items: { type: [CartItemSchema], default: [] },
  },
  { timestamps: true }
);

export const CartModel = mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema);
