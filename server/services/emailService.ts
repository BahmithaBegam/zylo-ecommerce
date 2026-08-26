import nodemailer from 'nodemailer';
import { config } from '../config/env.js';

export interface EmailTestResult {
  success: boolean;
  message: string;
  configured: boolean;
  host?: string;
  port?: number;
  user?: string;
  adminEmail?: string;
  error?: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  response?: string;
  envelope?: any;
  error?: string;
  target?: string;
  sender?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initTransporter();
  }

  public initTransporter() {
    const host = process.env.EMAIL_HOST || config.email.host || 'smtp.gmail.com';
    const port = Number(process.env.EMAIL_PORT || config.email.port || 587);
    const user = process.env.EMAIL_USER || config.email.user;
    const pass = process.env.EMAIL_PASSWORD || config.email.password;

    if (user && pass) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: {
            user,
            pass,
          },
          tls: {
            rejectUnauthorized: false,
          },
          connectionTimeout: 5000,
          greetingTimeout: 5000,
          socketTimeout: 8000,
        });
        this.isConfigured = true;
      } catch (err: any) {
        console.error('❌ Nodemailer initialization failed:', err.message);
        this.isConfigured = false;
        this.transporter = null;
      }
    } else {
      this.isConfigured = false;
      this.transporter = null;
    }
  }

  public async testSmtpConnection(testRecipient?: string): Promise<EmailTestResult> {
    this.initTransporter();

    const host = process.env.EMAIL_HOST || config.email.host || 'smtp.gmail.com';
    const port = Number(process.env.EMAIL_PORT || config.email.port || 587);
    const user = process.env.EMAIL_USER || config.email.user;
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || config.email.adminEmail || config.email.user;

    if (!this.isConfigured || !this.transporter) {
      return {
        success: false,
        configured: false,
        message: 'SMTP credentials missing in environment variables. Please provide EMAIL_USER and EMAIL_PASSWORD.',
        host,
        port,
        user,
        adminEmail,
      };
    }

    try {
      // 1. Verify connection
      await this.transporter.verify();

      // 2. Send test email using exact same configuration
      const target = testRecipient || adminEmail || user;
      if (target && user) {
        const info = await this.transporter.sendMail({
          from: `"Zylo Commerce" <${user}>`,
          to: target,
          subject: 'Zylo Store — SMTP Verification Test',
          text: 'This is a test email confirming that your Zylo SMTP email delivery system is functioning properly.',
          html: `
            <div style="font-family: sans-serif; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px; max-width: 500px;">
              <h2 style="color: #4f46e5; margin-top: 0;">Zylo Email Service Verified</h2>
              <p>Your SMTP mail configuration is online and successfully transmitting messages.</p>
              <p style="font-size: 12px; color: #6b7280;">Host: ${host}:${port} | Sender: ${user}</p>
            </div>
          `,
        });
        console.log(`✅ [SMTP TEST DELIVERED] MessageId: ${info.messageId} | Response: ${info.response}`);
      }

      return {
        success: true,
        configured: true,
        message: `SMTP connection verified and test message sent successfully to ${target}.`,
        host,
        port,
        user,
        adminEmail,
      };
    } catch (err: any) {
      console.error('❌ SMTP Verification Error:', err);
      return {
        success: false,
        configured: true,
        message: `SMTP verification failed: ${err.message}`,
        error: err.message,
        host,
        port,
        user,
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
    this.initTransporter();

    const user = process.env.EMAIL_USER || config.email.user;
    if (!user) {
      console.warn('⚠️ [SMTP EMAIL SKIPPED] No EMAIL_USER found in environment.');
      return { success: false, error: 'EMAIL_USER not configured', target: to };
    }

    const fromAddress = `"Zylo Commerce" <${user}>`;

    if (this.isConfigured && this.transporter) {
      try {
        const mailOptions: nodemailer.SendMailOptions = {
          from: fromAddress,
          to,
          subject,
          text: text || subject,
          html,
          replyTo: options?.replyTo || user,
        };

        const info = await this.transporter.sendMail(mailOptions);
        const envelopeRecipient = Array.isArray(info.envelope?.to)
          ? info.envelope.to.join(', ')
          : (info.envelope?.to || to);

        if (options?.isOrderNotification) {
          console.log(`
==================================================
ORDER EMAIL DELIVERY DEBUG
Recipient: ${to}
Sender: ${user}
Envelope recipient: ${envelopeRecipient}
SMTP response: ${info.response || '250 OK'}
Message ID: ${info.messageId}
==================================================
`);
        } else {
          console.log(`✅ [REAL EMAIL SENT] MessageId: ${info.messageId} | To: ${to} | Subject: "${subject}"`);
        }

        return {
          success: true,
          messageId: info.messageId,
          response: info.response,
          envelope: info.envelope,
          target: to,
          sender: user,
        };
      } catch (error: any) {
        console.error(`❌ [SMTP DELIVERY FAILED] Could not send email to ${to}:`, error.message);
        return {
          success: false,
          error: error.message,
          target: to,
          sender: user,
        };
      }
    } else {
      // Fallback logging if SMTP is not active
      console.log(`\n==================================================`);
      console.log(`📨 [ORDER NOTIFICATION DISPATCH - CONSOLE FALLBACK]`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Date: ${new Date().toISOString()}`);
      console.log(`--------------------------------------------------`);
      console.log(text || 'HTML Template rendered (see customer/admin template)');
      console.log(`==================================================\n`);
      return { success: false, error: 'SMTP credentials not configured in environment', target: to, sender: user };
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

      const itemsText = order.items
        .map((item: any) => `- ${item.name} x ${item.quantity} - ₹${(item.price * item.quantity).toLocaleString('en-IN')}`)
        .join('\n');

      const plainText = `NEW ORDER RECEIVED - ZYLO
----------------------------------------
Order Number: #${order.orderNumber}
Customer Name: ${order.userName}
Customer Email: ${order.userEmail}
Customer Phone: ${order.shippingAddress.phone || 'N/A'}

Products:
${itemsText}

Subtotal: ₹${order.subtotal.toLocaleString('en-IN')}
Discount: ₹${order.discount.toLocaleString('en-IN')}
Delivery: ${order.shipping === 0 ? 'FREE' : `₹${order.shipping.toLocaleString('en-IN')}`}
Total Amount: ₹${order.total.toLocaleString('en-IN')}
Payment Method: ${order.paymentMethod.toUpperCase()} (${order.paymentStatus.toUpperCase()})

Shipping Address:
${order.shippingAddress.fullName}
${order.shippingAddress.addressLine1}${order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}
${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}
${order.shippingAddress.country}

Order Date: ${new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
----------------------------------------`;

      const itemsHtml = order.items
        .map(
          (item: any) => `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
              <strong>${item.name}</strong><br/>
              <span style="font-size: 12px; color: #6b7280;">Color: ${item.selectedColor || 'Standard'} | Size: ${item.selectedSize || 'Standard'} | SKU: ${item.sku || 'N/A'}</span>
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${item.price.toLocaleString('en-IN')}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
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
            <tr><td style="padding: 4px 0; color: #6b7280; width: 140px;">Customer Name:</td><td style="font-weight: 600;">${order.userName}</td></tr>
            <tr><td style="padding: 4px 0; color: #6b7280;">Email Address:</td><td>${order.userEmail}</td></tr>
            <tr><td style="padding: 4px 0; color: #6b7280;">Phone Number:</td><td>${order.shippingAddress.phone || 'Not provided'}</td></tr>
          </table>

          <h2 style="font-size: 16px; margin: 0 0 12px 0; color: #374151; text-transform: uppercase; letter-spacing: 0.5px;">Order Details</h2>
          <table style="width: 100%; margin-bottom: 24px; font-size: 14px;">
            <tr><td style="padding: 4px 0; color: #6b7280; width: 140px;">Order ID:</td><td style="font-weight: 700; color: #4f46e5;">#${order.orderNumber}</td></tr>
            <tr><td style="padding: 4px 0; color: #6b7280;">Order Date:</td><td>${new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td></tr>
            <tr><td style="padding: 4px 0; color: #6b7280;">Payment Method:</td><td style="text-transform: uppercase; font-weight: 600;">${order.paymentMethod}</td></tr>
            <tr><td style="padding: 4px 0; color: #6b7280;">Payment Status:</td><td><span style="background: ${order.paymentStatus === 'paid' ? '#dcfce7; color: #15803d' : '#fef9c3; color: #a16207'}; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 12px; text-transform: uppercase;">${order.paymentStatus}</span></td></tr>
            <tr><td style="padding: 4px 0; color: #6b7280;">Order Status:</td><td><span style="background: #e0e7ff; color: #4338ca; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 12px;">${order.orderStatus}</span></td></tr>
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
              <tr><td style="padding: 4px 0; color: #6b7280;">Subtotal:</td><td style="text-align: right;">₹${order.subtotal.toLocaleString('en-IN')}</td></tr>
              ${order.discount > 0 ? `<tr><td style="padding: 4px 0; color: #16a34a;">Discount Applied:</td><td style="text-align: right; color: #16a34a;">-₹${order.discount.toLocaleString('en-IN')}</td></tr>` : ''}
              <tr><td style="padding: 4px 0; color: #6b7280;">Shipping:</td><td style="text-align: right;">${order.shipping === 0 ? 'FREE' : `₹${order.shipping.toLocaleString('en-IN')}`}</td></tr>
              <tr><td style="padding: 4px 0; color: #6b7280;">Estimated Tax (GST):</td><td style="text-align: right;">₹${order.tax.toLocaleString('en-IN')}</td></tr>
              <tr style="border-top: 2px solid #e5e7eb; font-size: 16px; font-weight: 800;">
                <td style="padding: 8px 0 0 0; color: #111827;">Grand Total:</td>
                <td style="padding: 8px 0 0 0; text-align: right; color: #4f46e5;">₹${order.total.toLocaleString('en-IN')}</td>
              </tr>
            </table>
          </div>

          <h2 style="font-size: 16px; margin: 0 0 12px 0; color: #374151; text-transform: uppercase; letter-spacing: 0.5px;">Shipping Destination</h2>
          <div style="background: #ffffff; border: 1px solid #e5e7eb; padding: 16px; border-radius: 8px; font-size: 14px; line-height: 1.6;">
            <strong>${order.shippingAddress.fullName}</strong><br/>
            ${order.shippingAddress.addressLine1}<br/>
            ${order.shippingAddress.addressLine2 ? `${order.shippingAddress.addressLine2}<br/>` : ''}
            ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}<br/>
            ${order.shippingAddress.country}<br/>
            <strong>Phone:</strong> ${order.shippingAddress.phone}
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

      const itemsHtml = order.items
        .map(
          (item: any) => `
          <div style="display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
            <div style="flex: 1;">
              <strong style="font-size: 14px; color: #111827;">${item.name}</strong>
              <div style="font-size: 12px; color: #6b7280; margin-top: 2px;">
                Qty: ${item.quantity} | Size: ${item.selectedSize || 'Standard'} | Color: ${item.selectedColor || 'Standard'}
              </div>
            </div>
            <div style="font-weight: 700; font-size: 14px; color: #111827;">
              ₹${(item.price * item.quantity).toLocaleString('en-IN')}
            </div>
          </div>`
        )
        .join('');

      const plainText = `Hi ${order.userName},

Thank you for your order on Zylo! We are preparing your items for dispatch.

Order Number: #${order.orderNumber}
Order Date: ${new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
Estimated Delivery: ${order.estimatedDeliveryDate || '3-4 Business Days'}

Total Amount: ₹${order.total.toLocaleString('en-IN')}
Payment Method: ${order.paymentMethod.toUpperCase()}

Delivery Address:
${order.shippingAddress.fullName}
${order.shippingAddress.addressLine1}
${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}

You can track your order here: ${trackingUrl}

Best regards,
The Zylo Team`;

      const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden; color: #111827;">
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px; color: #ffffff; text-align: center;">
          <div style="font-size: 28px; font-weight: 900; letter-spacing: -1px; margin-bottom: 4px;">Zylo</div>
          <h1 style="margin: 0; font-size: 20px; font-weight: 700;">Thank you for your order, ${order.userName}!</h1>
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
              <span>₹${order.subtotal.toLocaleString('en-IN')}</span>
            </div>
            ${
              order.discount > 0
                ? `
            <div style="display: flex; justify-content: space-between; font-size: 13px; color: #16a34a; margin-bottom: 6px;">
              <span>Discount:</span>
              <span>-₹${order.discount.toLocaleString('en-IN')}</span>
            </div>`
                : ''
            }
            <div style="display: flex; justify-content: space-between; font-size: 13px; color: #6b7280; margin-bottom: 6px;">
              <span>Delivery Fee:</span>
              <span>${order.shipping === 0 ? 'FREE' : `₹${order.shipping.toLocaleString('en-IN')}`}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 13px; color: #6b7280; margin-bottom: 10px;">
              <span>Tax (GST):</span>
              <span>₹${order.tax.toLocaleString('en-IN')}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 800; color: #111827; padding-top: 10px; border-top: 1px solid #e5e7eb;">
              <span>Total Paid:</span>
              <span style="color: #4f46e5;">₹${order.total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <h3 style="font-size: 15px; font-weight: 700; margin: 0 0 8px 0; color: #1e293b;">Delivery Address</h3>
          <p style="font-size: 13px; color: #4b5563; line-height: 1.5; margin: 0 0 24px 0; background: #ffffff; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px;">
            ${order.shippingAddress.fullName}<br/>
            ${order.shippingAddress.addressLine1}${order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}<br/>
            ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}<br/>
            Phone: ${order.shippingAddress.phone}
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
