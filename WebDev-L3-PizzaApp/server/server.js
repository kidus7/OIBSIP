const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');
const { initStockChecker } = require('./utils/stockChecker');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Initialize cron jobs
initStockChecker();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Store io instance on app
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('join_order', (orderId) => {
    if (orderId) {
      socket.join(`order_${orderId}`);
      console.log(`Socket ${socket.id} joined order room: order_${orderId}`);
    }
  });

  socket.on('join_role', (role) => {
    if (role) {
      socket.join(role); // e.g. 'admin' or 'driver'
      console.log(`Socket ${socket.id} joined role room: ${role}`);
    }
  });

  socket.on('join_driver', (driverId) => {
    if (driverId) {
      socket.join(`driver_${driverId}`);
      console.log(`Socket ${socket.id} joined driver room: driver_${driverId}`);
    }
  });

  socket.on('driver:request_claim', async (data) => {
    try {
      const { orderId, driverId } = data || {};
      if (!orderId || !driverId) return;
      const Order = require('./models/Order');
      const order = await Order.findById(orderId);
      if (order) {
        order.pendingDriverId = driverId;
        order.claimStatus = 'pending';
        await order.save();
        const updated = await Order.findById(orderId)
          .populate('user', 'name email')
          .populate('driver', 'name email phone')
          .populate('pendingDriverId', 'name email phone');
        const payload = {
          orderId: updated._id,
          orderDetails: updated,
          driverDetails: updated.pendingDriverId
        };
        io.to('admin').emit('admin:claim_notification', payload);
        io.to('admin').emit('order:claim_requested', payload);
        io.to(`order_${updated._id}`).emit('order_updated', updated);
        io.emit('order_updated', updated);
      }
    } catch (err) {
      console.error('Error in driver:request_claim socket handler:', err);
    }
  });

  socket.on('admin:resolve_claim', async (data) => {
    try {
      const { orderId, approved, driverId } = data || {};
      if (!orderId) return;
      const Order = require('./models/Order');
      const order = await Order.findById(orderId);
      if (order) {
        const targetDriverId = driverId || order.pendingDriverId;
        if (approved) {
          if (targetDriverId) order.driver = targetDriverId;
          order.status = 'Out for Delivery';
          order.claimStatus = 'approved';
          order.pendingDriverId = null;
        } else {
          order.claimStatus = 'declined';
          order.pendingDriverId = null;
        }
        await order.save();
        const updated = await Order.findById(orderId)
          .populate('user', 'name email')
          .populate('driver', 'name email phone')
          .populate('pendingDriverId', 'name email phone');
        const payload = { orderId: updated._id, approved, order: updated, orderDetails: updated };
        io.to('admin').emit('order:claim_resolved', payload);
        if (targetDriverId) {
          io.to(`driver_${targetDriverId}`).emit('order:claim_resolved', payload);
          io.to(`driver_${targetDriverId}`).emit('order_updated', updated);
        }
        io.to('driver').emit('order:claim_resolved', payload);
        io.to(`order_${updated._id}`).emit('order_updated', updated);
        io.emit('order_updated', updated);
      }
    } catch (err) {
      console.error('Error in admin:resolve_claim socket handler:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Mount routers
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/inventory', require('./routes/inventoryRoutes'));
app.use('/api/v1/orders', require('./routes/orderRoutes'));
app.use('/api/v1/users', require('./routes/userRoutes'));
app.use('/api/v1/driver', require('./routes/driverRoutes'));
app.use('/api/v1/admin', require('./routes/adminRoutes'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Welcome to Slice Masters PizzaApp API' });
});

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

server.listen(
  PORT,
  () => console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
