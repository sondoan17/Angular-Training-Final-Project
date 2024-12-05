import { io } from 'socket.io-client';

export const socket = io(import.meta.env.VITE_API_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ['websocket', 'polling'],
  auth: {
    token: localStorage.getItem('token')
  }
});

export const connectSocket = (token: string) => {
  socket.auth = { token };
  socket.connect();
};

export const disconnectSocket = () => {
  socket.disconnect();
}; 