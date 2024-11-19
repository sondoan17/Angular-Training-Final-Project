export interface Project {
  _id: string;
  name: string;
  description: string;
  createdBy: {
    _id: string;
    username: string;
  };
  members: Array<{
    _id: string;
    username: string;
    email?: string;
    name?: string;
    avatar?: string;
  }>;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
  lastAccessedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'Not Started' | 'In Progress' | 'Stuck' | 'Done';
  priority: 'none' | 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string[];
  dueDate?: string;
  type?: 'task' | 'bug';
  timeline?: {
    start: string;
    end: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectState {
  allProjects: Project[];
  recentProjects: Project[];
  isLoading: boolean;
  error: string | null;
} 