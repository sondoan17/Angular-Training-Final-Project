import axiosInstance from './axiosInstance';
import { AxiosResponse } from 'axios';

export interface SearchResult {
  type: 'project' | 'task';
  _id: string;
  name?: string;
  title?: string;
  description: string;
  status?: string;
  priority?: string;
  projectId?: string;
  projectName?: string;
}

export interface SearchFilters {
  status?: string;
  priority?: string;
  type?: string;
}

export const searchService = {
  async search(term: string, filters: SearchFilters = {}): Promise<SearchResult[]> {
    try {
      const params = new URLSearchParams({
        term,
        ...(filters.status && { status: filters.status }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.type && { type: filters.type })
      });

      const response: AxiosResponse<SearchResult[]> = await axiosInstance.get(
        `/api/search?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Error performing search:', error);
      throw error;
    }
  }
}; 