import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/auth/authSlice';
import { useSnackbar } from 'notistack';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

export const useSocket = () => {
  const user = useSelector(selectCurrentUser);
  const socketRef = useRef(null);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (user?.id) {
      socketRef.current = io(SOCKET_URL);

      socketRef.current.on('connect', () => {
        socketRef.current.emit('join', user.id);
      });

      socketRef.current.on('notification', (notif) => {
        enqueueSnackbar(notif.title, {
          variant: 'info',
          autoHideDuration: 5000,
        });
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [user, enqueueSnackbar]);

  return socketRef.current;
};
