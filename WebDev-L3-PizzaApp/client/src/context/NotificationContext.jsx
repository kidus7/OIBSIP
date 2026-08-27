import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const previousOrderStatuses = useRef({});

  const userId = user?._id || user?.id || 'guest';
  const userRole = user?.role || 'client';

  // Load notifications from localStorage per user ID
  useEffect(() => {
    try {
      const storageKey = `pizza_notifications_${userId}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setNotifications(JSON.parse(saved));
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error('Error loading notifications from localStorage:', err);
      setNotifications([]);
    }
  }, [userId]);

  // Persist notifications to localStorage
  useEffect(() => {
    try {
      const storageKey = `pizza_notifications_${userId}`;
      localStorage.setItem(storageKey, JSON.stringify(notifications));
    } catch (err) {
      console.error('Error saving notifications to localStorage:', err);
    }
  }, [notifications, userId]);

  // Global helper function to add notification
  const addNotification = ({ type = 'info', title, message, role = 'all' }) => {
    const newNotification = {
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      type,
      title,
      message,
      role,
      read: false,
      timestamp: new Date().toISOString()
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Show toast alert simultaneously at top-right
    const toastIcon = type === 'success' ? '✅' : type === 'warning' ? '⚠️' : type === 'error' ? '❌' : '🍕';
    toast(message || title, {
      icon: toastIcon,
      position: 'top-right',
      duration: 4000,
      style: {
        background: '#fff',
        color: '#1e293b',
        fontWeight: '600',
        fontSize: '13px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
        border: '1px solid #fed7aa'
      }
    });
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Socket.io real-time triggers across roles
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';
    const socket = io(socketUrl);

    socket.on('connect', () => {
      if (userRole === 'admin') {
        socket.emit('join_role', 'admin');
      } else if (userRole === 'driver') {
        socket.emit('join_role', 'driver');
      }
      socket.emit('join_role', 'client');
    });

    socket.on('order_updated', (order) => {
      if (!order) return;

      const orderIdShort = order._id ? order._id.slice(-6) : 'Order';
      const orderUser = order.user?._id || order.user;
      const orderDriver = order.driver?._id || order.driver;
      const currentStatus = order.status;
      const prevStatus = previousOrderStatuses.current[order._id];

      // 1. Client / User Notifications
      if (user && (orderUser === userId || orderUser?.toString() === userId?.toString())) {
        if (currentStatus && currentStatus !== prevStatus) {
          if (currentStatus === 'Order Received') {
            addNotification({
              type: 'success',
              title: 'Order Received 🍕',
              message: `Your order #${orderIdShort} has been successfully received and is queued.`,
              role: 'client'
            });
          } else if (currentStatus === 'In Kitchen') {
            addNotification({
              type: 'info',
              title: 'In Kitchen 🧑‍🍳',
              message: `Your order #${orderIdShort} is currently being prepared by our master chefs!`,
              role: 'client'
            });
          } else if (currentStatus === 'Out for Delivery') {
            const pinMsg = order.deliveryCode ? ` 6-Digit Delivery PIN: ${order.deliveryCode}` : '';
            addNotification({
              type: 'info',
              title: 'Out for Delivery 🛵',
              message: `Your order #${orderIdShort} is out for delivery!${pinMsg}`,
              role: 'client'
            });
          } else if (currentStatus === 'Delivered') {
            addNotification({
              type: 'success',
              title: 'Delivered ✅',
              message: `Your order #${orderIdShort} has been delivered. Enjoy your pizza!`,
              role: 'client'
            });
          }
        }
      }

      // 2. Driver Notifications
      if (userRole === 'driver') {
        // New order ready for pickup (Sent to Delivery)
        if (currentStatus === 'Sent to Delivery' && prevStatus !== 'Sent to Delivery' && !orderDriver) {
          addNotification({
            type: 'info',
            title: 'New Order Ready for Pickup! 📦',
            message: `Order #${orderIdShort} is ready for delivery assignment.`,
            role: 'driver'
          });
        }
        // Order claim confirmed
        if (orderDriver && orderDriver.toString() === userId?.toString() && currentStatus === 'Out for Delivery' && prevStatus !== 'Out for Delivery') {
          addNotification({
            type: 'success',
            title: 'Order Claim Confirmed',
            message: `You successfully accepted order #${orderIdShort}. Safe travels!`,
            role: 'driver'
          });
        }
      }

      // 3. Admin Notifications
      if (userRole === 'admin') {
        // New order placed when payment completed or order created
        if (order.paymentInfo?.status === 'Completed' && prevStatus === undefined) {
          addNotification({
            type: 'success',
            title: 'New Order Placed 💳',
            message: `Order #${orderIdShort} placed by ${order.user?.name || 'Customer'} (₹{order.totalPrice}).`,
            role: 'admin'
          });
        }
        // Order delivered
        if (currentStatus === 'Delivered' && prevStatus !== 'Delivered') {
          addNotification({
            type: 'success',
            title: 'Order Delivered 🏁',
            message: `Order #${orderIdShort} was successfully delivered by driver.`,
            role: 'admin'
          });
        }
      }

      // Update previous status ref
      previousOrderStatuses.current[order._id] = currentStatus;
    });

    socket.on('low_stock_alert', (data) => {
      if (userRole === 'admin') {
        addNotification({
          type: 'warning',
          title: 'Low Stock Alert ⚠️',
          message: data?.message || 'One or more inventory items have fallen below threshold.',
          role: 'admin'
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [userRole, userId, user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
