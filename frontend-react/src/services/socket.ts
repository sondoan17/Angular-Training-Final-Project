import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_API_URL, {
  autoConnect: false,
  withCredentials: true,
  path: "/socket.io/",
  transports: ["polling"],
  reconnectionDelay: 5000,
  reconnectionDelayMax: 10000,
  reconnectionAttempts: 5,
  timeout: 45000,
  forceNew: true,
});

export const connectSocket = (token: string) => {
  if (socket.connected) {
    return;
  }

  socket.auth = { token };
  socket.connect();

  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
    reconnectAttempts++;
    
    if (reconnectAttempts < maxReconnectAttempts) {
      setTimeout(() => {
        socket.connect();
      }, 5000);
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
    if (reason === "io server disconnect") {
      setTimeout(() => {
        socket.connect();
      }, 5000);
    }
  });
};

export const disconnectSocket = () => {
  socket.removeAllListeners();
  socket.disconnect();
};
