# SliceMasters PizzaApp (PWA) — MERN Stack Delivery Platform

**Repository:** `OIBSIP` / `WebDev-L3-PizzaApp`  
**Developer:** Kidus Anteneh  

---

## 📌 Overview

**SliceMasters** is a production-ready, full-stack MERN application (MongoDB, Express, React, Node.js) built as a Progressive Web App (PWA) for real-time pizza ordering, driver dispatch, and inventory management. 

It features an interactive custom pizza builder, 6-digit delivery verification PINs, dynamic arrival time updates, Razorpay payment processing, driver routing, and automated background inventory stock alerts.

---

## 📂 Repository Layout

* **[`WebDev-L3-PizzaApp`](./WebDev-L3-PizzaApp)** — Complete application codebase containing both client and server source code, full setup guides, and API documentation.
  * **[`client/`](./WebDev-L3-PizzaApp/client)** — Mobile-first React 18 + Vite frontend with Tailwind CSS and PWA service worker support.
  * **[`server/`](./WebDev-L3-PizzaApp/server)** — Express REST API with MongoDB/Mongoose, Socket.io real-time engine, Nodemailer, and `node-cron` background jobs.

---

## ⚡ Key Highlights

- **Interactive Custom Builder:** Real-time ingredient selection, price calculation, and stock validation.
- **Secure Delivery Verification:** 6-digit PIN handshake required between customer and driver to complete orders.
- **Real-Time Order Tracking:** WebSocket updates (`Socket.io`) paired with dynamic ETA management.
- **Automated Inventory Alerts:** Background `node-cron` scheduled monitoring with automated email notifications.
- **Progressive Web App (PWA):** Mobile-first design with offline asset caching and home-screen install prompts.

👉 **[Navigate to `WebDev-L3-PizzaApp`](./WebDev-L3-PizzaApp) to view full technical documentation, environment setup, and installation steps.**