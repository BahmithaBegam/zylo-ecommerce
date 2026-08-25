# Zylo - Modern E-Commerce Platform

A high-performance full-stack e-commerce application built with React 19, Vite, Tailwind CSS, Express, and MongoDB.

## Features

- **Product Catalog & Collections**: Sarees, Kurtas, Western Wear, Kidswear, Toys, and Accessories with rich filtering, search, and sorting.
- **Cart & Seamless Checkout**: Multi-step checkout, real-time GST calculation, coupon codes, and payment options (UPI, Cards, Net Banking, COD).
- **Persistent Wishlist**: Multi-device MongoDB synchronized wishlist with real-time UI status updates and instant "Move All to Cart".
- **My Orders & Tracking**: Visual timeline tracking (BlueDart / Express), itemized invoices, soft-delete order history, and reordering.
- **Admin Dashboard**: Real-time sales analytics, inventory management, order status pipeline controls, and customer insights.
- **Email Notifications**: Automated HTML order confirmation and status update emails.

---

## Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn or bun

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## Pushing to GitHub

If you exported the project ZIP from Google AI Studio:

```bash
# 1. Initialize git in the project root
git init

# 2. Add all files
git add .

# 3. Commit
git commit -m "Initial commit of Zylo E-Commerce"

# 4. Link your remote repository and push
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```
