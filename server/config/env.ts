import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: 3000,
  mongoUri: process.env.MONGO_URI || '',
  jwtSecret: process.env.JWT_SECRET || 'zylo_super_secure_jwt_secret_2026',
  get email() {
    return {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      user: process.env.EMAIL_USER || '',
      password: process.env.EMAIL_PASSWORD || '',
      adminEmail: process.env.ADMIN_EMAIL || process.env.EMAIL_USER || '',
    };
  },
  clientUrl: process.env.CLIENT_URL || '',
  serverUrl: process.env.SERVER_URL || '',
  paymentSecretKey: process.env.PAYMENT_SECRET_KEY || '',
};
