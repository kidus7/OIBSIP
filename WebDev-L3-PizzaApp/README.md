# WebDev-L3-PizzaApp: SliceMasters Progressive Web App (PWA)

**Developer:** Kidus Anteneh  
**Program:** Oasis Infobyte Web Development Internship (Level 3)  
**Timeline:** August 5, 2026 – September 15, 2026  

---

## 📌 Project Overview

**SliceMasters PizzaApp** is a high-fidelity, production-grade MERN-stack (MongoDB, Express.js, React 18, Node.js) pizza ordering and delivery management ecosystem. Designed with a mobile-first philosophy, the application integrates Progressive Web App (PWA) capabilities, real-time WebSocket communication via [`Socket.io`](WebDev-L3-PizzaApp/server/server.js:1), secure payment processing with Razorpay, robust multi-role authentication (Customer, Driver, Admin), 6-digit delivery PIN verification, and automated background inventory monitoring using [`node-cron`](WebDev-L3-PizzaApp/server/utils/stockChecker.js:1).

---

## 🚀 Core Features Breakdown

### 🍕 Client Portal
- **Custom Pizza Builder**: Interactive crust, sauce, cheese, and topping selector with real-time price calculation and dietary tag filtering.
- **Real-Time Order Tracking**: Live progress tracker reflecting order stages (Received, Baking, Out for Delivery, Delivered) synchronized via [`Socket.io`](WebDev-L3-PizzaApp/server/server.js:1).
- **PWA Installability**: Fully installable Progressive Web App powered by [`vite-plugin-pwa`](WebDev-L3-PizzaApp/client/vite.config.js:1) supporting offline caching and push-ready architecture.
- **Mobile-First Responsive UI**: Styled with [`Tailwind CSS`](WebDev-L3-PizzaApp/client/tailwind.config.js:1) for optimal viewport adaptability across smartphones, tablets, and desktops.
- **Interactive Notification Drawer**: [`NotificationBell.jsx`](WebDev-L3-PizzaApp/client/src/components/NotificationBell.jsx:1) and [`NotificationContext.jsx`](WebDev-L3-PizzaApp/client/src/context/NotificationContext.jsx:1) delivering instant alerts for order updates and status changes.

### 🛵 Driver Portal
- **Order Claiming**: Dedicated driver dashboard to browse and claim ready-for-delivery orders.
- **6-Digit Delivery PIN Verification**: Secure hand-off protocol requiring customer-provided delivery PIN validation to complete orders.
- **Real-Time Pickup Management**: Live status updates linking kitchen fulfillment directly to assigned drivers.

### 🛡️ Admin Portal
- **Dynamic ETA Adjustment**: Real-time kitchen queue monitoring with granular Estimated Time of Arrival (ETA) controls.
- **Inventory Sub-Category Filtering**: Advanced inventory management via [`InventoryManagement.jsx`](WebDev-L3-PizzaApp/client/src/pages/admin/InventoryManagement.jsx:1) with stock level adjustments and threshold alerts.
- **Fleet & User Management**: Administrative oversight over registered users, drivers, and role assignments in [`DriversManagement.jsx`](WebDev-L3-PizzaApp/client/src/pages/admin/DriversManagement.jsx:1).
- **Automated Low Stock Email Alerts**: Background cron job [`stockChecker.js`](WebDev-L3-PizzaApp/server/utils/stockChecker.js:1) monitoring inventory thresholds and dispatching email notifications via Nodemailer.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, React Router DOM, Axios, [`vite-plugin-pwa`](WebDev-L3-PizzaApp/client/vite.config.js:1)
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, [`Socket.io`](WebDev-L3-PizzaApp/server/server.js:1), JWT Authentication, Nodemailer, `node-cron`
- **Payments**: Razorpay Checkout API integration ([`razorpay.js`](WebDev-L3-PizzaApp/server/config/razorpay.js:1))

---

## ⚙️ Setup & Local Run Instructions

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (Local instance or MongoDB Atlas connection URI)
- Razorpay Test Account credentials
- SMTP Email Service provider (e.g., Gmail, Mailtrap) for notifications

### 1. Environment Variables Configuration

Create and configure environment files based on provided examples:

- **Server Environment ([`server/.env.example`](WebDev-L3-PizzaApp/server/.env.example:1))**:
  ```env
  PORT=5000
  MONGO_URI=your_mongodb_connection_string
  JWT_SECRET=your_jwt_secret_key
  RAZORPAY_KEY_ID=your_razorpay_key_id
  RAZORPAY_KEY_SECRET=your_razorpay_key_secret
  SMTP_HOST=smtp.mailtrap.io
  SMTP_PORT=2525
  SMTP_EMAIL=your_smtp_email
  SMTP_PASSWORD=your_smtp_password
  ADMIN_EMAIL=admin@slicemasters.com
  ```

- **Client Environment ([`client/src/.env.example`](WebDev-L3-PizzaApp/client/src/.env.example:1))**:
  ```env
  VITE_API_BASE_URL=http://localhost:5000/api
  VITE_SOCKET_URL=http://localhost:5000
  VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
  ```

### 2. Run Backend Server
```bash
cd server
npm install
npm run dev
```
*(Runs server on port 5000 with nodemon and starts WebSocket & cron workers)*

### 3. Run Frontend Client
```bash
cd client
npm install
npm run dev
```
*(Runs Vite development server on http://localhost:5173)*

---

## 📂 Project Structure

```
WebDev-L3-PizzaApp/
├── client/                 # React Vite PWA Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components (Navbar, AdminLayout, etc.)
│   │   ├── context/        # React Context (Auth, Cart, Notification)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # User, Driver, Admin, and Auth views
│   │   └── services/       # Axios API integration services
│   ├── index.html          # PWA HTML entry
│   ├── tailwind.config.js  # Tailwind styling configuration
│   └── vite.config.js      # Vite PWA plugin configuration
└── server/                 # Node.js Express Backend
    ├── config/             # DB & payment configurations
    ├── controllers/        # Business logic controllers
    ├── middleware/         # Auth, admin, & error handling middlewares
    ├── models/             # Mongoose schemas (User, Order, Inventory, Token)
    ├── routes/             # REST API endpoint definitions
    ├── utils/              # Email dispatcher & cron stock checker
    ├── seeder.js           # Database seeding utility
    └── server.js           # Express app & Socket.io entry point
```

---

## 📜 License & Acknowledgments

Developed as part of the **Oasis Infobyte Web Development Internship Program (Level 3)** in association with **AICTE**.  
**Timeline:** August 5, 2026 – September 15, 2026.  
All rights reserved © 2026 Kidus Anteneh.
