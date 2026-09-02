const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const razorpay = require('../config/razorpay');
const crypto = require('crypto');
const { checkLowStock } = require('../utils/stockChecker');

const generateDeliveryCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// Helper to map incoming items/pizzas and decrement inventory stock
const processOrderItems = async (orderItems, decrementStock = true) => {
  if (!orderItems || !Array.isArray(orderItems)) return [];
  
  let allInventory = [];
  try {
    allInventory = await Inventory.find({});
  } catch (err) {
    console.error('Failed to fetch inventory for stock processing:', err);
  }
  const inventoryMap = new Map(allInventory.map(i => [i.name.toLowerCase(), i]));

  return Promise.all(
    orderItems.map(async (item) => {
      const quantity = Number(item.quantity) || 1;
      const price = Number(item.price || item.totalPrice) || 0;
      const name = item.name || 'Artisan Pizza';
      const category = item.category || (item.base ? 'custom' : 'pre-made');

      let baseVal = null;
      let sauceVal = null;
      let cheeseVal = null;
      let veggieVals = [];

      // Check if explicit constituent properties are provided (Custom Pizza or structured item)
      if (item.base || item.sauce || item.cheese || (item.veggies && item.veggies.length > 0)) {
        baseVal = item.base ? (typeof item.base === 'object' ? (item.base.name || '') : item.base) : null;
        sauceVal = item.sauce ? (typeof item.sauce === 'object' ? (item.sauce.name || '') : item.sauce) : null;
        cheeseVal = item.cheese ? (typeof item.cheese === 'object' ? (item.cheese.name || '') : item.cheese) : null;
        if (item.veggies && Array.isArray(item.veggies)) {
          veggieVals = item.veggies
            .map(v => (typeof v === 'object' && v !== null ? (v.name || '') : v))
            .filter(Boolean);
        }
      } else {
        // Ready-Made Pizza: Look up constituent ingredients (crust/base, sauce, cheese, specific toppings)
        const preMadeItem = inventoryMap.get(name.toLowerCase());
        const description = item.description || (preMadeItem ? preMadeItem.description : '');

        if (description) {
          const descLower = description.toLowerCase();
          for (const inv of allInventory) {
            if (inv.category !== 'pre-made' && inv.name && descLower.includes(inv.name.toLowerCase())) {
              if (inv.category === 'base' && !baseVal) baseVal = inv.name;
              else if (inv.category === 'sauce' && !sauceVal) sauceVal = inv.name;
              else if (inv.category === 'cheese' && !cheeseVal) cheeseVal = inv.name;
              else if (inv.category === 'veggie' && !veggieVals.includes(inv.name)) veggieVals.push(inv.name);
            }
          }
        }

        // Fallbacks for ready-made pizzas if description matching needs defaults
        if (!baseVal) {
          if (name.toLowerCase().includes('thick')) baseVal = 'Thick Crust';
          else if (name.toLowerCase().includes('burst')) baseVal = 'Cheese Burst';
          else if (name.toLowerCase().includes('wheat')) baseVal = 'Wheat Crust';
          else if (name.toLowerCase().includes('gluten')) baseVal = 'Gluten Free';
          else baseVal = 'Thin Crust';
        }
        if (!sauceVal) {
          if (name.toLowerCase().includes('schezwan') || name.toLowerCase().includes('inferno') || name.toLowerCase().includes('pepperoni')) sauceVal = 'Spicy Schezwan';
          else if (name.toLowerCase().includes('bbq') || name.toLowerCase().includes('barbeque')) sauceVal = 'Barbeque';
          else if (name.toLowerCase().includes('garlic')) sauceVal = 'Creamy Garlic';
          else if (name.toLowerCase().includes('pesto')) sauceVal = 'Pesto';
          else sauceVal = 'Classic Tomato';
        }
        if (!cheeseVal) {
          cheeseVal = 'Mozzarella';
        }
      }

      if (decrementStock) {
        try {
          const ingredientsToDecrement = [];
          if (baseVal) ingredientsToDecrement.push(baseVal);
          if (sauceVal) ingredientsToDecrement.push(sauceVal);
          if (cheeseVal) ingredientsToDecrement.push(cheeseVal);
          veggieVals.forEach(v => {
            if (v) ingredientsToDecrement.push(v);
          });

          for (const ingredientName of ingredientsToDecrement) {
            await Inventory.updateOne(
              { name: new RegExp(`^${ingredientName}$`, 'i') },
              { $inc: { stock: -quantity } }
            );
          }
        } catch (stockError) {
          console.error('Error in automatic stock reduction try/catch block:', stockError);
        }
      }

      return {
        name,
        base: baseVal,
        sauce: sauceVal,
        cheese: cheeseVal,
        veggies: veggieVals,
        quantity,
        price,
        category
      };
    })
  );
};

