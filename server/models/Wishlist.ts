import mongoose, { Schema } from 'mongoose';

export interface IWishlist {
  _id: string;
  userId: string;
  productIds: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const WishlistSchema = new Schema<IWishlist>(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true, unique: true, index: true },
    productIds: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const WishlistModel = mongoose.models.Wishlist || mongoose.model<IWishlist>('Wishlist', WishlistSchema);
