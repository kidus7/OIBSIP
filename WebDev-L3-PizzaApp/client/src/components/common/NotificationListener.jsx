import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addNotification } from '../../store/slices/notificationSlice';
import { orderApi } from '../../store/api/orderApi';
import { notificationApi } from '../../store/api/notificationApi';
import { useSocket } from '../../hooks/useSocket';
import toast from 'react-hot-toast';

export default function NotificationListener() {
  const socket = useSocket();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!socket) return;

    const currentUserId = user?._id || user?.id;
    const userRole = user?.role || 'customer';

    const invalidateAll = () => {
      dispatch(orderApi.util.invalidateTags(['Order']));
      dispatch(notificationApi.util.invalidateTags(['Notification']));
    };

    const isCustomerOwner = (order) => {
      if (!currentUserId || !order) return false;
      const orderUserId = order.user?._id || order.user?.id || order.user;
      return orderUserId && String(orderUserId) === String(currentUserId);
    };

    const isAssignedToDriver = (order) => {
      if (!currentUserId || !order) return false;
      const driverId = order.driver?._id || order.driver?.id || order.driver;
      return driverId && String(driverId) === String(currentUserId);
    };

    // Handle general order status updates & creation
    const handleOrderEvent = (payload, eventName) => {
      invalidateAll();
      const order = payload?.orderDetails || payload?.order || payload;
      if (!order) return;

      const status = order.status;
      const orderIdStr = order._id || order.orderId || 'xxxxxx';
      const shortId = typeof orderIdStr === 'string' ? orderIdStr.slice(-6) : 'xxxxxx';

      // 1. Customer / Client notifications
      if (userRole === 'customer' || userRole === 'client' || !userRole || userRole === 'user') {
        if (isCustomerOwner(order)) {
          const validStatuses = ['Order Received', 'In Kitchen', 'Out for Delivery', 'Delivered', 'Cancelled'];
          if (validStatuses.some(s => s.toLowerCase() === (status || '').toLowerCase())) {
            let title = 'Order Update';
            let type = 'info';
            if (status === 'Delivered') {
              title = 'Order Delivered! ✨';
              type = 'success';
            } else if (status === 'Cancelled') {
              title = 'Order Cancelled';
              type = 'error';
            } else {
              title = `Order ${status || 'Updated'}`;
            }
            const message = `Order #${shortId} status updated to "${status || 'updated'}"`;
            
            dispatch(addNotification({
              title,
              message,
              type,
              role: 'customer'
            }));
            
            toast.success(message);
          }
        }
      }

      // 2. Admin notifications
      if (userRole === 'admin') {
        if (eventName === 'order:created' || status === 'Order Received') {
          const title = 'New Order Received! 🍕';
          const message = `New order #${shortId} placed successfully`;
          
          dispatch(addNotification({
            title,
            message,
            type: 'success',
            role: 'admin'
          }));
          
          toast.success(message);
        } else if (status === 'Delivered') {
          const title = 'Order Delivered! ✨';
          const message = `Order #${shortId} has been successfully delivered`;
          
          dispatch(addNotification({
            title,
            message,
            type: 'success',
            role: 'admin'
          }));
          
          toast.success(message);
        } else if (status === 'Cancelled') {
          const title = 'Order Cancelled';
          const message = `Order #${shortId} has been cancelled`;
          
          dispatch(addNotification({
            title,
            message,
            type: 'error',
            role: 'admin'
          }));
          
          toast.error(message);
        }
      }

      // 3. Driver notifications
      if (userRole === 'driver') {
        // Receives notifications ONLY when an order becomes available for pickup ('Out for Delivery')
        if (status === 'Out for Delivery' || eventName === 'order:ready_for_delivery') {
          const title = 'New Delivery Available! 🛵';
          const message = `Order #${shortId} is out for delivery and available for pickup`;
          
          dispatch(addNotification({
            title,
            message,
            type: 'success',
            role: 'driver'
          }));
          
          toast.success(message);
        }
        // Receives notifications when an assigned order is completed/delivered
        else if (status === 'Delivered' && isAssignedToDriver(order)) {
          const title = 'Assigned Order Delivered! ✨';
          const message = `Assigned Order #${shortId} was successfully delivered`;
          
          dispatch(addNotification({
            title,
            message,
            type: 'success',
            role: 'driver'
          }));
          
          toast.success(message);
        }
      }
    };

    // Handle admin claim notifications from drivers
    const handleClaimNotification = (payload) => {
      invalidateAll();
      if (userRole === 'admin') {
        const orderIdStr = payload?.orderId || payload?.orderDetails?._id || payload?.order?._id || 'xxxxxx';
        const shortId = typeof orderIdStr === 'string' ? orderIdStr.slice(-6) : 'xxxxxx';
        const title = 'New Delivery Claim';
        const message = `Driver requested claim for Order #${shortId}`;
        
        dispatch(addNotification({
          title,
          message,
          type: 'warning',
          role: 'admin'
        }));
        
        toast(message, { icon: '🛵' });
      }
    };

    const handleClaimRequested = (payload) => {
      invalidateAll();
      if (userRole === 'admin') {
        const orderIdStr = payload?.orderId || payload?.orderDetails?._id || payload?.order?._id || 'xxxxxx';
        const shortId = typeof orderIdStr === 'string' ? orderIdStr.slice(-6) : 'xxxxxx';
        const title = 'New Delivery Claim Request';
        const message = `Driver requested claim for Order #${shortId}`;

        dispatch(addNotification({
          title,
          message,
          type: 'warning',
          role: 'admin'
        }));

        toast(message, { icon: '🛵' });
      }
    };

    // Handle driver claim resolution notifications specifically meant for them
    const handleClaimResolved = (payload) => {
      invalidateAll();
      if (userRole === 'driver') {
        const targetDriverId = payload?.driverId || payload?.orderDetails?.driver?._id || payload?.orderDetails?.driver || payload?.orderDetails?.pendingDriverId?._id || payload?.orderDetails?.pendingDriverId || payload?.order?.driver?._id || payload?.order?.driver || payload?.order?.pendingDriverId;
        const isForMe = targetDriverId && currentUserId && String(targetDriverId) === String(currentUserId);

        if (isForMe) {
          const isApproved = payload?.approved;
          const orderIdStr = payload?.orderId || payload?.orderDetails?._id || payload?.order?._id || 'xxxxxx';
          const shortId = typeof orderIdStr === 'string' ? orderIdStr.slice(-6) : 'xxxxxx';
          const title = isApproved ? 'Claim Approved! 🎉' : 'Claim Declined';
          const message = isApproved 
            ? `Your claim for Order #${shortId} was approved!`
            : `Your claim for Order #${shortId} was declined.`;

          dispatch(addNotification({
            title,
            message,
            type: isApproved ? 'success' : 'error',
            role: 'driver'
          }));

          if (isApproved) {
            toast.success(message);
          } else {
            toast.error(message);
          }
        }
      }
    };

    const handleAssignmentResolved = (payload) => {
      invalidateAll();
      if (userRole === 'driver') {
        const order = payload?.orderDetails || payload?.order || payload;
        if (isAssignedToDriver(order)) {
          const orderIdStr = payload?.orderId || order?._id || 'xxxxxx';
          const shortId = typeof orderIdStr === 'string' ? orderIdStr.slice(-6) : 'xxxxxx';
          const title = 'Assignment Update';
          const message = `Order #${shortId} assignment updated`;
          
          dispatch(addNotification({
            title,
            message,
            type: 'info',
            role: 'driver'
          }));
          toast(message, { icon: '🚗' });
        }
      }
    };

    const handleDirectAssignment = (payload) => {
      invalidateAll();
      if (userRole === 'driver') {
        const order = payload?.orderDetails || payload?.order || payload;
        const targetDriverId = payload?.driverId || order?.driver?._id || order?.driver || order?.pendingDriverId?._id || order?.pendingDriverId;
        const isForMe = targetDriverId && currentUserId && String(targetDriverId) === String(currentUserId);

        if (isForMe || !targetDriverId || isAssignedToDriver(order)) {
          const orderIdStr = payload?.orderId || order?._id || 'xxxxxx';
          const shortId = typeof orderIdStr === 'string' ? orderIdStr.slice(-6) : 'xxxxxx';
          const title = 'New Job Assigned! 🛵';
          const message = `You have been directly assigned Order #${shortId}`;
          
          dispatch(addNotification({
            title,
            message,
            type: 'success',
            role: 'driver'
          }));
          toast.success(message);
        }
      }
    };

    const onOrderUpdated = (p) => handleOrderEvent(p, 'order_updated');
    const onOrderCreated = (p) => handleOrderEvent(p, 'order:created');
    const onReadyForDelivery = (p) => handleOrderEvent(p, 'order:ready_for_delivery');
    const onOrderDelivered = (p) => handleOrderEvent(p, 'order:delivered');

    socket.on('order_updated', onOrderUpdated);
    socket.on('order:created', onOrderCreated);
    socket.on('order:ready_for_delivery', onReadyForDelivery);
    socket.on('order:delivered', onOrderDelivered);
    socket.on('admin:claim_notification', handleClaimNotification);
    socket.on('order:claim_requested', handleClaimRequested);
    socket.on('order:claim_resolved', handleClaimResolved);
    socket.on('order:assignment_resolved', handleAssignmentResolved);
    socket.on('order:direct_assignment', handleDirectAssignment);

    return () => {
      socket.off('order_updated', onOrderUpdated);
      socket.off('order:created', onOrderCreated);
      socket.off('order:ready_for_delivery', onReadyForDelivery);
      socket.off('order:delivered', onOrderDelivered);
      socket.off('admin:claim_notification', handleClaimNotification);
      socket.off('order:claim_requested', handleClaimRequested);
      socket.off('order:claim_resolved', handleClaimResolved);
      socket.off('order:assignment_resolved', handleAssignmentResolved);
      socket.off('order:direct_assignment', handleDirectAssignment);
    };
  }, [socket, dispatch, user]);

  return null; // Side-effect component
}