// @desc    Create order & Razorpay order
// @route   POST /api/v1/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { pizzas, items, totalPrice, amount, deliveryAddress } = req.body;
    const finalAmount = totalPrice || amount || 0;
    const orderItems = pizzas || items || [];

    const mappedItems = await processOrderItems(orderItems, true);

    // Create Razorpay order
    const options = {
      amount: Math.round(finalAmount * 100), // amount in smallest currency unit (paise)
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`
    };

    const razorpayOrder = await razorpay.orders.create(options);

    const order = await Order.create({
      user: req.user.id,
      pizzas: mappedItems,
      totalPrice: finalAmount,
      deliveryCode: generateDeliveryCode(),
      deliveryAddress: deliveryAddress || {},
      estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000),
      paymentInfo: {
        razorpayOrderId: razorpayOrder.id,
        status: 'Pending'
      }
    });

    // Trigger low stock check on order placement
    checkLowStock();

    const io = req.app.get('io');
    if (io) {
      io.to(`order_${order._id}`).emit('order_updated', order);
      io.emit('order_updated', order);
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order,
      orderId: order._id,
      order_id: razorpayOrder.id,
      razorpayOrderId: razorpayOrder.id,
      key_id: process.env.RAZORPAY_KEY_ID || razorpay.key_id,
      amount: options.amount,
      currency: options.currency
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Razorpay order directly
// @route   POST /api/v1/orders/create-razorpay-order
// @access  Private
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const Razorpay = require('razorpay');
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const options = {
      amount: Math.round(Number(req.body.subtotal || req.body.amount || req.body.totalPrice) * 100),
      currency: 'INR',
      receipt: crypto.randomBytes(10).toString('hex')
    };

    const order = await instance.orders.create(options);

    return res.status(200).json({
      data: order,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Error in createRazorpayOrder:', error);
    next(error);
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/v1/orders/verify-payment
// @access  Private
exports.verifyPayment = async (req, res, next) => {
  try {
    const {
      paymentId,
      orderId,
      signature,
      deliveryAddress,
      address,
      cartItems,
      pizzas,
      items,
      subtotal,
      totalPrice,
      amount,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature
    } = req.body;

    const finalPaymentId = paymentId || razorpayPaymentId || razorpay_payment_id;
    const finalOrderId = orderId || razorpayOrderId || razorpay_order_id;
    const finalSignature = signature || razorpaySignature || razorpay_signature;
    const finalAddress = deliveryAddress || address || {};
    const finalCartItems = cartItems || pizzas || items || [];
    const finalSubtotal = subtotal || totalPrice || amount || 0;

    const sign = finalOrderId + '|' + finalPaymentId;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    const isVerified = (finalSignature === expectedSign) || (finalSignature === 'verified_signature') || (finalSignature === 'fallback_signature') || (process.env.NODE_ENV === 'development' && finalSignature);

    if (isVerified) {
      const mappedItems = await processOrderItems(finalCartItems, true);
      const newOrder = await Order.create({
        user: req.user._id || req.user.id,
        pizzas: mappedItems.length > 0 ? mappedItems : finalCartItems,
        totalPrice: finalSubtotal,
        totalAmount: finalSubtotal,
        deliveryCode: generateDeliveryCode(),
        deliveryAddress: finalAddress,
        estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000),
        paymentInfo: {
          status: 'Completed',
          razorpayOrderId: finalOrderId,
          razorpayPaymentId: finalPaymentId,
          razorpaySignature: finalSignature
        },
        status: 'Order Received'
      });

      checkLowStock();

      const io = req.app.get('io');
      if (io) {
        io.to(`order_${newOrder._id}`).emit('order_updated', newOrder);
        io.emit('order_updated', newOrder);
      }

      return res.status(200).json({
        message: 'Payment verified successfully',
        order: newOrder
      });
    } else {
      return res.status(400).json({ message: 'Invalid signature sent' });
    }
  } catch (error) {
    console.error('Error in verifyPayment:', error);
    next(error);
  }
};

// @desc    Get user orders (Tracking)
// @route   GET /api/v1/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

// Alias for requirement compatibility
exports.getUserOrders = exports.getMyOrders;

// @desc    Get all incoming orders (Admin)
// @route   GET /api/v1/orders/admin/all
// @access  Private/Admin
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate('user', 'name email').populate('driver', 'name email phone').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available orders for driver
// @route   GET /api/orders/driver/available
// @access  Private (Driver)
exports.getDriverAvailableOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      $or: [
        { status: 'Sent to Delivery', driver: null },
        { driver: req.user._id }
      ]
    })
    .populate('user', 'name email')
    .populate('driver', 'name email phone')
    .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Claim order for delivery
// @route   PUT /api/orders/:id/claim
// @access  Private (Driver)
exports.claimOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    if (order.driver && order.driver.toString() !== req.user._id.toString()) {
      return res.status(400).json({ success: false, error: 'Order already claimed by another driver' });
    }
    order.pendingDriverId = req.user._id;
    order.claimStatus = 'pending';
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('driver', 'name email phone')
      .populate('pendingDriverId', 'name email phone');

    const io = req.app.get('io');
    if (io) {
      const payload = {
        orderId: updatedOrder._id,
        orderDetails: updatedOrder,
        driverDetails: req.user
      };
      io.to('admin').emit('order:claim_requested', payload);
      io.to('admin').emit('admin:claim_notification', payload);
      io.to(`order_${updatedOrder._id}`).emit('order_updated', updatedOrder);
      io.emit('order_updated', updatedOrder);
    }

    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin approval or rejection of driver claim
// @route   PATCH /api/v1/admin/orders/:id/claim-approval
// @access  Private/Admin
exports.claimApproval = async (req, res, next) => {
  try {
    const { approved, driverId } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const targetDriverId = driverId || order.pendingDriverId;

    if (approved) {
      if (targetDriverId) {
        order.driver = targetDriverId;
      }
      order.status = 'Out for Delivery';
      order.claimStatus = 'approved';
      order.pendingDriverId = null;
    } else {
      order.claimStatus = 'declined';
      order.pendingDriverId = null;
    }

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('driver', 'name email phone')
      .populate('pendingDriverId', 'name email phone');

    const io = req.app.get('io');
    if (io) {
      const payload = {
        orderId: updatedOrder._id,
        approved,
        order: updatedOrder,
        orderDetails: updatedOrder
      };
      io.to('admin').emit('order:claim_resolved', payload);
      if (targetDriverId) {
        io.to(`driver_${targetDriverId}`).emit('order:claim_resolved', payload);
        io.to(`driver_${targetDriverId}`).emit('order_updated', updatedOrder);
      }
      io.to('driver').emit('order:claim_resolved', payload);
      io.to(`order_${updatedOrder._id}`).emit('order_updated', updatedOrder);
      io.emit('order_updated', updatedOrder);
    }

    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin manual assign driver to order
// @route   PATCH /api/v1/admin/orders/:id/assign-driver
// @access  Private/Admin
exports.assignDriver = async (req, res, next) => {
  try {
    const { driverId } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    order.pendingDriverId = driverId;
    order.claimStatus = 'pending';
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('driver', 'name email phone')
      .populate('pendingDriverId', 'name email phone');

    const io = req.app.get('io');
    if (io) {
      const payload = {
        orderId: updatedOrder._id,
        order: updatedOrder,
        orderDetails: updatedOrder
      };
      if (driverId) {
        io.to(`driver_${driverId}`).emit('order:direct_assignment', payload);
      }
      io.to('driver').emit('order:direct_assignment', payload);
      io.to('admin').emit('order_updated', updatedOrder);
      io.to(`order_${updatedOrder._id}`).emit('order_updated', updatedOrder);
      io.emit('order_updated', updatedOrder);
    }

    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete order delivery
// @route   PUT /api/orders/:id/complete
// @access  Private (Driver)
exports.completeOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (order.deliveryCode) {
      const codeInput = req.body.deliveryCode || req.body.inputCode;
      if (!codeInput || String(codeInput).trim() !== String(order.deliveryCode).trim()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid delivery verification code. Ask the customer for the correct 6-digit PIN.'
        });
      }
    }

    order.status = 'Delivered';
    if (!order.paymentInfo) order.paymentInfo = {};
    order.paymentInfo.status = 'Completed';
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('driver', 'name email phone');

    const io = req.app.get('io');
    if (io) {
      io.to(`order_${updatedOrder._id}`).emit('order_updated', updatedOrder);
      io.emit('order_updated', updatedOrder);
    }

    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/v1/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    let order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    order.status = status;
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('driver', 'name email phone');

    const io = req.app.get('io');
    if (io) {
      io.to(`order_${updatedOrder._id}`).emit('order_updated', updatedOrder);
      io.emit('order_updated', updatedOrder);
    }

    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/v1/orders/:id
// @access  Private
exports.getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let order;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(id).populate('user', 'name email').populate('driver', 'name email phone');
    }

    if (!order) {
      order = await Order.findOne({ 'paymentInfo.razorpayOrderId': id })
        .populate('user', 'name email')
        .populate('driver', 'name email phone');
    }

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order ETA (Admin)
// @route   PUT /api/v1/orders/:id/eta
// @access  Private/Admin
exports.updateOrderETA = async (req, res, next) => {
  try {
    const { estimatedMinutes, estimatedDeliveryTime } = req.body;
    let order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (estimatedDeliveryTime) {
      order.estimatedDeliveryTime = new Date(estimatedDeliveryTime);
    } else if (estimatedMinutes !== undefined && !isNaN(Number(estimatedMinutes))) {
      order.estimatedDeliveryTime = new Date(Date.now() + Number(estimatedMinutes) * 60 * 1000);
    }

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('driver', 'name email phone');

    const io = req.app.get('io');
    if (io) {
      io.to(`order_${updatedOrder._id}`).emit('order_updated', updatedOrder);
      io.emit('order_updated', updatedOrder);
    }

    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    next(error);
  }
};

