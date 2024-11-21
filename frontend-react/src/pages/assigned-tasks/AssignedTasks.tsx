import { useState, useEffect } from 'react';
import { Spin, Select, Button, Card, Tooltip } from 'antd';
import { SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import { projectService } from '../../services/api/projectService';
import { useNavigate } from 'react-router-dom';

type SortOption = 'status' | 'priority' | 'title';
type SortDirection = 'asc' | 'desc';
type TaskStatus = 'Not Started' | 'In Progress' | 'Stuck' | 'Done';
type TaskPriority = 'Critical' | 'High' | 'Medium' | 'Low';

interface TasksByProject {
  [projectId: string]: {
    projectName: string;
    tasks: any[];
  };
}

const AssignedTasks = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [tasksByProject, setTasksByProject] = useState<TasksByProject>({});
  const [sortBy, setSortBy] = useState<SortOption>('status');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const sortOptions = [
    { value: 'status', label: 'Status' },
    { value: 'priority', label: 'Priority' },
    { value: 'title', label: 'Title' }
  ];

  useEffect(() => {
    loadAssignedTasks();
  }, []);

  const loadAssignedTasks = async () => {
    try {
      setIsLoading(true);
      const tasks = await projectService.getAssignedTasks();
      organizeTasksByProject(tasks);
    } catch (error) {
      console.error('Error loading assigned tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const organizeTasksByProject = (tasks: any[]) => {
    const organized = tasks.reduce((acc, task) => {
      if (!acc[task.projectId]) {
        acc[task.projectId] = {
          projectName: task.projectName,
          tasks: [],
        };
      }
      acc[task.projectId].tasks.push(task);
      return acc;
    }, {} as TasksByProject);

    setTasksByProject(organized);
    sortTasks(organized);
  };

  const compareStatus = (a: string, b: string): number => {
    const statusOrder: Record<TaskStatus, number> = {
      'Not Started': 0,
      'In Progress': 1,
      'Stuck': 2,
      'Done': 3
    };
    return (statusOrder[a as TaskStatus] ?? 0) - (statusOrder[b as TaskStatus] ?? 0);
  };

  const comparePriority = (a: string, b: string): number => {
    const priorityOrder: Record<string, number> = {
      'critical': 0,
      'high': 1,
      'medium': 2,
      'low': 3
    };
    return (priorityOrder[a.toLowerCase()] ?? 999) - (priorityOrder[b.toLowerCase()] ?? 999);
  };

  const sortTasks = (currentTasks: TasksByProject = tasksByProject) => {
    const sorted = Object.entries(currentTasks).reduce((acc, [projectId, project]) => {
      const sortedTasks = [...project.tasks].sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
          case 'status':
            comparison = compareStatus(a.status, b.status);
            break;
          case 'priority':
            comparison = comparePriority(a.priority, b.priority);
            break;
          case 'title':
            comparison = a.title.localeCompare(b.title);
            break;
        }
        return sortDirection === 'asc' ? comparison : -comparison;
      });

      acc[projectId] = {
        ...project,
        tasks: sortedTasks
      };
      return acc;
    }, {} as TasksByProject);

    setTasksByProject(sorted);
  };

  const getStatusClass = (status: string): string => {
    switch (status) {
      case 'Not Started':
        return 'bg-gray-500 text-white';
      case 'In Progress':
        return 'bg-blue-500 text-white';
      case 'Stuck':
        return 'bg-red-500 text-white';
      case 'Done':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getPriorityClass = (priority: string): string => {
    switch (priority.toLowerCase()) {
      case 'low':
        return 'bg-green-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'critical':
        return 'bg-purple-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Tasks Assigned to You
            </h2>

            <div className="flex items-center gap-4 w-full sm:w-auto">
              <Select
                className="w-full sm:w-48"
                value={sortBy}
                onChange={(value) => {
                  setSortBy(value as SortOption);
                  sortTasks();
                }}
                options={sortOptions}
              />

              <Tooltip title={`Sort ${sortDirection === 'asc' ? 'Ascending' : 'Descending'}`}>
                <Button
                  icon={sortDirection === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
                  onClick={() => {
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    sortTasks();
                  }}
                />
              </Tooltip>
            </div>
          </div>

          {/* Task Statistics */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-4">
            {/* Add task statistics components here */}
          </div>
        </div>

        {/* Project Tasks */}
        {Object.entries(tasksByProject).map(([projectId, project]) => (
          <div key={projectId} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                {project.projectName}
              </h3>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {project.tasks.map((task) => (
                <Card
                  key={task._id}
                  className="dark:bg-gray-700 hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/projects/${task.projectId}/tasks/${task._id}`)}
                >
                  <h4 className="text-lg font-semibold mb-2 dark:text-gray-100">{task.title}</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{task.description}</p>
                  <div className="flex justify-between items-center">
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusClass(task.status)}`}>
                      {task.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm ${getPriorityClass(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignedTasks; 