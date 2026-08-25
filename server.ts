import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

// Load environment variables
dotenv.config();

// Connect Database (MongoDB Mongoose + persistent catalog sync)
import { connectDB } from './server/config/db.js';
import { db } from './server/db.js';

connectDB().catch(console.error);
db.init();

// Import Routes
import authRoutes from './server/routes/auth.js';
import productRoutes from './server/routes/products.js';
import categoryRoutes from './server/routes/categories.js';
import cartRoutes from './server/routes/cart.js';
import wishlistRoutes from './server/routes/wishlist.js';
import orderRoutes from './server/routes/orders.js';
import reviewRoutes from './server/routes/reviews.js';
import couponRoutes from './server/routes/coupons.js';
import notificationRoutes from './server/routes/notifications.js';
import adminRoutes from './server/routes/admin.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Global Middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Basic request logger
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Zylo Commerce Engine',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  });

  // Mount API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/wishlist', wishlistRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/coupons', couponRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/admin', adminRoutes);

  // Global API 404 handler
  app.all('/api/*', (req, res) => {
    res.status(404).json({ success: false, message: `API endpoint ${req.method} ${req.path} not found.` });
  });

  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[SERVER ERROR]', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal Server Error',
    });
  });

  // Vite middleware for development vs Static files for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Zylo Full-Stack Production Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start Zylo server:', err);
  process.exit(1);
});
