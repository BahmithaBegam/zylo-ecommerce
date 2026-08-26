import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: 3000,
  mongoUri: process.env.MONGO_URI || '',
  jwtSecret: process.env.JWT_SECRET || 'zylo_super_secure_jwt_secret_2026',
  resendApiKey: (process.env.RESEND_API_KEY || '').trim(),
  get email() {
    const rawUser = process.env.EMAIL_USER || process.env.GMAIL_USER || process.env.EMAIL_USERNAME || '';
    const rawPass = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD || '';
    const rawHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const rawPort = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 587;
    const rawAdmin = process.env.ADMIN_EMAIL || rawUser || '';

    return {
      host: rawHost.trim(),
      port: rawPort,
      user: rawUser.trim(),
      password: rawPass.replace(/\s+/g, ''), // Strip any spaces from 16-character Google App Passwords
      adminEmail: rawAdmin.trim(),
    };
  },
  clientUrl: process.env.CLIENT_URL || '',
  serverUrl: process.env.SERVER_URL || '',
  paymentSecretKey: process.env.PAYMENT_SECRET_KEY || '',
};
