import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  createdAt: Date;
  updatedAt: Date;
  name: string;
  slug: string;
  category: string;
  price: number;
  oldPrice?: number;
  description?: string;
  colors: string[];
  sizes: string[];
  stock: number;
  image: string;
  images: string[];
  rating: number;
  reviewsCount: number;
  featured: boolean;
  bestseller: boolean;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    oldPrice: { type: Number },
    description: { type: String, default: '' },
    colors: { type: [String], default: [] },
    sizes: { type: [String], default: ['36', '37', '38', '39', '40', '41', '42'] },
    stock: { type: Number, default: 0 },
    image: { type: String, default: '' },
    images: { type: [String], default: [] },
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    bestseller: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Product = mongoose.model<IProduct>('Product', productSchema);
