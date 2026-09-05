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

    const invalidateAll = () => {
      dispatch(orderApi.util.invalidateTags(['Order']));
      dispatch(notificationApi.util.invalidateTags(['Notification']));
    };

    // Handle general order status updates
    const handleOrderUpdate = (order) => {
      invalidateAll();
      const orderIdStr = order?._id || order?.orderId || 'xxxxxx';
      const shortId = typeof orderIdStr === 'string' ? orderIdStr.slice(-6) : 'xxxxxx';
      const title = 'Order Update';
      const message = `Order #${shortId} status updated to "${order.status || 'updated'}"`;
      
      dispatch(addNotification({
        title,
        message,
        type: 'info',
        role: user?.role || 'customer'
      }));
      
      toast.success(message);
    };

    const handleOrderCreated = (order) => {
      invalidateAll();
      if (user?.role === 'admin') {
        const orderIdStr = order?._id || order?.orderId || 'xxxxxx';
        const shortId = typeof orderIdStr === 'string' ? orderIdStr.slice(-6) : 'xxxxxx';
        const title = 'New Order Received! 🍕';
        const message = `New order #${shortId} placed successfully`;
        
        dispatch(addNotification({
          title,
          message,
          type: 'success',
          role: 'admin'
        }));
        
        toast.success(message);
      }
    };

    const handleOrderDelivered = (order) => {
      invalidateAll();
      const orderIdStr = order?._id || order?.orderId || 'xxxxxx';
      const shortId = typeof orderIdStr === 'string' ? orderIdStr.slice(-6) : 'xxxxxx';
      const title = 'Order Delivered! ✨';
      const message = `Order #${shortId} has been successfully delivered`;
      
      dispatch(addNotification({
        title,
        message,
        type: 'success',
        role: user?.role || 'customer'
      }));
      
      toast.success(message);
    };

    // Handle admin claim notifications from drivers
    const handleClaimNotification = (payload) => {
      invalidateAll();
      if (user?.role === 'admin') {
        const orderIdStr = payload?.orderId || payload?.orderDetails?._id || 'xxxxxx';
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
      if (user?.role === 'admin') {
        const orderIdStr = payload?.orderId || payload?.orderDetails?._id || 'xxxxxx';
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

    // Handle driver claim resolution notifications
    const handleClaimResolved = (payload) => {
      invalidateAll();
      const isApproved = payload?.approved;
      const orderIdStr = payload?.orderId || payload?.orderDetails?._id || 'xxxxxx';
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
    };

    const handleAssignmentResolved = (payload) => {
      invalidateAll();
      const orderIdStr = payload?.orderId || payload?.orderDetails?._id || 'xxxxxx';
      const shortId = typeof orderIdStr === 'string' ? orderIdStr.slice(-6) : 'xxxxxx';
      const title = 'Assignment Update';
      const message = `Order #${shortId} assignment updated`;
      
      dispatch(addNotification({
        title,
        message,
        type: 'info',
        role: user?.role || 'driver'
      }));
      toast(message, { icon: '🚗' });
    };

    const handleDirectAssignment = (payload) => {
      invalidateAll();
      const orderIdStr = payload?.orderId || payload?.orderDetails?._id || 'xxxxxx';
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
    };

    socket.on('order_updated', handleOrderUpdate);
    socket.on('order:created', handleOrderCreated);
    socket.on('order:ready_for_delivery', handleOrderUpdate);
    socket.on('order:delivered', handleOrderDelivered);
    socket.on('admin:claim_notification', handleClaimNotification);
    socket.on('order:claim_requested', handleClaimRequested);
    socket.on('order:claim_resolved', handleClaimResolved);
    socket.on('order:assignment_resolved', handleAssignmentResolved);
    socket.on('order:direct_assignment', handleDirectAssignment);

    return () => {
      socket.off('order_updated', handleOrderUpdate);
      socket.off('order:created', handleOrderCreated);
      socket.off('order:ready_for_delivery', handleOrderUpdate);
      socket.off('order:delivered', handleOrderDelivered);
      socket.off('admin:claim_notification', handleClaimNotification);
      socket.off('order:claim_requested', handleClaimRequested);
      socket.off('order:claim_resolved', handleClaimResolved);
      socket.off('order:assignment_resolved', handleAssignmentResolved);
      socket.off('order:direct_assignment', handleDirectAssignment);
    };
  }, [socket, dispatch, user]);

  return null; // Side-effect component
}
