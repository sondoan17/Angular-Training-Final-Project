import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { setCredentials } from "../store/slices/authSlice";
import { User } from "../types/auth.types";
import { socket, connectSocket, disconnectSocket } from "../services/socket";

interface StoredUser {
  id: string;
  username: string;
}

export const useAuth = () => {
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);
  const auth = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (auth.token && auth.user) {
      connectSocket(auth.token);

      socket.on("connect", () => {
        console.log("Socket connected");

        socket.emit("login", auth.user?.id);
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected");
      });

      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });
    } else {
      disconnectSocket();
    }

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
    };
  }, [auth.token, auth.user]);

  // Initialize auth from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (token && userStr && !auth.user) {
        try {
          const user = JSON.parse(userStr) as StoredUser;
          dispatch(
            setCredentials({
              token,
              userId: user.id,
              username: user.username,
            })
          );
        } catch (error) {
          console.error("Error parsing stored user data:", error);
        }
      }
      setIsInitialized(true);
    };

    initializeAuth();
  }, []);

  return {
    user: auth.user as User | null,
    token: auth.token,
    isAuthenticated: !!auth.token && !!auth.user,
    isInitialized,
    socket, // Thêm socket vào return object nếu cần sử dụng ở component khác
  };
};
