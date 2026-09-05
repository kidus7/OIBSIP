import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';

export function useSocket() {
  const [socket, setSocket] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const socketUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SOCKET_URL) || 'http://localhost:4000';
    const socketInstance = io(socketUrl);

    socketInstance.on('connect', () => {
      socketInstance.emit('join_role', 'admin');
      socketInstance.emit('join_role', 'driver');
      socketInstance.emit('join_role', 'client');
      if (user?.role) {
        socketInstance.emit('join_role', user.role);
      }
      if (user?._id) {
        socketInstance.emit('join_driver', user._id);
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  return socket;
}
