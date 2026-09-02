const User = require('../models/User');
const Order = require('../models/Order');

// @desc    Update driver availability status
// @route   PATCH /api/v1/driver/status
// @access  Private/Driver
exports.updateStatus = async (req, res, next) => {
  try {
    const { isOnline, status } = req.body;
    const user = await User.findById(req.user.id);

    if (!user || user.role !== 'driver') {
      return res.status(403).json({ success: false, error: 'Not authorized as a driver' });
    }

    if (isOnline !== undefined) {
      user.isOnline = Boolean(isOnline);
      user.status = isOnline ? 'active' : 'offline';
      user.isActive = Boolean(isOnline);
    } else if (status !== undefined) {
      user.status = status;
      user.isOnline = status === 'active';
      user.isActive = status === 'active';
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isOnline: user.isOnline,
        status: user.status,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify delivery OTP/PIN and complete order
// @route   PUT /api/v1/driver/orders/:id/verify
// @access  Private/Driver
exports.verifyDeliveryOTP = async (req, res, next) => {
  try {
    const { otp, deliveryCode, verificationPin, pin } = req.body;
    const inputCode = otp || deliveryCode || verificationPin || pin;
    const orderId = req.params.id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found', message: 'Order not found' });
    }

    if (order.deliveryCode) {
      if (!inputCode || String(inputCode).trim() !== String(order.deliveryCode).trim()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid delivery verification PIN',
          message: 'Invalid delivery verification PIN'
        });
      }
    }

    order.status = 'Delivered';
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    if (!order.paymentInfo) order.paymentInfo = {};
    order.paymentInfo.status = 'Completed';
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('driver', 'name email phone');

    const io = req.app.get('io');
    if (io) {
      io.to(`order_${updatedOrder._id}`).emit('order_updated', updatedOrder);
      io.to(`order_${updatedOrder._id}`).emit('order:delivered', updatedOrder);
      io.to('admin').emit('order:delivered', updatedOrder);
      io.to('driver').emit('order:delivered', updatedOrder);
      io.emit('order_updated', updatedOrder);
      io.emit('order:delivered', updatedOrder);
    }

    res.status(200).json({
      success: true,
      message: 'Delivery verified & order completed!',
      data: updatedOrder,
      order: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Respond to direct job assignment (Accept or Decline)
// @route   PATCH /api/v1/driver/orders/:id/assignment-response
// @access  Private/Driver
exports.assignmentResponse = async (req, res, next) => {
  try {
    const { accept } = req.body;
    const orderId = req.params.id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found', message: 'Order not found' });
    }

    if (accept) {
      order.driver = req.user._id;
      order.status = 'Out for Delivery';
      order.claimStatus = 'approved';
      order.pendingDriverId = null;
    } else {
      order.pendingDriverId = null;
      order.claimStatus = 'none';
      order.status = 'Sent for Delivery';
      order.driver = null;
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
        accept,
        order: updatedOrder,
        orderDetails: updatedOrder
      };
      io.to('admin').emit('order:assignment_resolved', payload);
      io.to('admin').emit('order_updated', updatedOrder);
      io.to('driver').emit('order:assignment_resolved', payload);
      io.to(`driver_${req.user._id}`).emit('order_updated', updatedOrder);
      io.to(`order_${updatedOrder._id}`).emit('order_updated', updatedOrder);
      io.emit('order_updated', updatedOrder);
      io.emit('order:assignment_resolved', payload);
    }

    res.status(200).json({
      success: true,
      message: accept ? 'Assignment accepted successfully' : 'Assignment declined successfully',
      data: updatedOrder,
      order: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};
