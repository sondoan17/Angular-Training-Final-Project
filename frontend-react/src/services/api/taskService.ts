import axiosInstance from './axiosInstance';
import { AxiosResponse } from 'axios';
import { notificationService } from './notificationService';

export interface Task {
  _id: string;
  title: string;
  description: string;
  type: 'task' | 'bug';
  status: 'Not Started' | 'In Progress' | 'Stuck' | 'Done';
  priority: 'none' | 'low' | 'medium' | 'high' | 'critical';
  timeline?: {
    start?: Date;
    end?: Date;
  };
  assignedTo: Array<{
    _id: string;
    username: string;
    email?: string;
    name?: string;
  }>;
  projectId: string;
  comments?: TaskComment[];
  activityLog?: ActivityLogItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskData {
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate?: Date;
  assignedTo?: string[];
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: Date;
  assignedTo?: string[];
}

export interface Comment {
  _id: string;
  content: string;
  createdBy: string;
  createdAt: Date;
}

export interface ActivityLogItem {
  action: string;
  performedBy: {
    _id: string;
    username: string;
  };
  timestamp: Date;
}

export interface TaskComment {
  _id: string;
  content: string;
  author: {
    _id: string;
    username: string;
  };
  reactions: Array<{
    type: string;
    user: {
      _id: string;
      username: string;
    };
  }>;
  createdAt: string;
}

export interface ActivityLogResponse {
  logs: Array<{
    action: string;
    performedBy: {
      _id: string;
      username: string;
    };
    timestamp: string;
  }>;
  currentPage: number;
  totalPages: number;
  totalLogs: number;
}

export const taskService = {
  async updateTaskStatus(
    projectId: string,
    taskId: string,
    status: string
  ): Promise<Task> {
    try {
      const response: AxiosResponse<Task> = await axiosInstance.put(
        `/api/projects/${projectId}/tasks/${taskId}`,
        { status }
      );

      const task = await this.getTaskById(projectId, taskId);
      if (task.assignedTo?.length) {
        await notificationService.createBulkNotifications({
          type: 'task_modified',
          title: 'Task Status Updated',
          message: `Task "${task.title}" status changed to ${status}`,
          projectId,
          taskId,
          recipients: task.assignedTo
        });
      }

      return response.data;
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  },

  async createTask(projectId: string, taskData: CreateTaskData): Promise<Task> {
    try {
      const response: AxiosResponse<Task> = await axiosInstance.post(
        `/api/projects/${projectId}/tasks`,
        taskData
      );
      
      if (taskData.assignedTo?.length) {
        await notificationService.createBulkNotifications({
          type: 'task_assignment',
          title: 'New Task Assignment',
          message: `You have been assigned to task: ${taskData.title}`,
          projectId,
          taskId: response.data._id,
          recipients: taskData.assignedTo
        });
      }

      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  async getTaskById(projectId: string, taskId: string): Promise<Task> {
    try {
      const response: AxiosResponse<Task> = await axiosInstance.get(
        `/api/projects/${projectId}/tasks/${taskId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  },

  async updateTask(projectId: string, taskId: string, taskData: UpdateTaskData): Promise<Task> {
    try {
      const response: AxiosResponse<Task> = await axiosInstance.put(
        `/api/projects/${projectId}/tasks/${taskId}`,
        taskData
      );

      if (taskData.assignedTo) {
        await notificationService.createBulkNotifications({
          type: 'task_modified',
          title: 'Task Updated',
          message: `A task you're assigned to has been updated: ${response.data.title}`,
          projectId,
          taskId,
          recipients: taskData.assignedTo
        });
      }

      if (taskData.dueDate) {
        await notificationService.createBulkNotifications({
          type: 'due_date',
          title: 'Task Due Date Updated',
          message: `Due date changed for task: ${response.data.title}`,
          projectId,
          taskId,
          recipients: response.data.assignedTo || []
        });
      }

      return response.data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  async deleteTask(projectId: string, taskId: string): Promise<void> {
    try {
      await axiosInstance.delete(`/api/projects/${projectId}/tasks/${taskId}`);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  async getTaskComments(projectId: string, taskId: string): Promise<Comment[]> {
    try {
      const response: AxiosResponse<Comment[]> = await axiosInstance.get(
        `/api/projects/${projectId}/tasks/${taskId}/comments`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching task comments:', error);
      throw error;
    }
  },

  async addComment(projectId: string, taskId: string, comment: string): Promise<Comment> {
    try {
      const response: AxiosResponse<Comment> = await axiosInstance.post(
        `/api/projects/${projectId}/tasks/${taskId}/comments`,
        { content: comment }
      );

      const task = await this.getTaskById(projectId, taskId);
      if (task.assignedTo?.length) {
        await notificationService.createBulkNotifications({
          type: 'new_comment',
          title: 'New Comment',
          message: `New comment on task: ${task.title}`,
          projectId,
          taskId,
          recipients: task.assignedTo
        });
      }

      return response.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  async getTaskActivityLog(
    projectId: string,
    taskId: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<ActivityLogResponse> {
    try {
      const response = await axiosInstance.get<ActivityLogResponse>(
        `/api/projects/${projectId}/tasks/${taskId}/activity`,
        {
          params: {
            page,
            pageSize
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching task activity log:', error);
      throw error;
    }
  },

  async getTaskDetails(projectId: string, taskId: string): Promise<Task> {
    try {
      const response: AxiosResponse<Task> = await axiosInstance.get(
        `/api/projects/${projectId}/tasks/${taskId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching task details:', error);
      throw error;
    }
  },

  async addTaskComment(
    projectId: string,
    taskId: string,
    commentData: { content: string }
  ): Promise<TaskComment> {
    try {
      const response: AxiosResponse<TaskComment> = await axiosInstance.post(
        `/api/projects/${projectId}/tasks/${taskId}/comments`,
        commentData
      );
      return response.data;
    } catch (error) {
      console.error('Error adding task comment:', error);
      throw error;
    }
  },

  async addCommentReaction(
    projectId: string,
    taskId: string,
    commentId: string,
    type: string
  ): Promise<TaskComment> {
    try {
      const response: AxiosResponse<TaskComment> = await axiosInstance.post(
        `/api/projects/projects/${projectId}/tasks/${taskId}/comments/${commentId}/reactions`,
        { type }
      );
      return response.data;
    } catch (error) {
      console.error('Error adding comment reaction:', error);
      throw error;
    }
  },

  async getExistingReactionTypes(comment: TaskComment): Promise<string[]> {
    const reactionTypes = new Set<string>();
    comment.reactions?.forEach(reaction => {
      reactionTypes.add(reaction.type);
    });
    return Array.from(reactionTypes);
  }
}; 