import mongoose, { Schema } from 'mongoose';

export interface IOrderItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  sku: string;
}

export interface IOrderStatusHistory {
  status: string;
  timestamp: string;
  note?: string;
}

export interface IOrderShippingAddress {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface IOrder {
  _id: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  items: IOrderItem[];
  shippingAddress: IOrderShippingAddress;
  paymentMethod: 'card' | 'upi' | 'netbanking' | 'cod' | 'wallet';
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
  orderStatus: 'Placed' | 'Confirmed' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  trackingNumber: string;
  carrier: string;
  estimatedDeliveryDate: string;
  statusHistory: IOrderStatusHistory[];
  isHiddenFromCustomer?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    quantity: { type: Number, required: true },
    selectedColor: { type: String },
    selectedSize: { type: String },
    sku: { type: String, required: true },
  },
  { _id: false }
);

const OrderShippingAddressSchema = new Schema<IOrderShippingAddress>(
  {
    id: { type: String, required: true },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String, default: '' },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, default: 'India' },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const OrderStatusHistorySchema = new Schema<IOrderStatusHistory>(
  {
    status: { type: String, required: true },
    timestamp: { type: String, required: true },
    note: { type: String },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    _id: { type: String, required: true },
    orderNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    userEmail: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    items: { type: [OrderItemSchema], required: true },
    shippingAddress: { type: OrderShippingAddressSchema, required: true },
    paymentMethod: { type: String, enum: ['card', 'upi', 'netbanking', 'cod', 'wallet'], default: 'card' },
    paymentStatus: { type: String, enum: ['paid', 'pending', 'failed', 'refunded'], default: 'paid' },
    orderStatus: {
      type: String,
      enum: ['Placed', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Placed',
      index: true,
    },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    trackingNumber: { type: String, required: true, index: true },
    carrier: { type: String, default: 'BlueDart Express Air' },
    estimatedDeliveryDate: { type: String, required: true },
    statusHistory: { type: [OrderStatusHistorySchema], default: [] },
    isHiddenFromCustomer: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const OrderModel = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
