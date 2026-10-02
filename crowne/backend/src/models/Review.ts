import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReview extends Document {
  createdAt: Date;
  updatedAt: Date;
  product: Types.ObjectId;
  user?: Types.ObjectId;
  name: string;
  rating: number;
  comment: string;
}

const reviewSchema = new Schema<IReview>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

export const Review = mongoose.model<IReview>('Review', reviewSchema);
