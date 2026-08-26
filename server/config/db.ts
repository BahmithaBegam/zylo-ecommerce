import mongoose from 'mongoose';
import { config } from './env.js';
import { db } from '../db.js';
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
} from '../models/index.js';

export async function connectDB(): Promise<boolean> {
  if (!config.mongoUri) {
    console.log('ℹ️ MONGO_URI not provided. Operating with high-performance in-memory / persistent catalog store.');
    return false;
  }

  try {
    console.log('Connecting to MongoDB database with MONGO_URI...');
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB connected successfully to database:', mongoose.connection.name);

    // Synchronize catalog, users, categories and store state with MongoDB
    await syncWithMongoDB();

    // Setup mongoose connection lifecycle listeners
    mongoose.connection.on('error', (err) => {
      console.error('⚠️ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected.');
    });

    return true;
  } catch (error: any) {
    console.warn('⚠️ MongoDB connection attempt failed:', error.message);
    console.log('ℹ️ Falling back smoothly to local database engine.');
    return false;
  }
}

/**
 * Synchronizes initial dataset with MongoDB collections if empty,
 * or loads existing documents from MongoDB into memory store.
 */
async function syncWithMongoDB() {
  try {
    // 1. Categories
    console.log(`📦 Synchronizing ${db.categories.length} canonical categories with MongoDB...`);
    await CategoryModel.deleteMany({});
    await CategoryModel.insertMany(db.categories as any);

    // 2. Products - Clean up legacy standalone 'Sarees' category documents if present
    await ProductModel.deleteMany({ category: 'Sarees' });
    await ProductModel.deleteMany({ _id: { $regex: /^prod_sar_/ } });

    console.log(`📦 Synchronizing verified products with MongoDB...`);
    const mongoProductCount = await ProductModel.countDocuments();
    if (mongoProductCount === 0) {
      const chunkSize = 100;
      for (let i = 0; i < db.products.length; i += chunkSize) {
        const chunk = db.products.slice(i, i + chunkSize);
        await ProductModel.insertMany(chunk as any);
      }
      console.log(`✅ Initialized ${db.products.length} products into MongoDB.`);
    } else {
      // Upsert memory products into MongoDB preserving any extra DB documents
      for (const prod of db.products) {
        await (ProductModel as any).findOneAndUpdate({ _id: prod._id }, prod, { upsert: true });
      }
      // Load all MongoDB products into db.products so memory store has full catalog
      const allMongoProds = await ProductModel.find().lean();
      if (allMongoProds.length > db.products.length) {
        db.products = allMongoProds.map((p: any) => ({
          _id: p._id,
          name: p.name,
          slug: p.slug,
          description: p.description,
          category: p.category,
          subcategory: p.subcategory,
          brand: p.brand,
          price: p.price,
          originalPrice: p.originalPrice,
          discount: p.discount,
          images: p.images,
          stock: p.stock,
          sku: p.sku,
          colors: p.colors || [],
          sizes: p.sizes || [],
          specifications: p.specifications || {},
          features: p.features || [],
          warranty: p.warranty,
          rating: p.rating,
          reviewCount: p.reviewCount,
          featured: !!p.featured,
          bestseller: !!p.bestseller,
          newArrival: !!p.newArrival,
          freeDelivery: p.freeDelivery !== false,
          badge: p.badge,
          fabric: p.fabric,
          occasion: p.occasion,
          pattern: p.pattern,
          isFlashDeal: !!p.isFlashDeal,
          dealType: p.dealType,
          createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
        }));
      }
      console.log(`✅ Synchronized catalog: ${db.products.length} products loaded from MongoDB.`);
    }

    // 3. Users
    const userCount = await UserModel.countDocuments();
    if (userCount === 0 && db.users.length > 0) {
      console.log(`👤 Seeding ${db.users.length} initial users to MongoDB...`);
      await UserModel.insertMany(db.users as any);
    } else if (userCount > 0) {
      const mongoUsers = await UserModel.find().lean();
      db.users = mongoUsers.map((u: any) => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone || '',
        passwordHash: u.passwordHash,
        role: u.role || 'customer',
        status: u.status || 'active',
        addresses: u.addresses || [],
        createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
      }));
    }

    // 4. Coupons
    const couponCount = await CouponModel.countDocuments();
    if (couponCount === 0 && db.coupons.length > 0) {
      console.log(`🎟️ Seeding ${db.coupons.length} coupons to MongoDB...`);
      await CouponModel.insertMany(db.coupons as any);
    } else if (couponCount > 0) {
      const mongoCoupons = await CouponModel.find().lean();
      db.coupons = mongoCoupons.map((cp: any) => ({
        _id: cp._id,
        code: cp.code,
        discountType: cp.discountType,
        discountValue: cp.discountValue,
        minOrderAmount: cp.minOrderAmount || 0,
        maxDiscountAmount: cp.maxDiscountAmount,
        startDate: cp.startDate ? new Date(cp.startDate).toISOString() : new Date().toISOString(),
        expiryDate: cp.expiryDate ? new Date(cp.expiryDate).toISOString() : new Date().toISOString(),
        usageLimit: cp.usageLimit || 10000,
        usageCount: cp.usageCount || 0,
        isActive: cp.isActive !== false,
        description: cp.description || '',
        createdAt: cp.createdAt ? new Date(cp.createdAt).toISOString() : new Date().toISOString(),
      }));
    }

    // 5. Reviews
    const reviewCount = await ReviewModel.countDocuments();
    if (reviewCount === 0 && db.reviews.length > 0) {
      console.log(`⭐ Seeding ${db.reviews.length} reviews to MongoDB...`);
      await ReviewModel.insertMany(db.reviews as any);
    } else if (reviewCount > 0) {
      const mongoReviews = await ReviewModel.find().lean();
      db.reviews = mongoReviews.map((r: any) => ({
        _id: r._id,
        productId: r.productId,
        userId: r.userId,
        userName: r.userName,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        verifiedPurchase: !!r.verifiedPurchase,
        status: r.status || 'approved',
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      }));
    }

    // 6. Orders
    const orderCount = await OrderModel.countDocuments();
    if (orderCount === 0 && db.orders.length > 0) {
      console.log(`📦 Seeding ${db.orders.length} initial orders to MongoDB...`);
      await OrderModel.insertMany(db.orders as any);
    } else if (orderCount > 0) {
      const mongoOrders = await OrderModel.find().lean();
      db.orders = mongoOrders.map((o: any) => ({
        _id: o._id,
        orderNumber: o.orderNumber,
        userId: o.userId,
        userEmail: o.userEmail,
        userName: o.userName,
        items: o.items || [],
        shippingAddress: o.shippingAddress,
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
        orderStatus: o.orderStatus,
        subtotal: o.subtotal,
        discount: o.discount || 0,
        shipping: o.shipping || 0,
        tax: o.tax || 0,
        total: o.total,
        trackingNumber: o.trackingNumber,
        carrier: o.carrier,
        estimatedDeliveryDate: o.estimatedDeliveryDate,
        statusHistory: o.statusHistory || [],
        createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString(),
      }));
    }

    console.log('✨ Data synchronization with MongoDB complete.');
  } catch (err: any) {
    console.error('⚠️ Error during MongoDB synchronization:', err.message);
  }
}
