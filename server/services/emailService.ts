import { Resend } from 'resend';
import { config } from '../config/env.js';

export interface EmailTestResult {
  success: boolean;
  message: string;
  configured: boolean;
  provider?: string;
  host?: string;
  port?: number;
  user?: string;
  adminEmail?: string;
  error?: string;
}

export interface EmailSendResult {
  success: boolean;
  provider?: string;
  messageId?: string;
  response?: string;
  envelope?: any;
  error?: string;
  target?: string;
  sender?: string;
}

class EmailService {
  private resend: Resend | null = null;
  private readonly defaultSender = 'Zylo Store <onboarding@resend.dev>';

  private getClient(): Resend | null {
    const apiKey = process.env.RESEND_API_KEY || config.resendApiKey;
    if (!apiKey) {
      return null;
    }
    if (!this.resend) {
      this.resend = new Resend(apiKey);
    }
    return this.resend;
  }

  public async testSmtpConnection(testRecipient?: string): Promise<EmailTestResult> {
    const apiKey = process.env.RESEND_API_KEY || config.resendApiKey;
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || config.email.adminEmail || 'bahmithabegam@gmail.com';
    const target = (testRecipient || adminEmail || 'test@example.com').trim();

    if (!apiKey) {
      return {
        success: false,
        configured: false,
        provider: 'Resend API',
        message: 'RESEND_API_KEY is not configured in environment variables.',
        user: this.defaultSender,
        adminEmail,
      };
    }

    try {
      const resendClient = this.getClient();
      if (!resendClient) {
        throw new Error('Failed to initialize Resend client.');
      }

      const { data, error } = await resendClient.emails.send({
        from: this.defaultSender,
        to: [target],
        subject: 'Zylo Store — Resend API Verification Test',
        text: 'This is a test email confirming that your Zylo Resend API email delivery system is functioning properly.',
        html: `
          <div style="font-family: sans-serif; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px; max-width: 500px;">
            <h2 style="color: #4f46e5; margin-top: 0;">Zylo Email Service Verified</h2>
            <p>Your Resend API email configuration is online and successfully transmitting messages over HTTPS (Port 443).</p>
            <p style="font-size: 12px; color: #6b7280;">Provider: Resend API | Sender: ${this.defaultSender}</p>
          </div>
        `,
      });

      if (error) {
        console.error('❌ Resend Verification Error:', error);
        return {
          success: false,
          configured: true,
          provider: 'Resend API',
          message: `Resend verification failed: ${error.message}`,
          error: error.message,
          user: this.defaultSender,
          adminEmail,
        };
      }

      console.log(`✅ [RESEND TEST DELIVERED] MessageId: ${data?.id}`);
      return {
        success: true,
        configured: true,
        provider: 'Resend API',
        message: `Resend API connection verified and test message sent successfully to ${target}.`,
        user: this.defaultSender,
        adminEmail,
      };
    } catch (err: any) {
      console.error('❌ Resend Verification Error:', err);
      return {
        success: false,
        configured: true,
        provider: 'Resend API',
        message: `Resend verification failed: ${err.message}`,
        error: err.message,
        user: this.defaultSender,
        adminEmail,
      };
    }
  }

