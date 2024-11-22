import axiosInstance from './axiosInstance';
import { AxiosResponse } from 'axios';
import { notificationService } from './notificationService';
import { Task } from './taskService';

export interface Project {
  _id: string;
  name: string;
  description: string;
  createdBy: {
    _id: string;
    username: string;
    email?: string;
    name?: string;
  };
  members: {
    _id: string;
    username: string;
    email?: string;
    name?: string;
  }[];
  tasks: Task[];
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt?: Date;
}

export interface CreateProjectData {
  name: string;
  description: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
}

export const projectService = {
  async getAllProjects(): Promise<Project[]> {
    try {
      const response: AxiosResponse<Project[]> = await axiosInstance.get('/api/projects');
      return response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  async getProjectById(projectId: string): Promise<Project> {
    try {
      const response: AxiosResponse<Project> = await axiosInstance.get(
        `/api/projects/${projectId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  },

  async createProject(projectData: CreateProjectData): Promise<Project> {
    try {
      const response: AxiosResponse<Project> = await axiosInstance.post(
        '/api/projects',
        projectData
      );
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  async updateProject(projectId: string, projectData: UpdateProjectData): Promise<Project> {
    try {
      const response: AxiosResponse<Project> = await axiosInstance.put(
        `/api/projects/${projectId}`,
        projectData
      );
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

  async addProjectMembers(projectId: string, memberIds: string[]): Promise<Project> {
    try {
      const response: AxiosResponse<Project> = await axiosInstance.post(
        `/api/projects/${projectId}/members`,
        { memberIds }
      );

      await notificationService.createBulkNotifications({
        type: 'project_update',
        title: 'Added to Project',
        message: `You have been added to project: ${response.data.name}`,
        projectId,
        recipients: memberIds
      });

      return response.data;
    } catch (error) {
      console.error('Error adding project members:', error);
      throw error;
    }
  },

  async removeProjectMember(projectId: string, memberId: string): Promise<void> {
    try {
      await axiosInstance.delete(`/api/projects/${projectId}/members/${memberId}`);
      
      await notificationService.createBulkNotifications({
        type: 'project_update',
        title: 'Removed from Project',
        message: 'You have been removed from a project',
        projectId,
        recipients: [memberId]
      });
    } catch (error) {
      console.error('Error removing project member:', error);
      throw error;
    }
  },

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

  async getProjectDetails(projectId: string): Promise<Project> {
    try {
      const response: AxiosResponse<Project> = await axiosInstance.get(
        `/api/projects/${projectId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching project details:', error);
      throw error;
    }
  },

  async getProjectActivityLog(
    projectId: string, 
    page: number = 1, 
    pageSize: number = 5
  ): Promise<{
    logs: any[];
    currentPage: number;
    totalPages: number;
    totalLogs: number;
  }> {
    try {
      const response: AxiosResponse = await axiosInstance.get(
        `/api/projects/${projectId}/activity?page=${page}&pageSize=${pageSize}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching project activity log:', error);
      throw error;
    }
  }
}; 