import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IOrderItem {
  productId?: Types.ObjectId;
  name: string;
  size?: string;
  color?: string;
  price: number;
  qty: number;
  image?: string;
}

export interface ITimelineEntry {
  status: string;
  at: Date;
  note?: string;
}

export interface IOrder extends Document {
  createdAt: Date;
  updatedAt: Date;
  orderNumber: string;
  user?: Types.ObjectId;
  name: string;
  email?: string;
  phone: string;
  address: string;
  city: string;
  postal?: string;
  paymentMethod: 'cod' | 'card';
  items: IOrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shipping: number;
  total: number;
  status: 'placed' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  timeline: ITimelineEntry[];
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true },
    size: { type: String },
    color: { type: String },
    price: { type: Number, required: true },
    qty: { type: Number, required: true },
    image: { type: String },
  },
  { _id: false }
);

const timelineSchema = new Schema<ITimelineEntry>(
  {
    status: { type: String, required: true },
    at: { type: Date, required: true },
    note: { type: String },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    email: { type: String, required: false },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postal: { type: String },
    paymentMethod: { type: String, enum: ['cod', 'card'], required: true },
    items: { type: [orderItemSchema], default: [] },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    couponCode: { type: String },
    shipping: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'placed',
    },
    timeline: { type: [timelineSchema], default: [] },
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>('Order', orderSchema);