  public async sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string,
    options?: { replyTo?: string; isOrderNotification?: boolean }
  ): Promise<EmailSendResult> {
    const apiKey = process.env.RESEND_API_KEY || config.resendApiKey;
    const targetEmail = to.trim();

    if (!apiKey) {
      console.warn(`⚠️ [EMAIL SKIPPED] RESEND_API_KEY not configured. Simulated delivery to: ${targetEmail}`);
      return { success: false, error: 'RESEND_API_KEY not configured', target: targetEmail };
    }

    const resendClient = this.getClient();
    if (!resendClient) {
      return { success: false, error: 'Resend client initialization failed', target: targetEmail, sender: this.defaultSender };
    }

    try {
      const { data, error } = await resendClient.emails.send({
        from: this.defaultSender,
        to: [targetEmail],
        subject,
        text: text || subject,
        html,
        reply_to: options?.replyTo || process.env.ADMIN_EMAIL || undefined,
      });

      if (error) {
        console.error(`❌ [RESEND DELIVERY FAILED] Could not send email to ${targetEmail}:`, error.message);
        return {
          success: false,
          provider: 'resend',
          error: error.message,
          target: targetEmail,
          sender: this.defaultSender,
        };
      }

      console.log(`✅ [RESEND DELIVERY SUCCESS] To: ${targetEmail} | Subject: "${subject}" | MessageId: ${data?.id}`);

      return {
        success: true,
        provider: 'resend',
        messageId: data?.id,
        target: targetEmail,
        sender: this.defaultSender,
      };
    } catch (error: any) {
      console.error(`❌ [RESEND DELIVERY FAILED] Could not send email to ${targetEmail}:`, error.message);
      return {
        success: false,
        provider: 'resend',
        error: error.message,
        target: targetEmail,
        sender: this.defaultSender,
      };
    }
  }

  // 1. Admin Order Notification Email
  public async sendAdminNewOrderEmail(order: any): Promise<EmailSendResult> {
    try {
      const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || config.email.adminEmail || config.email.user;
      if (!adminEmail) {
        console.warn(`⚠️ [ADMIN EMAIL SKIPPED] No ADMIN_EMAIL found for order #${order.orderNumber}`);
        return { success: false, error: 'Admin email address not configured' };
      }

      const subject = `Zylo Store — New Order Received #${order.orderNumber}`;
      console.log(`📧 [DISPATCHING ADMIN EMAIL] Target: ${adminEmail} for Order #${order.orderNumber}`);

      const formatCurrency = (val: any) => (Number(val) || 0).toLocaleString('en-IN');
      const orderDateStr = order.createdAt
        ? new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

      const itemsText = (order.items || [])
        .map((item: any) => `- ${item.name} x ${item.quantity || 1} - ₹${formatCurrency((item.price || 0) * (item.quantity || 1))}`)
        .join('\n');

      const plainText = `NEW ORDER RECEIVED - ZYLO
----------------------------------------
Order Number: #${order.orderNumber}
Customer Name: ${order.userName || 'Customer'}
Customer Email: ${order.userEmail}
Customer Phone: ${order.shippingAddress?.phone || 'N/A'}

Products:
${itemsText}

Subtotal: ₹${formatCurrency(order.subtotal)}
Discount: ₹${formatCurrency(order.discount)}
Delivery: ${order.shipping === 0 ? 'FREE' : `₹${formatCurrency(order.shipping)}`}
Total Amount: ₹${formatCurrency(order.total)}
Payment Method: ${(order.paymentMethod || 'COD').toUpperCase()} (${(order.paymentStatus || 'PENDING').toUpperCase()})

Shipping Address:
${order.shippingAddress?.fullName || order.userName || 'Customer'}
${order.shippingAddress?.addressLine1 || ''}${order.shippingAddress?.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}
${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.postalCode || ''}
${order.shippingAddress?.country || 'India'}

Order Date: ${orderDateStr}
----------------------------------------`;

      const itemsHtml = (order.items || [])
        .map(
          (item: any) => `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
              <strong>${item.name}</strong><br/>
              <span style="font-size: 12px; color: #6b7280;">Color: ${item.selectedColor || 'Standard'} | Size: ${item.selectedSize || 'Standard'} | SKU: ${item.sku || 'N/A'}</span>
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity || 1}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${formatCurrency(item.price)}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">₹${formatCurrency((item.price || 0) * (item.quantity || 1))}</td>
          </tr>`
        )
        .join('');

      const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; color: #111827;">
        <div style="background: #4f46e5; padding: 24px 32px; color: #ffffff;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">Zylo Business Portal</h1>
          <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px;">New Customer Order Notification</p>
        </div>

        <div style="padding: 32px;">
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <p style="margin: 0; color: #166534; font-weight: 600; font-size: 15px;">
              🎉 A new customer order has been placed on Zylo!
            </p>
          </div>

          <h2 style="font-size: 16px; margin: 0 0 12px 0; color: #374151; text-transform: uppercase; letter-spacing: 0.5px;">Customer Details</h2>
          <table style="width: 100%; margin-bottom: 24px; font-size: 14px;">
            <tr><td style="padding: 4px 0; color: #6b7280; width: 140px;">Customer Name:</td><td style="font-weight: 600;">${order.userName || 'Customer'}</td></tr>
            <tr><td style="padding: 4px 0; color: #6b7280;">Email Address:</td><td>${order.userEmail}</td></tr>
            <tr><td style="padding: 4px 0; color: #6b7280;">Phone Number:</td><td>${order.shippingAddress?.phone || 'Not provided'}</td></tr>
          </table>

          <h2 style="font-size: 16px; margin: 0 0 12px 0; color: #374151; text-transform: uppercase; letter-spacing: 0.5px;">Order Details</h2>
          <table style="width: 100%; margin-bottom: 24px; font-size: 14px;">
            <tr><td style="padding: 4px 0; color: #6b7280; width: 140px;">Order ID:</td><td style="font-weight: 700; color: #4f46e5;">#${order.orderNumber}</td></tr>
            <tr><td style="padding: 4px 0; color: #6b7280;">Order Date:</td><td>${orderDateStr}</td></tr>
            <tr><td style="padding: 4px 0; color: #6b7280;">Payment Method:</td><td style="text-transform: uppercase; font-weight: 600;">${order.paymentMethod || 'COD'}</td></tr>
            <tr><td style="padding: 4px 0; color: #6b7280;">Payment Status:</td><td><span style="background: ${order.paymentStatus === 'paid' ? '#dcfce7; color: #15803d' : '#fef9c3; color: #a16207'}; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 12px; text-transform: uppercase;">${order.paymentStatus || 'pending'}</span></td></tr>
            <tr><td style="padding: 4px 0; color: #6b7280;">Order Status:</td><td><span style="background: #e0e7ff; color: #4338ca; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 12px;">${order.orderStatus || 'Confirmed'}</span></td></tr>
          </table>

          <h2 style="font-size: 16px; margin: 0 0 12px 0; color: #374151; text-transform: uppercase; letter-spacing: 0.5px;">Ordered Items</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
            <thead>
              <tr style="background: #f9fafb; text-align: left;">
                <th style="padding: 10px; border-bottom: 2px solid #e5e7eb;">Product</th>
                <th style="padding: 10px; border-bottom: 2px solid #e5e7eb; text-align: center;">Qty</th>
                <th style="padding: 10px; border-bottom: 2px solid #e5e7eb; text-align: right;">Unit Price</th>
                <th style="padding: 10px; border-bottom: 2px solid #e5e7eb; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <table style="width: 100%; font-size: 14px;">
              <tr><td style="padding: 4px 0; color: #6b7280;">Subtotal:</td><td style="text-align: right;">₹${formatCurrency(order.subtotal)}</td></tr>
              ${order.discount > 0 ? `<tr><td style="padding: 4px 0; color: #16a34a;">Discount Applied:</td><td style="text-align: right; color: #16a34a;">-₹${formatCurrency(order.discount)}</td></tr>` : ''}
              <tr><td style="padding: 4px 0; color: #6b7280;">Shipping:</td><td style="text-align: right;">${order.shipping === 0 ? 'FREE' : `₹${formatCurrency(order.shipping)}`}</td></tr>
              <tr><td style="padding: 4px 0; color: #6b7280;">Estimated Tax (GST):</td><td style="text-align: right;">₹${formatCurrency(order.tax)}</td></tr>
              <tr style="border-top: 2px solid #e5e7eb; font-size: 16px; font-weight: 800;">
                <td style="padding: 8px 0 0 0; color: #111827;">Grand Total:</td>
                <td style="padding: 8px 0 0 0; text-align: right; color: #4f46e5;">₹${formatCurrency(order.total)}</td>
              </tr>
            </table>
          </div>

          <h2 style="font-size: 16px; margin: 0 0 12px 0; color: #374151; text-transform: uppercase; letter-spacing: 0.5px;">Shipping Destination</h2>
          <div style="background: #ffffff; border: 1px solid #e5e7eb; padding: 16px; border-radius: 8px; font-size: 14px; line-height: 1.6;">
            <strong>${order.shippingAddress?.fullName || order.userName || 'Customer'}</strong><br/>
            ${order.shippingAddress?.addressLine1 || ''}<br/>
            ${order.shippingAddress?.addressLine2 ? `${order.shippingAddress.addressLine2}<br/>` : ''}
            ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.postalCode || ''}<br/>
            ${order.shippingAddress?.country || 'India'}<br/>
            <strong>Phone:</strong> ${order.shippingAddress?.phone || 'Not provided'}
          </div>
        </div>

        <div style="background: #f9fafb; padding: 16px 32px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280;">
          Zylo Store Administration • Automated Notification Engine
        </div>
      </div>`;

      const result = await this.sendEmail(adminEmail, subject, html, plainText, {
        replyTo: order.userEmail || (process.env.EMAIL_USER || config.email.user),
        isOrderNotification: true,
      });
      return result;
    } catch (error: any) {
      console.error('⚠️ Admin order email error caught safely:', error.message);
      return { success: false, error: error.message };
    }
  }

  // 2. Customer Order Confirmation Email
  public async sendCustomerOrderConfirmationEmail(order: any): Promise<EmailSendResult> {
    try {
      const customerEmail = order.userEmail || order.shippingAddress?.email;
      if (!customerEmail) {
        console.warn(`⚠️ [CUSTOMER EMAIL SKIPPED] No userEmail found for order #${order.orderNumber}`);
        return { success: false, error: 'Customer email address is missing' };
      }

      console.log(`📧 [DISPATCHING CUSTOMER EMAIL] Target: ${customerEmail} for Order #${order.orderNumber}`);
      const subject = `Your Order Has Been Confirmed — #${order.orderNumber}`;
      const trackingUrl = config.clientUrl
        ? `${config.clientUrl}/orders/track?number=${order.orderNumber}`
        : `/orders/track?number=${order.orderNumber}`;

      const formatCurrency = (val: any) => (Number(val) || 0).toLocaleString('en-IN');
      const orderDateStr = order.createdAt
        ? new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

      const itemsHtml = (order.items || [])
        .map(
          (item: any) => `
          <div style="display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
            <div style="flex: 1;">
              <strong style="font-size: 14px; color: #111827;">${item.name}</strong>
              <div style="font-size: 12px; color: #6b7280; margin-top: 2px;">
                Qty: ${item.quantity || 1} | Size: ${item.selectedSize || 'Standard'} | Color: ${item.selectedColor || 'Standard'}
              </div>
            </div>
            <div style="font-weight: 700; font-size: 14px; color: #111827;">
              ₹${formatCurrency((item.price || 0) * (item.quantity || 1))}
            </div>
          </div>`
        )
        .join('');

      const plainText = `Hi ${order.userName || 'Customer'},

Thank you for your order on Zylo! We are preparing your items for dispatch.

Order Number: #${order.orderNumber}
Order Date: ${orderDateStr}
Estimated Delivery: ${order.estimatedDeliveryDate || '3-4 Business Days'}

Total Amount: ₹${formatCurrency(order.total)}
Payment Method: ${(order.paymentMethod || 'COD').toUpperCase()}

Delivery Address:
${order.shippingAddress?.fullName || order.userName || 'Customer'}
${order.shippingAddress?.addressLine1 || ''}
${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.postalCode || ''}

You can track your order here: ${trackingUrl}

Best regards,
The Zylo Team`;

      const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden; color: #111827;">
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px; color: #ffffff; text-align: center;">
          <div style="font-size: 28px; font-weight: 900; letter-spacing: -1px; margin-bottom: 4px;">Zylo</div>
          <h1 style="margin: 0; font-size: 20px; font-weight: 700;">Thank you for your order, ${order.userName || 'Customer'}!</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">We're preparing your items with master care.</p>
        </div>

        <div style="padding: 32px;">
          <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
            <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Order Reference</div>
            <div style="font-size: 20px; font-weight: 800; color: #4f46e5; margin: 4px 0 12px 0;">#${order.orderNumber}</div>
            
            <div style="display: flex; justify-content: space-between; font-size: 13px; color: #475569; padding-top: 12px; border-top: 1px dashed #cbd5e1;">
              <div><strong>Estimated Delivery:</strong> ${order.estimatedDeliveryDate || '3-4 Business Days'}</div>
              <div><strong>Carrier:</strong> ${order.carrier || 'Zylo Express'}</div>
            </div>
          </div>

          <h3 style="font-size: 15px; font-weight: 700; margin: 0 0 8px 0; color: #1e293b;">Items in this order</h3>
          <div style="margin-bottom: 24px;">
            ${itemsHtml}
          </div>

          <div style="background: #f9fafb; padding: 16px; border-radius: 12px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; font-size: 13px; color: #6b7280; margin-bottom: 6px;">
              <span>Subtotal:</span>
              <span>₹${formatCurrency(order.subtotal)}</span>
            </div>
            ${
              order.discount > 0
                ? `
            <div style="display: flex; justify-content: space-between; font-size: 13px; color: #16a34a; margin-bottom: 6px;">
              <span>Discount:</span>
              <span>-₹${formatCurrency(order.discount)}</span>
            </div>`
                : ''
            }
            <div style="display: flex; justify-content: space-between; font-size: 13px; color: #6b7280; margin-bottom: 6px;">
              <span>Delivery Fee:</span>
              <span>${order.shipping === 0 ? 'FREE' : `₹${formatCurrency(order.shipping)}`}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 13px; color: #6b7280; margin-bottom: 10px;">
              <span>Tax (GST):</span>
              <span>₹${formatCurrency(order.tax)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 800; color: #111827; padding-top: 10px; border-top: 1px solid #e5e7eb;">
              <span>Total Paid:</span>
              <span style="color: #4f46e5;">₹${formatCurrency(order.total)}</span>
            </div>
          </div>

          <h3 style="font-size: 15px; font-weight: 700; margin: 0 0 8px 0; color: #1e293b;">Delivery Address</h3>
          <p style="font-size: 13px; color: #4b5563; line-height: 1.5; margin: 0 0 24px 0; background: #ffffff; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px;">
            ${order.shippingAddress?.fullName || order.userName || 'Customer'}<br/>
            ${order.shippingAddress?.addressLine1 || ''}${order.shippingAddress?.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}<br/>
            ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} ${order.shippingAddress?.postalCode || ''}<br/>
            Phone: ${order.shippingAddress?.phone || 'Not provided'}
          </p>

          <div style="text-align: center; margin: 32px 0 16px 0;">
            <a href="${trackingUrl}" style="display: inline-block; background: #4f46e5; color: #ffffff; padding: 14px 28px; border-radius: 10px; font-weight: 700; text-decoration: none; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">
              Live Track Your Order
            </a>
          </div>
        </div>

        <div style="background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
          Need assistance with this order? Contact our 24/7 Priority Support at <a href="mailto:support@zylo.com" style="color: #4f46e5;">support@zylo.com</a>
        </div>
      </div>`;

      const result = await this.sendEmail(customerEmail, subject, html, plainText, {
        replyTo: process.env.ADMIN_EMAIL || process.env.EMAIL_USER || config.email.adminEmail,
        isOrderNotification: true,
      });
      return result;
    } catch (error: any) {
      console.error('⚠️ Customer order email error caught safely:', error.message);
      return { success: false, error: error.message };
    }
  }

  // 3. Order Status Update Email
  public async sendOrderStatusUpdateEmail(order: any, newStatus: string, note?: string): Promise<void> {
    try {
      const subject = `Order #${order.orderNumber} Status Update: ${newStatus}`;
      const trackingUrl = config.clientUrl
        ? `${config.clientUrl}/orders/track?number=${order.orderNumber}`
        : `/orders/track?number=${order.orderNumber}`;

      const statusColors: Record<string, string> = {
        Confirmed: '#2563eb',
        Processing: '#7c3aed',
        Shipped: '#0284c7',
        'Out for Delivery': '#d97706',
        Delivered: '#16a34a',
        Cancelled: '#dc2626',
      };

      const badgeColor = statusColors[newStatus] || '#4f46e5';

      const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden; color: #111827;">
        <div style="background: #1e1b4b; padding: 28px; color: #ffffff; text-align: center;">
          <div style="font-size: 24px; font-weight: 900; letter-spacing: -1px; margin-bottom: 4px;">Zylo</div>
          <h2 style="margin: 0; font-size: 18px; font-weight: 700;">Order Status Update</h2>
        </div>

        <div style="padding: 32px;">
          <p style="font-size: 15px; color: #374151; margin: 0 0 20px 0;">
            Hello <strong>${order.userName}</strong>, here is an update regarding your recent order <strong>#${order.orderNumber}</strong>:
          </p>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Current Status</div>
            <span style="display: inline-block; background: ${badgeColor}; color: #ffffff; font-size: 16px; font-weight: 800; padding: 6px 18px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">
              ${newStatus}
            </span>
            ${note ? `<p style="margin: 14px 0 0 0; font-size: 13px; color: #475569; font-style: italic;">"${note}"</p>` : ''}
          </div>

          ${
            order.trackingNumber
              ? `
          <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; font-size: 13px; color: #334155; margin-bottom: 24px;">
            <strong>Tracking ID:</strong> ${order.trackingNumber}<br/>
            <strong>Logistics Partner:</strong> ${order.carrier || 'FedEx Express Courier'}<br/>
            <strong>Estimated Delivery:</strong> ${order.estimatedDeliveryDate || 'Within 2-3 Days'}
          </div>`
              : ''
          }

          <div style="text-align: center; margin: 24px 0;">
            <a href="${trackingUrl}" style="display: inline-block; background: #4f46e5; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 13px;">
              View Order Tracking
            </a>
          </div>
        </div>

        <div style="background: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
          Zylo Store • Customer Fulfillment System
        </div>
      </div>`;

      await this.sendEmail(order.userEmail, subject, html);
    } catch (error: any) {
      console.error('⚠️ Order status update email error caught safely:', error.message);
    }
  }

  // 4. Password Reset Email
  public async sendPasswordResetEmail(email: string, userName: string, resetToken: string): Promise<void> {
    try {
      const resetUrl = config.clientUrl
        ? `${config.clientUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`
        : `/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
      const subject = `Reset Your Zylo Account Password`;

      const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden; color: #111827;">
        <div style="background: #4f46e5; padding: 24px 32px; color: #ffffff;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800;">Zylo Account Security</h1>
        </div>

        <div style="padding: 32px;">
          <h2 style="font-size: 18px; margin: 0 0 12px 0;">Password Reset Request</h2>
          <p style="font-size: 14px; color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
            Hello ${userName}, we received a request to reset the password for your Zylo account associated with <strong>${email}</strong>.
          </p>
          <p style="font-size: 14px; color: #4b5563; line-height: 1.6; margin: 0 0 24px 0;">
            Click the button below to choose a new password. This security link is valid for <strong>1 hour</strong>.
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" style="display: inline-block; background: #4f46e5; color: #ffffff; padding: 14px 28px; border-radius: 10px; font-weight: 700; text-decoration: none; font-size: 14px;">
              Reset My Password
            </a>
          </div>

          <p style="font-size: 12px; color: #9ca3af; line-height: 1.5; margin: 24px 0 0 0;">
            If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
          </p>
        </div>

        <div style="background: #f9fafb; padding: 16px 32px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280;">
          Zylo Store Security Team
        </div>
      </div>`;

      await this.sendEmail(email, subject, html);
    } catch (error: any) {
      console.error('⚠️ Password reset email error caught safely:', error.message);
    }
  }
}

export const emailService = new EmailService();
