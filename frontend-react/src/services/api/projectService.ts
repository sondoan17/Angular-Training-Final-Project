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
    type: string;
  }>;
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
  }
}; 