import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { categoriesData, generateCatalog } from './data/productsData.js';
import { validateProductImages } from './utils/imageValidator.js';
import {
  UserModel,
  ProductModel,
  CategoryModel,
  CartModel,
  WishlistModel,
  OrderModel,
  ReviewModel,
  CouponModel,
  NotificationModel,
} from './models/index.js';

export interface UserDoc {
  _id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
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

export interface ProductDoc {
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

export interface CategoryDoc {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  iconName?: string;
  subcategories?: string[];
}

export interface CartItemDoc {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface CartDoc {
  _id: string;
  userId: string;
  items: CartItemDoc[];
  updatedAt: string;
}

export interface WishlistDoc {
  _id: string;
  userId: string;
  productIds: string[];
  updatedAt: string;
}

export interface OrderItemDoc {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  sku?: string;
}

export interface OrderDoc {
  _id: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  items: OrderItemDoc[];
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

export interface ReviewDoc {
  _id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
}

export interface CouponDoc {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  startDate: string;
  expiryDate: string;
  usageLimit: number;
  usageCount: number;
  isActive: boolean;
  description: string;
  createdAt: string;
}

export interface NotificationDoc {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'promo' | 'system' | 'account';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

class ZyloDB {
  public users: UserDoc[] = [];
  public products: ProductDoc[] = [];
  public categories: CategoryDoc[] = [];
  public carts: CartDoc[] = [];
  public wishlists: WishlistDoc[] = [];
  public orders: OrderDoc[] = [];
  public reviews: ReviewDoc[] = [];
  public coupons: CouponDoc[] = [];
  public notifications: NotificationDoc[] = [];
  public resetTokens: Map<string, { email: string; expires: number }> = new Map();

  private initialized = false;


  constructor() {
    this.seedInitialData();
  }

  public init() {
    if (!this.initialized) {
      this.seedInitialData();
      this.initialized = true;
    }
  }

  // MongoDB async sync write-through methods
  public async syncUserToMongo(user: UserDoc) {
    if (mongoose.connection.readyState === 1) {
      try {
        await (UserModel as any).findOneAndUpdate({ _id: user._id }, user, { upsert: true, new: true });
      } catch (err: any) {
        console.warn('⚠️ MongoDB UserModel sync error:', err.message);
      }
    }
  }

  public async syncProductToMongo(product: ProductDoc) {
    if (mongoose.connection.readyState === 1) {
      try {
        await (ProductModel as any).findOneAndUpdate({ _id: product._id }, product, { upsert: true, new: true });
      } catch (err: any) {
        console.warn('⚠️ MongoDB ProductModel sync error:', err.message);
      }
    }
  }

  public async syncOrderToMongo(order: OrderDoc) {
    if (mongoose.connection.readyState === 1) {
      try {
        await (OrderModel as any).findOneAndUpdate({ _id: order._id }, order, { upsert: true, new: true });
      } catch (err: any) {
        console.warn('⚠️ MongoDB OrderModel sync error:', err.message);
      }
    }
  }

  public async syncCartToMongo(cart: CartDoc) {
    if (mongoose.connection.readyState === 1) {
      try {
        await (CartModel as any).findOneAndUpdate({ _id: cart._id }, cart, { upsert: true, new: true });
      } catch (err: any) {
        console.warn('⚠️ MongoDB CartModel sync error:', err.message);
      }
    }
  }

  public async syncWishlistToMongo(wishlist: WishlistDoc) {
    if (mongoose.connection.readyState === 1) {
      try {
        await (WishlistModel as any).findOneAndUpdate({ _id: wishlist._id }, wishlist, { upsert: true, new: true });
      } catch (err: any) {
        console.warn('⚠️ MongoDB WishlistModel sync error:', err.message);
      }
    }
  }

  public async syncReviewToMongo(review: ReviewDoc) {
    if (mongoose.connection.readyState === 1) {
      try {
        await (ReviewModel as any).findOneAndUpdate({ _id: review._id }, review, { upsert: true, new: true });
      } catch (err: any) {
        console.warn('⚠️ MongoDB ReviewModel sync error:', err.message);
      }
    }
  }

  public async syncCouponToMongo(coupon: CouponDoc) {
    if (mongoose.connection.readyState === 1) {
      try {
        await (CouponModel as any).findOneAndUpdate({ _id: coupon._id }, coupon, { upsert: true, new: true });
      } catch (err: any) {
        console.warn('⚠️ MongoDB CouponModel sync error:', err.message);
      }
    }
  }

  public async syncNotificationToMongo(notif: NotificationDoc) {
    if (mongoose.connection.readyState === 1) {
      try {
        await (NotificationModel as any).findOneAndUpdate({ _id: notif._id }, notif, { upsert: true, new: true });
      } catch (err: any) {
        console.warn('⚠️ MongoDB NotificationModel sync error:', err.message);
      }
    }
  }

