import axiosInstance from './axiosInstance';
import { AxiosResponse } from 'axios';

interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  name?: string;
}

export const userService = {
  async getAllUsers(): Promise<User[]> {
    try {
      const response: AxiosResponse<User[]> = await axiosInstance.get('/api/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  async getUserProfile(): Promise<User> {
    try {
      const response: AxiosResponse<User> = await axiosInstance.get('/api/users/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  async updateUserProfile(userData: Partial<User>): Promise<User> {
    try {
      const response: AxiosResponse<User> = await axiosInstance.put('/api/users/profile', userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
};
