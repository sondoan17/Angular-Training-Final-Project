import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_API_URL, {
  autoConnect: false,
  withCredentials: true,
  path: "/socket.io/",
  transports: ["polling"],
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity,
  timeout: 20000,
  forceNew: true,
});

export const connectSocket = (token: string) => {
  socket.auth = { token };
  socket.connect();

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
    setTimeout(() => {
      socket.connect();
    }, 1000);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
    if (reason === "io server disconnect" || reason === "transport close") {
      setTimeout(() => {
        socket.connect();
      }, 1000);
    }
  });

  socket.on("reconnect_attempt", (attemptNumber) => {
    console.log(`Reconnection attempt ${attemptNumber}`);
  });
};

export const disconnectSocket = () => {
  socket.removeAllListeners();
  socket.disconnect();
};
