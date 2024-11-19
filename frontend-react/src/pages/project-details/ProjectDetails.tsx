import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Spin, message, Card, Grid, Typography, Space } from 'antd';
import { ArrowLeftOutlined, EditOutlined, TeamOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { useDispatch } from 'react-redux';
import { updateTaskStatus } from '../../store/slices/projectsSlice';
import EditProjectDialog from './EditProjectDialog';
import ProjectMembersDialog from './ProjectMemberDialog';
import CreateTaskDialog from './CreateTaskDialog';
import KanbanBoard from '../../components/KanbanBoard/KanbanBoard';
import ProjectProgress from './ProjectProgress';
import ActivityLog from './ActivityLog';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { Project, Task } from '../../types/project.types';
import { projectService } from '../../services/api/projectService';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  console.log(user?.id)
  const dispatch = useDispatch();
  const screens = useBreakpoint();

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isProjectCreator, setIsProjectCreator] = useState(false);
  const [isActivityLogVisible, setIsActivityLogVisible] = useState(false);

  useEffect(() => {
    if (id && user?.id) {
      loadProjectDetails();
    }
  }, [id, user?.id]);

  const loadProjectDetails = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const projectData = await projectService.getProjectDetails(id);
      
      const normalizedTasks = projectData.tasks?.map(task => ({
        _id: task._id,
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority || 'Medium',
        assignedTo: task.assignedTo || [],
        dueDate: task.dueDate,
        type: task.type || 'task',
        timeline: task.timeline
      }));
      
      setProject({
        ...projectData,
        tasks: normalizedTasks
      });
      setIsProjectCreator(user?.id === projectData.createdBy?._id);
    } catch (error) {
      console.error('Error loading project:', error);
      message.error('Failed to load project details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProject = async (projectData: { name: string; description: string }) => {
    if (!id) return;

    try {
      await projectService.updateProject(id, projectData);
      message.success('Project updated successfully');
      loadProjectDetails();
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating project:', error);
      message.error('Failed to update project');
    }
  };

  const handleDeleteProject = async () => {
    if (!id) return;

    try {
      await projectService.deleteProject(id);
      message.success('Project deleted successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting project:', error);
      message.error('Failed to delete project');
    }
  };

  const handleTaskMoved = async (task: Task, newStatus: string) => {
    if (!isProjectCreator || !id || !project) return;

    try {
      // Store original state
      const originalProject = { ...project };

      // Optimistically update local state
      const updatedTasks = project.tasks.map(t => 
        t._id === task._id ? { ...t, status: newStatus } : t
      );
      
      setProject({
        ...project,
        tasks: updatedTasks
      });

      // Make API call
      const updatedProject = await projectService.updateTaskStatus(id, task._id, newStatus);

      // Update local state with server response
      if (updatedProject) {
        await loadProjectDetails(); // Reload the entire project details
        message.success('Task status updated successfully');
      }
    } catch (error) {
      console.error('Error moving task:', error);
      message.error('Failed to update task status');
      setProject(originalProject); // Revert to original state
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
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/dashboard')}
          className="mb-4 flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
        >
          Back to Dashboard
        </Button>

        {project && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            {/* Project Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {project.name}
              </h2>
              <div className="flex space-x-3">
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => setEditDialogOpen(true)}
                  className="bg-blue-600"
                />
                <Button
                  type="primary"
                  icon={<TeamOutlined />}
                  onClick={() => setMembersDialogOpen(true)}
                  className="bg-green-600"
                />
                {isProjectCreator && (
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => setConfirmDeleteOpen(true)}
                  />
                )}
              </div>
            </div>

            {/* Project Info */}
            <div className="mb-6 text-gray-600 dark:text-gray-300">
              <p>Created by: {project.createdBy?.username || 'Unknown'}</p>
              <p>Created at: {new Date(project.createdAt).toLocaleDateString()}</p>
              <p className="mt-2">{project.description}</p>
            </div>

            {/* Project Content */}
            {project && (
              <>
                <KanbanBoard
                  tasks={project?.tasks || []}
                  onTaskMove={handleTaskMoved}
                  onAddTask={() => setCreateTaskDialogOpen(true)}
                  onTaskClick={(taskId) => navigate(`/projects/${id}/tasks/${taskId}`)}
                  isProjectCreator={isProjectCreator}
                />
                
                <div className="mt-8">
                  <ProjectProgress tasks={project?.tasks || []} />
                </div>

                <ActivityLog projectId={id} />
              </>
            )}
          </div>
        )}

        {/* Dialogs */}
        <EditProjectDialog
          open={editDialogOpen}
          project={project}
          onClose={() => setEditDialogOpen(false)}
          onSubmit={handleEditProject}
        />
        <ProjectMembersDialog
          open={membersDialogOpen}
          project={project}
          onClose={() => setMembersDialogOpen(false)}
          onMembersUpdated={loadProjectDetails}
        />
        <CreateTaskDialog
          open={createTaskDialogOpen}
          projectId={id}
          onClose={() => setCreateTaskDialogOpen(false)}
          onTaskCreated={loadProjectDetails}
        />
        <ConfirmDialog
          open={confirmDeleteOpen}
          title="Delete Project"
          message={`Are you sure you want to delete "${project?.name}"?`}
          onConfirm={handleDeleteProject}
          onClose={() => setConfirmDeleteOpen(false)}
        />
      </div>
    </div>
  );
};

export default ProjectDetails;
