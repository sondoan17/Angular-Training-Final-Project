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
  members: Array<{
    _id: string;
    username: string;
    email?: string;
    name?: string;
  }>;
  lastAccessedAt: string;
  createdAt: string;
  updatedAt: string;
  tasks?: Array<Task>;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  type: string;
}

export interface ProjectState {
  allProjects: Project[];
  recentProjects: Project[];
  isLoading: boolean;
  error: string | null;
} 