  private seedInitialData() {
    const passwordHash = bcrypt.hashSync('admin123', 10);
    const userPasswordHash = bcrypt.hashSync('user123', 10);

    this.users = [
      {
        _id: 'usr_admin_001',
        name: 'Zylo Super Admin',
        email: 'admin@zylo.com',
        phone: '+91 98765 43210',
        passwordHash: passwordHash,
        role: 'admin',
        status: 'active',
        addresses: [
          {
            id: 'addr_adm_1',
            fullName: 'Zylo Commerce HQ',
            phone: '+91 98765 43210',
            addressLine1: '450 Cyber City, Tower B, Level 10',
            city: 'Gurugram',
            state: 'Haryana',
            postalCode: '122002',
            country: 'India',
            isDefault: true,
          }
        ],
        createdAt: '2025-01-01T00:00:00.000Z',
      },
      {
        _id: 'usr_demo_002',
        name: 'Priya Sharma',
        email: 'user@zylo.com',
        phone: '+91 98123 45678',
        passwordHash: userPasswordHash,
        role: 'customer',
        status: 'active',
        addresses: [
          {
            id: 'addr_usr_1',
            fullName: 'Priya Sharma',
            phone: '+91 98123 45678',
            addressLine1: 'Flat 402, Lotus Greens, Sector 78',
            addressLine2: 'Near Central Park',
            city: 'Noida',
            state: 'Uttar Pradesh',
            postalCode: '201301',
            country: 'India',
            isDefault: true,
          },
          {
            id: 'addr_usr_2',
            fullName: 'Priya Sharma (Office)',
            phone: '+91 98123 45678',
            addressLine1: 'Tech Boulevard, Tower 3, 5th Floor',
            city: 'New Delhi',
            state: 'Delhi',
            postalCode: '110001',
            country: 'India',
            isDefault: false,
          }
        ],
        createdAt: '2025-01-15T10:30:00.000Z',
      },
      {
        _id: 'usr_demo_003',
        name: 'Rohan Verma',
        email: 'rohan@example.com',
        phone: '+91 98456 78901',
        passwordHash: userPasswordHash,
        role: 'customer',
        status: 'active',
        addresses: [
          {
            id: 'addr_rohan_1',
            fullName: 'Rohan Verma',
            phone: '+91 98456 78901',
            addressLine1: '782 12th Main Road, Indiranagar',
            city: 'Bengaluru',
            state: 'Karnataka',
            postalCode: '560038',
            country: 'India',
            isDefault: true,
          }
        ],
        createdAt: '2025-02-10T14:20:00.000Z',
      }
    ];

    this.categories = [...categoriesData];
    this.products = generateCatalog();

    // Automatic product image validation on boot
    validateProductImages(this.products);

    // Seed Sample Realistic Orders
    this.orders = [
      {
        _id: 'ord_1001',
        orderNumber: 'ZYLO-2026-8801',
        userId: 'usr_demo_002',
        userEmail: 'user@zylo.com',
        userName: 'Priya Sharma',
        items: [
          {
            productId: this.products[0]?._id || 'prod_wom_001',
            name: this.products[0]?.name || 'Royal Banarasi Katan Silk Saree with Gold Zari Weave',
            price: this.products[0]?.price || 3499,
            image: this.products[0]?.images[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80',
            quantity: 1,
            selectedColor: 'Crimson Red & Gold Zari',
            selectedSize: '5.5m Saree + 0.8m Blouse Piece',
            sku: 'ZYLO-WOM-001'
          },
          {
            productId: this.products[3]?._id || 'prod_wom_004',
            name: this.products[3]?.name || 'Pure Cotton Anarkali Kurta Set with Dupatta & Pants',
            price: this.products[3]?.price || 1899,
            image: this.products[3]?.images[0] || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80',
            quantity: 1,
            selectedColor: 'Sunflower Yellow & White Thread',
            selectedSize: 'M',
            sku: 'ZYLO-WOM-004'
          }
        ],
        shippingAddress: {
          id: 'addr_usr_1',
          fullName: 'Priya Sharma',
          phone: '+91 98123 45678',
          addressLine1: 'Flat 402, Lotus Greens, Sector 78',
          city: 'Noida',
          state: 'Uttar Pradesh',
          postalCode: '201301',
          country: 'India',
          isDefault: true
        },
        paymentMethod: 'upi',
        paymentStatus: 'paid',
        orderStatus: 'In Transit' as any,
        subtotal: 8698,
        discount: 500,
        shipping: 0,
        tax: 410,
        total: 8608,
        trackingNumber: 'ZYLO-EXP-849201948',
        carrier: 'Zylo Express Air Hub',
        estimatedDeliveryDate: 'Tomorrow by 4:00 PM',
        statusHistory: [
          { status: 'Placed', timestamp: new Date(Date.now() - 36 * 3600000).toISOString(), note: 'Order placed with instant UPI authorization.' },
          { status: 'Confirmed', timestamp: new Date(Date.now() - 30 * 3600000).toISOString(), note: 'Verified by merchant fulfillment center.' },
          { status: 'Processing', timestamp: new Date(Date.now() - 22 * 3600000).toISOString(), note: 'Packed with tamper-evident seal and barcode scanned.' },
          { status: 'Shipped', timestamp: new Date(Date.now() - 14 * 3600000).toISOString(), note: 'Dispatched via Zylo Express Air Priority flight #ZY402.' },
          { status: 'In Transit', timestamp: new Date(Date.now() - 4 * 3600000).toISOString(), note: 'Arrived at Delhi NCR Regional Sorting Center.' }
        ],
        createdAt: new Date(Date.now() - 36 * 3600000).toISOString()
      },
      {
        _id: 'ord_1002',
        orderNumber: 'ZYLO-2026-8802',
        userId: 'usr_demo_002',
        userEmail: 'user@zylo.com',
        userName: 'Priya Sharma',
        items: [
          {
            productId: this.products[27]?._id || 'prod_el_001',
            name: this.products[27]?.name || 'Ultra HD 1.43-Inch AMOLED Display Smart Watch with Bluetooth Calling',
            price: 2999,
            image: this.products[27]?.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
            quantity: 1,
            selectedColor: 'Space Grey',
            selectedSize: '46mm Dial',
            sku: 'ZYLO-ELC-001'
          }
        ],
        shippingAddress: {
          id: 'addr_usr_1',
          fullName: 'Priya Sharma',
          phone: '+91 98123 45678',
          addressLine1: 'Flat 402, Lotus Greens, Sector 78',
          city: 'Noida',
          state: 'Uttar Pradesh',
          postalCode: '201301',
          country: 'India',
          isDefault: true
        },
        paymentMethod: 'card',
        paymentStatus: 'paid',
        orderStatus: 'Delivered',
        subtotal: 2999,
        discount: 0,
        shipping: 0,
        tax: 150,
        total: 3149,
        trackingNumber: 'ZYLO-TRK-983104921',
        carrier: 'BlueDart Air Express',
        estimatedDeliveryDate: 'Delivered Yesterday',
        statusHistory: [
          { status: 'Placed', timestamp: new Date(Date.now() - 96 * 3600000).toISOString(), note: 'Order placed successfully.' },
          { status: 'Confirmed', timestamp: new Date(Date.now() - 90 * 3600000).toISOString(), note: 'Payment captured.' },
          { status: 'Processing', timestamp: new Date(Date.now() - 80 * 3600000).toISOString(), note: 'Packed at Zylo Mega Hub.' },
          { status: 'Shipped', timestamp: new Date(Date.now() - 60 * 3600000).toISOString(), note: 'In transit to destination city.' },
          { status: 'Out for Delivery', timestamp: new Date(Date.now() - 30 * 3600000).toISOString(), note: 'Out for delivery with courier associate Ramesh.' },
          { status: 'Delivered', timestamp: new Date(Date.now() - 24 * 3600000).toISOString(), note: 'Handed over directly with OTP verification.' }
        ],
        createdAt: new Date(Date.now() - 96 * 3600000).toISOString()
      },
      {
        _id: 'ord_1003',
        orderNumber: 'ZYLO-2026-8803',
        userId: 'usr_demo_003',
        userEmail: 'rohan@example.com',
        userName: 'Rohan Verma',
        items: [
          {
            productId: this.products[35]?._id || 'prod_spt_001',
            name: this.products[35]?.name || '6mm Eco-Friendly High-Density Non-Slip Alignment Yoga Mat',
            price: 1299,
            image: this.products[35]?.images[0] || 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&auto=format&fit=crop&q=80',
            quantity: 1,
            selectedColor: 'Deep Teal & Grey',
            selectedSize: '72 x 24 Inches',
            sku: 'ZYLO-SPT-001'
          }
        ],
        shippingAddress: {
          id: 'addr_rohan_1',
          fullName: 'Rohan Verma',
          phone: '+91 98456 78901',
          addressLine1: '782 12th Main Road, Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038',
          country: 'India',
          isDefault: true
        },
        paymentMethod: 'card',
        paymentStatus: 'paid',
        orderStatus: 'Processing',
        subtotal: 1299,
        discount: 0,
        shipping: 0,
        tax: 65,
        total: 1364,
        trackingNumber: 'ZYLO-TRK-381049281',
        carrier: 'Zylo Express Ground',
        estimatedDeliveryDate: 'Friday, 22 Aug',
        statusHistory: [
          { status: 'Placed', timestamp: new Date(Date.now() - 10 * 3600000).toISOString(), note: 'Order placed.' },
          { status: 'Confirmed', timestamp: new Date(Date.now() - 8 * 3600000).toISOString(), note: 'Seller accepted order.' },
          { status: 'Processing', timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), note: 'Quality check completed and packing in progress.' }
        ],
        createdAt: new Date(Date.now() - 10 * 3600000).toISOString()
      }
    ];

    // Seed sample reviews
    if (this.products.length > 0) {
      this.reviews = [
        {
          _id: 'rev_1',
          productId: this.products[0]._id,
          userId: 'usr_demo_002',
          userName: 'Priya Sharma',
          rating: 5,
          title: 'Gorgeous fabric and rich zari work!',
          comment: 'The saree is even more stunning in person. The golden zari border is intricate and shines beautifully under wedding lights. Received so many compliments!',
          verifiedPurchase: true,
          status: 'approved',
          createdAt: '2025-02-12T14:30:00.000Z',
        },
        {
          _id: 'rev_2',
          productId: this.products[0]._id,
          userId: 'usr_demo_003',
          userName: 'Ananya Deshmukh',
          rating: 5,
          title: 'Pure royal feel, worth every penny',
          comment: 'Very soft drape and comfortable to wear for full 8 hours. Fast delivery by Zylo within 2 days with nice gift packaging!',
          verifiedPurchase: true,
          status: 'approved',
          createdAt: '2025-02-14T09:15:00.000Z',
        },
        {
          _id: 'rev_3',
          productId: this.products[1]._id,
          userId: 'usr_demo_002',
          userName: 'Kavita Iyer',
          rating: 5,
          title: 'Authentic Kanchipuram weave',
          comment: 'Color is rich and the contrast blouse looks lovely once stitched. Truly export grade quality.',
          verifiedPurchase: true,
          status: 'approved',
          createdAt: '2025-02-15T18:20:00.000Z',
        }
      ];
    }

    // Seed sample active coupons
    this.coupons = [
      {
        _id: 'cpn_1',
        code: 'WELCOME20',
        discountType: 'percentage',
        discountValue: 20,
        minOrderAmount: 999,
        maxDiscountAmount: 500,
        startDate: '2025-01-01T00:00:00.000Z',
        expiryDate: '2027-12-31T23:59:59.000Z',
        usageLimit: 10000,
        usageCount: 142,
        isActive: true,
        description: '20% OFF up to ₹500 on your order of ₹999+',
        createdAt: '2025-01-01T00:00:00.000Z',
      },
      {
        _id: 'cpn_2',
        code: 'NOVASAVE10',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 499,
        maxDiscountAmount: 300,
        startDate: '2025-01-01T00:00:00.000Z',
        expiryDate: '2027-12-31T23:59:59.000Z',
        usageLimit: 50000,
        usageCount: 389,
        isActive: true,
        description: 'Flat 10% instant discount on cart value',
        createdAt: '2025-01-01T00:00:00.000Z',
      },
      {
        _id: 'cpn_3',
        code: 'ZYLO500',
        discountType: 'fixed',
        discountValue: 500,
        minOrderAmount: 2999,
        startDate: '2025-01-01T00:00:00.000Z',
        expiryDate: '2027-12-31T23:59:59.000Z',
        usageLimit: 5000,
        usageCount: 88,
        isActive: true,
        description: 'Flat ₹500 OFF on premium shopping above ₹2999',
        createdAt: '2025-01-01T00:00:00.000Z',
      },
      {
        _id: 'cpn_4',
        code: 'FESTIVE15',
        discountType: 'percentage',
        discountValue: 15,
        minOrderAmount: 1499,
        maxDiscountAmount: 750,
        startDate: '2025-01-01T00:00:00.000Z',
        expiryDate: '2027-12-31T23:59:59.000Z',
        usageLimit: 20000,
        usageCount: 215,
        isActive: true,
        description: '15% OFF on ethnic wear, sarees & festive collection',
        createdAt: '2025-01-01T00:00:00.000Z',
      },
    ];

    // Seed welcome notification
    this.notifications = [
      {
        _id: 'notif_1',
        userId: 'usr_demo_002',
        title: 'Welcome to Zylo Shopping!',
        message: 'Use code WELCOME20 to get 20% OFF on your first order.',
        type: 'promo',
        link: '/shop',
        isRead: false,
        createdAt: '2025-01-15T10:30:00.000Z',
      },
    ];
  }
}

export const db = new ZyloDB();
