import axiosInstance from './axiosInstance';
import { AxiosResponse } from 'axios';

interface Project {
  _id: string;
  name: string;
  description: string;
  createdBy: {
    _id: string;
    username: string;
    email?: string;
    name?: string;
  };
  members: Array<{
    _id: string;
    username: string;
    email?: string;
    name?: string;
  }>;
  lastAccessedAt: string;
  createdAt: string;
  updatedAt: string;
  tasks?: Array<{
    _id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    assignedTo?: string;
    dueDate?: string;
  }>;
}

interface ActivityLog {
  activities: Array<{
    _id: string;
    user: {
      _id: string;
      username: string;
      avatar?: string;
    };
    action: string;
    timestamp: string;
  }>;
  total: number;
}

export const projectService = {
  async getUserProjects(): Promise<Project[]> {
    try {
      const response: AxiosResponse<Project[]> = await axiosInstance.get('/api/projects');
      return response.data;
    } catch (error) {
      console.error('Error fetching user projects:', error);
      throw error;
    }
  },

  async getRecentProjects(): Promise<Project[]> {
    try {
      const response: AxiosResponse<Project[]> = await axiosInstance.get('/api/projects/recent');
      return response.data;
    } catch (error) {
      console.error('Error fetching recent projects:', error);
      throw error;
    }
  },

  async createProject(projectData: { name: string; description: string }): Promise<Project> {
    try {
      const response: AxiosResponse<{ message: string; project: Project }> = await axiosInstance.post('/api/projects', projectData);
      return response.data.project;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  async updateProject(projectId: string, projectData: { name: string; description: string }): Promise<Project> {
    try {
      const response: AxiosResponse<Project> = await axiosInstance.put(`/api/projects/${projectId}`, projectData);
      return response.data;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },

  async deleteProject(projectId: string): Promise<void> {
    try {
      await axiosInstance.delete(`/api/projects/${projectId}`);
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  },

  async getProjectDetails(projectId: string): Promise<Project> {
    try {
      const response: AxiosResponse<Project> = await axiosInstance.get(`/api/projects/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching project details:', error);
      throw error;
    }
  },

  async addProjectMembers(projectId: string, memberIds: string[]): Promise<Project> {
    try {
      const response: AxiosResponse<Project> = await axiosInstance.post(
        `/api/projects/${projectId}/members`,
        { memberIds }
      );
      return response.data;
    } catch (error) {
      console.error('Error adding project members:', error);
      throw error;
    }
  },

  async removeProjectMember(projectId: string, memberId: string): Promise<Project> {
    try {
      const response: AxiosResponse<Project> = await axiosInstance.delete(
        `/api/projects/${projectId}/members/${memberId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error removing project member:', error);
      throw error;
    }
  },

  async createTask(projectId: string, taskData: {
    title: string;
    description?: string;
    assignedTo?: string;
    priority: string;
    dueDate?: string;
  }): Promise<Project> {
    try {
      const response: AxiosResponse<Project> = await axiosInstance.post(
        `/api/projects/${projectId}/tasks`,
        taskData
      );
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  async updateTaskStatus(projectId: string, taskId: string, status: string): Promise<Project> {
    try {
      const response = await axiosInstance.put(
        `/api/projects/${projectId}/tasks/${taskId}`,
        { status }
      );
      return response.data.project || response.data;
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  },

  async getProjectActivityLog(projectId: string, page: number): Promise<ActivityLog> {
    try {
      const response: AxiosResponse<ActivityLog> = await axiosInstance.get(
        `/api/projects/${projectId}/activity-log?page=${page}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching activity log:', error);
      throw error;
    }
  }
}; 