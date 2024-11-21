import axiosInstance from './axiosInstance';
import { AxiosResponse } from 'axios';

export interface UserProfile {
  _id: string;
  username: string;
  name?: string;
  email: string;
  birthDate?: Date;
  socialMedia?: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    github?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export const userService = {
  async getCurrentUserProfile(): Promise<UserProfile> {
    try {
      const response: AxiosResponse<UserProfile> = await axiosInstance.get('/api/users/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  async updateUserProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response: AxiosResponse<UserProfile> = await axiosInstance.put(
        '/api/users/profile',
        profileData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
};
