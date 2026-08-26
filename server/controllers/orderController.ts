import { Response } from 'express';
import mongoose from 'mongoose';
import { db, OrderDoc, OrderItemDoc } from '../db.js';
import { ProductModel, CartModel, OrderModel } from '../models/index.js';
import { AuthRequest } from '../middleware/auth.js';
import { emailService, EmailSendResult } from '../services/emailService.js';

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    let customerEmail = (req.user.email || '').toLowerCase().trim();

    // Check if customer email is missing, invalid, or legacy demo placeholder
    if (!customerEmail || !EMAIL_REGEX.test(customerEmail) || customerEmail === 'user@zylo.com') {
      const fallbackFromReq = (req.body.customerEmail || req.body.email || '').toLowerCase().trim();
      if (fallbackFromReq && EMAIL_REGEX.test(fallbackFromReq) && fallbackFromReq !== 'user@zylo.com') {
        customerEmail = fallbackFromReq;
        req.user.email = fallbackFromReq;
        db.syncUserToMongo(req.user).catch(console.error);
      } else {
        return res.status(400).json({
          success: false,
          requiresEmailUpdate: true,
          message: 'A valid customer email address is required to receive order receipts and tracking updates. Please update your account email.',
        });
      }
    }

    let { items, shippingAddress, paymentMethod, promoCode } = req.body;

    // 1. If items not explicitly provided in request body, retrieve from user's active cart
    if (!items || !Array.isArray(items) || items.length === 0) {
      let userCart = db.carts.find(c => c.userId === req.user?._id);
      if ((!userCart || userCart.items.length === 0) && mongoose.connection.readyState === 1) {
        const mongoCart = await (CartModel as any).findOne({ userId: req.user._id }).lean();
        if (mongoCart && mongoCart.items && mongoCart.items.length > 0) {
          userCart = mongoCart as any;
        }
      }
      if (userCart && userCart.items && userCart.items.length > 0) {
        items = userCart.items;
      }
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your shopping bag is empty. Please add items before placing an order.' });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.addressLine1 || !shippingAddress.city) {
      return res.status(400).json({ success: false, message: 'A valid shipping address is required.' });
    }

    // 2. Validate stock & recalculate server-side prices
    const verifiedItems: OrderItemDoc[] = [];
    let subtotal = 0;

    for (const item of items) {
      const prodId = item.productId || item._id || item.id;
      let product = db.products.find(p => p._id === prodId || p.slug === prodId || p.sku === prodId);

      if (!product && mongoose.connection.readyState === 1) {
        const mongoProd = await (ProductModel as any).findOne({
          $or: [{ _id: prodId }, { slug: prodId }, { sku: prodId }],
        }).lean();
        if (mongoProd) {
          product = mongoProd as any;
        }
      }

      const qty = Math.max(1, Number(item.quantity) || 1);
      const itemPrice = product ? product.price : (Number(item.price) || 999);
      const itemName = product ? product.name : (item.name || 'Zylo Product');
      const itemImage = (product && product.images?.[0]) || item.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80';
      const itemSku = (product && product.sku) || item.sku || `SKU-${Date.now()}`;
      const itemColor = item.selectedColor || (product && product.colors?.[0]) || 'Standard';
      const itemSize = item.selectedSize || (product && product.sizes?.[0]) || 'Standard';

      if (product) {
        // Adjust product stock
        if (product.stock > 0) {
          product.stock = Math.max(0, product.stock - qty);
        }
      }

      const itemTotal = itemPrice * qty;
      subtotal += itemTotal;

      verifiedItems.push({
        productId: product ? product._id : prodId,
        name: itemName,
        price: itemPrice,
        image: itemImage,
        quantity: qty,
        selectedColor: itemColor,
        selectedSize: itemSize,
        sku: itemSku,
      });
    }

    // 3. Validate Coupon & compute discount server-side
    let discount = 0;
    if (promoCode && typeof promoCode === 'string') {
      const cleanCode = promoCode.trim().toUpperCase();
      const coupon = db.coupons.find(c => c.code.toUpperCase() === cleanCode && c.isActive);

      if (coupon) {
        const now = new Date();
        const expiry = new Date(coupon.expiryDate);

        if (expiry > now && subtotal >= coupon.minOrderAmount) {
          if (coupon.discountType === 'percentage') {
            const calculated = Math.round((subtotal * coupon.discountValue) / 100);
            discount = coupon.maxDiscountAmount ? Math.min(calculated, coupon.maxDiscountAmount) : calculated;
          } else {
            discount = Math.min(coupon.discountValue, subtotal);
          }
          coupon.usageCount += 1;
        }
      }
    }

    // 3. Compute delivery & tax
    const shipping = subtotal > 999 ? 0 : 99;
    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = Math.round(taxableAmount * 0.05); // 5% GST
    const total = taxableAmount + shipping + tax;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ZYLO-${new Date().getFullYear()}-${randomSuffix}`;
    const trackingNumber = `ZYLO-EXP-${Math.floor(100000000 + Math.random() * 900000000)}`;

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);
    const estimatedDeliveryDate = deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    const newOrder: OrderDoc = {
      _id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      orderNumber,
      userId: req.user._id,
      userEmail: req.user.email,
      userName: req.user.name,
      items: verifiedItems,
      shippingAddress: {
        id: shippingAddress.id || `addr_${Date.now()}`,
        fullName: shippingAddress.fullName.trim(),
        phone: shippingAddress.phone || req.user.phone || '',
        addressLine1: shippingAddress.addressLine1.trim(),
        addressLine2: shippingAddress.addressLine2?.trim() || '',
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        postalCode: shippingAddress.postalCode.trim(),
        country: shippingAddress.country || 'India',
        isDefault: Boolean(shippingAddress.isDefault),
      },
      paymentMethod: paymentMethod || 'card',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      orderStatus: 'Placed',
      subtotal,
      discount,
      shipping,
      tax,
      total,
      trackingNumber,
      carrier: 'BlueDart Express Air',
      estimatedDeliveryDate,
      statusHistory: [
        {
          status: 'Placed',
          timestamp: new Date().toISOString(),
          note: `Order placed successfully using ${paymentMethod ? paymentMethod.toUpperCase() : 'Card'}.`,
        },
      ],
      createdAt: new Date().toISOString(),
    };

    db.orders.unshift(newOrder);

    // 4. Clear user cart
    const cart = db.carts.find(c => c.userId === req.user?._id);
    if (cart) {
      cart.items = [];
      cart.updatedAt = new Date().toISOString();
      db.syncCartToMongo(cart).catch(console.error);
    }

    // 5. Create in-app order notification
    const orderNotif = {
      _id: `notif_${Date.now()}`,
      userId: req.user._id,
      title: `Order Confirmed: #${newOrder.orderNumber}`,
      message: `Your order of ₹${newOrder.total.toLocaleString('en-IN')} has been placed successfully. Estimated delivery by ${estimatedDeliveryDate}.`,
      type: 'order' as const,
      link: `/orders/track?number=${newOrder.orderNumber}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    db.notifications.unshift(orderNotif);

    // Synchronize order, product stock deductions and notification to MongoDB
    db.syncOrderToMongo(newOrder).catch(console.error);
    db.syncNotificationToMongo(orderNotif).catch(console.error);
    for (const item of verifiedItems) {
      const p = db.products.find(prod => prod._id === item.productId);
      if (p) db.syncProductToMongo(p).catch(console.error);
    }

    // 6. Trigger Nodemailer emails (Admin + Customer) asynchronously in background
    Promise.allSettled([
      emailService.sendAdminNewOrderEmail(newOrder),
      emailService.sendCustomerOrderConfirmationEmail(newOrder),
    ]).then(([adminResult, customerResult]) => {
      const adminSuccess = adminResult.status === 'fulfilled' && adminResult.value.success;
      const adminErr = adminResult.status === 'fulfilled' ? adminResult.value.error : adminResult.reason?.message;
      const customerSuccess = customerResult.status === 'fulfilled' && customerResult.value.success;
      const customerErr = customerResult.status === 'fulfilled' ? customerResult.value.error : customerResult.reason?.message;

      if (customerSuccess) {
        console.log(`✅ [ORDER CONFIRMATION EMAIL DELIVERED] Successfully sent to customer: ${newOrder.userEmail} (Order #${newOrder.orderNumber})`);
      } else {
        console.warn(`⚠️ [ORDER CONFIRMATION EMAIL NOT SENT] Customer: ${newOrder.userEmail} | Reason: ${customerErr || 'Unknown error'}`);
      }

      if (adminSuccess) {
        console.log(`✅ [ADMIN ORDER NOTIFICATION DELIVERED] Order #${newOrder.orderNumber}`);
      } else {
        console.warn(`⚠️ [ADMIN ORDER NOTIFICATION NOT SENT] Reason: ${adminErr || 'Unknown error'}`);
      }
    }).catch(emailErr => {
      console.warn('Background order email processing warning:', emailErr);
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully! Confirmation email dispatched.',
      order: newOrder,
    });
  } catch (err: any) {
    console.error('Order creation error:', err);
    return res.status(500).json({ success: false, message: 'Failed to place order. Please try again.' });
  }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    let userOrders: OrderDoc[] = [];
    if (req.user.role === 'admin' || req.user.role === 'staff') {
      if (mongoose.connection.readyState === 1) {
        const mongoOrders = await (OrderModel as any).find().sort({ createdAt: -1 }).lean();
        if (mongoOrders && mongoOrders.length > 0) {
          userOrders = mongoOrders as any;
        } else {
          userOrders = [...db.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
      } else {
        userOrders = [...db.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    } else {
      if (mongoose.connection.readyState === 1) {
        const mongoOrders = await (OrderModel as any)
          .find({ userId: req.user._id, isHiddenFromCustomer: { $ne: true } })
          .sort({ createdAt: -1 })
          .lean();
        if (mongoOrders && mongoOrders.length > 0) {
          userOrders = mongoOrders as any;
        } else {
          userOrders = db.orders
            .filter(o => o.userId === req.user?._id && !o.isHiddenFromCustomer)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
      } else {
        userOrders = db.orders
          .filter(o => o.userId === req.user?._id && !o.isHiddenFromCustomer)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    }

    return res.json({
      success: true,
      orders: userOrders,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve orders.' });
  }
};

export const deleteOrder = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { id } = req.params;
    let order: any = null;

    if (mongoose.connection.readyState === 1) {
      order = await (OrderModel as any).findOne({
        $or: [{ _id: id }, { orderNumber: id }],
      });
    }

    if (!order) {
      order = db.orders.find(o => o._id === id || o.orderNumber === id);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Strict Authorization: Customers can ONLY remove their own orders from history
    if (order.userId !== req.user._id && req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({ success: false, message: 'Access denied. You cannot remove another user\'s order.' });
    }

    // Soft delete for customer order history: marks isHiddenFromCustomer = true
    // Preserves database records for admin, tax audit, email history, and revenue calculations
    order.isHiddenFromCustomer = true;

    if (mongoose.connection.readyState === 1) {
      await (OrderModel as any).updateOne(
        { $or: [{ _id: id }, { orderNumber: id }] },
        { $set: { isHiddenFromCustomer: true } }
      );
    }

    // Update in-memory db instance as well
    const memOrder = db.orders.find(o => o._id === id || o.orderNumber === id);
    if (memOrder) {
      memOrder.isHiddenFromCustomer = true;
    }

    return res.json({
      success: true,
      message: 'Order removed from your order history.',
      orderId: order._id || id,
    });
  } catch (err: any) {
    console.error('Delete order error:', err);
    return res.status(500).json({ success: false, message: 'Failed to remove order from history.' });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });

    const { id } = req.params;
    let order: any = null;

    if (mongoose.connection.readyState === 1) {
      order = await (OrderModel as any).findOne({
        $or: [{ _id: id }, { orderNumber: id }, { trackingNumber: id }],
      }).lean();
    }

    if (!order) {
      order = db.orders.find(o => o._id === id || o.orderNumber === id || o.trackingNumber === id);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Strict Authorization: Customer can ONLY view their own order
    if (order.userId !== req.user._id && req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({ success: false, message: 'Access denied to this order.' });
    }

    return res.json({
      success: true,
      order,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve order details.' });
  }
};

export const trackOrderPublic = async (req: AuthRequest, res: Response) => {
  try {
    const trackingQuery = (req.params.trackingNumber || req.params.id || '').trim();
    if (!trackingQuery) {
      return res.status(400).json({ success: false, message: 'Tracking or Order number is required.' });
    }

    let order: any = null;
    if (mongoose.connection.readyState === 1) {
      order = await (OrderModel as any).findOne({
        $or: [
          { orderNumber: trackingQuery },
          { trackingNumber: trackingQuery },
          { _id: trackingQuery },
        ],
      }).lean();
    }

    if (!order) {
      order = db.orders.find(
        o =>
          o.orderNumber.toLowerCase() === trackingQuery.toLowerCase() ||
          o.trackingNumber.toLowerCase() === trackingQuery.toLowerCase() ||
          o._id === trackingQuery
      );
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'No order found with that tracking reference.' });
    }

    return res.json({
      success: true,
      order,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to look up tracking details.' });
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { id } = req.params;
    const order = db.orders.find(o => o._id === id || o.orderNumber === id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.userId !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (['Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it is already ${order.orderStatus.toLowerCase()}.`,
      });
    }

    order.orderStatus = 'Cancelled';
    order.statusHistory.push({
      status: 'Cancelled',
      timestamp: new Date().toISOString(),
      note: 'Order cancelled by customer. Refund process initiated.',
    });

    // Restore inventory
    for (const item of order.items) {
      const product = db.products.find(p => p._id === item.productId);
      if (product) {
        product.stock += item.quantity;
        db.syncProductToMongo(product).catch(console.error);
      }
    }

    db.syncOrderToMongo(order).catch(console.error);

    // Trigger status update email
    emailService.sendOrderStatusUpdateEmail(order, 'Cancelled', 'Your order was cancelled as requested and any payment will be refunded within 24-48 hours.').catch(console.error);

    return res.json({
      success: true,
      message: 'Order cancelled successfully.',
      order,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to cancel order.' });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, note, paymentStatus, trackingNumber, carrier } = req.body;

    const order = db.orders.find(o => o._id === id || o.orderNumber === id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const previousStatus = order.orderStatus;

    if (status) {
      order.orderStatus = status;
      order.statusHistory.push({
        status,
        timestamp: new Date().toISOString(),
        note: note || `Status updated to ${status} by logistics manager.`,
      });
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    if (carrier) {
      order.carrier = carrier;
    }

    db.syncOrderToMongo(order).catch(console.error);

    // In-app notification to customer
    if (status && status !== previousStatus) {
      const updateNotif = {
        _id: `notif_${Date.now()}`,
        userId: order.userId,
        title: `Order Update: #${order.orderNumber}`,
        message: `Your order status has changed to "${status}".`,
        type: 'order' as const,
        link: `/orders/track?number=${order.orderNumber}`,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      db.notifications.unshift(updateNotif);
      db.syncNotificationToMongo(updateNotif).catch(console.error);

      // Dispatch Customer Order Status Update email
      emailService.sendOrderStatusUpdateEmail(order, status, note).catch(console.error);
    }

    return res.json({
      success: true,
      message: 'Order updated successfully.',
      order,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
};

export const testEmailConfig = async (req: AuthRequest, res: Response) => {
  try {
    const { testRecipient } = req.body || {};
    const result = await emailService.testSmtpConnection(testRecipient || req.user?.email);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: `Failed to test email configuration: ${err.message}`,
      error: err.message,
    });
  }
};

