import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { setCredentials } from '../store/slices/authSlice';
import { User } from '../types/auth.types';

interface StoredUser {
  id: string;
  username: string;
}

export const useAuth = () => {
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);
  const auth = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (token && userStr && !auth.user) {
        try {
          const user = JSON.parse(userStr) as StoredUser;
          dispatch(setCredentials({ 
            token, 
            userId: user.id, 
            username: user.username 
          }));
        } catch (error) {
          console.error('Error parsing stored user data:', error);
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
    isInitialized
  };
}; 