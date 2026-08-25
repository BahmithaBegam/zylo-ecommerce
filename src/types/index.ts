export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin' | 'staff';
  status: 'active' | 'disabled';
  addresses: ShippingAddress[];
  createdAt: string;
}

export interface ShippingAddress {
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

export interface Product {
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
  warranty: string;
  rating: number;
  reviewCount: number;
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
  freeDelivery?: boolean;
  badge?: string;
  fabric?: string;
  occasion?: string;
  pattern?: string;
  ageGroup?: string;
  gender?: string;
  toyType?: string;
  isFlashDeal?: boolean;
  dealType?: string;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  iconName?: string;
  subcategories?: string[];
  productCount?: number;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  currentPrice?: number;
  inStock?: boolean;
  stockAvailable?: number;
  slug?: string;
  sku?: string;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  freeShippingThreshold: number;
  remainingForFreeShipping: number;
}

export interface WishlistItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  inStock: boolean;
  slug: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  sku?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: 'card' | 'upi' | 'cod';
  paymentStatus: 'paid' | 'pending' | 'failed';
  orderStatus: 'Placed' | 'Confirmed' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  trackingNumber: string;
  carrier: string;
  estimatedDeliveryDate: string;
  statusHistory: Array<{
    status: string;
    timestamp: string;
    note: string;
  }>;
  isHiddenFromCustomer?: boolean;
  createdAt: string;
}

export interface Review {
  _id: string;
  productId: string;
  productName?: string;
  productImage?: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  pendingOrders: number;
  lowStockProducts: number;
}
