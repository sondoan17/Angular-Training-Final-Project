import axiosInstance from './axiosInstance';
import { AxiosResponse } from 'axios';

export interface Notification {
  _id: string;
  type: 'task_assignment' | 'task_modified' | 'due_date' | 'mention' | 'project_update' | 'new_comment';
  title: string;
  message: string;
  projectId?: string;
  taskId?: string;
  read: boolean;
  createdAt: string;
}

interface NotificationPayload {
  type: 'task_assignment' | 'task_modified' | 'due_date' | 'mention' | 'project_update' | 'new_comment';
  title: string;
  message: string;
  projectId?: string;
  taskId?: string;
  recipients: string[]; // array of user IDs
}

export const notificationService = {
  async getUserNotifications(page: number = 1, limit: number = 5): Promise<{
    notifications: Notification[];
    hasMore: boolean;
  }> {
    const response: AxiosResponse = await axiosInstance.get(
      `/api/notifications/user?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  async markAsRead(notificationId: string): Promise<Notification> {
    const response: AxiosResponse = await axiosInstance.put(
      `/api/notifications/${notificationId}/read`
    );
    return response.data;
  },

  async markAllAsRead(): Promise<void> {
    await axiosInstance.put('/api/notifications/read-all');
  },

  async createBulkNotifications(payload: NotificationPayload): Promise<void> {
    await axiosInstance.post('/api/notifications/bulk', payload);
  }
}; 