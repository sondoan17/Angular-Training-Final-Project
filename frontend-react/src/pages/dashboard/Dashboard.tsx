import { useEffect, useState, useMemo } from "react";
import { Card, Grid, Typography, Button, Spin, Empty, message, Skeleton } from "antd";
import {
  PlusOutlined,
  TeamOutlined,

  FieldTimeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import CreateProjectDialog from "./CreateProjectDialog";
import EditProjectDialog from "./EditProjectDialog";
import ConfirmDialog from "../../components/shared/ConfirmDialog";
import { useTheme } from "../../context/ThemeContext";
import { projectService } from "../../services/api/projectService";
import { useAuth } from "../../hooks/useAuth";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProjects,
  fetchRecentProjects,
} from "../../store/slices/projectsSlice.ts";
import { RootState } from "../../store/store";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const Dashboard = () => {
  const { isDarkMode } = useTheme();
  const { user, isInitialized } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { allProjects, recentProjects, isLoading } = useSelector(
    (state: RootState) => state.projects
  );
  console.log(allProjects);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Wait for user data to be available
    if (user?.id) {
      setIsUserLoaded(true);
      dispatch(fetchProjects())
        .unwrap()
        .then((result) => {
          console.log('Fetched Projects:', result);
          dispatch(fetchRecentProjects());
        })
        .catch((error) => {
          console.error('Error loading projects:', error);
          message.error('Failed to load projects');
        });
    }
  }, [dispatch, user?.id, navigate]);

  const createdProjects = useMemo(() => {
    if (!user?.id || !allProjects) return [];
    
    return allProjects.filter(project => 
      project?.createdBy?._id.toString() === user.id.toString()
    );
  }, [allProjects, user?.id]);

  const memberProjects = useMemo(() => {
    if (!user?.id || !allProjects) return [];
    
    return allProjects.filter(project => 
      project?.createdBy?._id.toString() !== user.id.toString() && 
      project?.members?.some(m => m?._id.toString() === user.id.toString())
    );
  }, [allProjects, user?.id]);

  const handleCreateProject = async (projectData) => {
    try {
      await projectService.createProject(projectData);
      message.success("Project created successfully");
      dispatch(fetchProjects());
      setCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating project:", error);
      message.error("Failed to create project");
    }
  };

  const handleEditProject = async (projectData) => {
    try {
      await projectService.updateProject(selectedProject?._id, projectData);
      message.success("Project updated successfully");
      dispatch(fetchProjects());
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating project:", error);
      message.error("Failed to update project");
    }
  };

  const handleDeleteProject = async () => {
    try {
      await projectService.deleteProject(selectedProject?._id);
      message.success("Project deleted successfully");
      dispatch(fetchProjects());
      setConfirmDialogOpen(false);
    } catch (error) {
      console.error("Error deleting project:", error);
      message.error("Failed to delete project");
    }
  };

  const cardClassName = `
    group 
    ${
      isDarkMode
        ? "bg-gray-700 hover:bg-gray-600"
        : "bg-gray-50 hover:bg-gray-100"
    } 
    rounded-xl p-5 
    transition-all duration-300 
    flex flex-col h-full
  `;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const ProjectCard = ({ project, isOwner = false }) => (
    <div className={cardClassName}>
      <div className="flex justify-between items-start mb-3">
        <h3
          className={`text-lg font-semibold truncate ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          {project.name}
        </h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            isOwner
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          }`}
        >
          {isOwner ? "Owner" : "Member"}
        </span>
      </div>
      <div className="flex-grow">
        <p
          className={`text-sm mb-4 line-clamp-2 ${
            isDarkMode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          {project.description}
        </p>
      </div>
      <div className="mt-auto pt-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div
              className={`flex items-center text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              <TeamOutlined className="mr-1" />
              <span>{project.members.length}</span>
            </div>
            <div
              className={`flex items-center text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              <FieldTimeOutlined className="mr-1" />
              <span>
                {new Date(project.lastAccessedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <Button
            type="link"
            onClick={() => navigate(`/projects/${project._id}`)}
            className={`font-medium text-sm ${
              isDarkMode
                ? "text-blue-400 hover:text-blue-300"
                : "text-blue-600 hover:text-blue-800"
            }`}
          >
            View →
          </Button>
        </div>
      </div>
    </div>
  );

  // Create loading cards component
  const LoadingCards = ({ count = 3 }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, index) => (
        <Card key={index} className={isDarkMode ? "bg-gray-800" : "bg-white"}>
          <Skeleton active paragraph={{ rows: 2 }} />
        </Card>
      ))}
    </div>
  );

  return (
    <div
      className={`min-h-screen ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 to-gray-800 text-white"
          : "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Greeting Section */}
        <div className="mb-10">
          <Title
            level={1}
            className={`text-4xl font-bold mb-2 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {getGreeting()}, {user?.username}
          </Title>
          <Text className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
            Welcome back to your project dashboard
          </Text>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Spin size="large" />
          </div>
        ) : (
          <div className="space-y-10">
            {/* Recently Viewed Section */}
            <div className={`rounded-2xl shadow-sm p-6 mb-6 border ${
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
            }`}>
              <Title level={2} className={isDarkMode ? "text-white" : "text-gray-900"}>
                Recently Viewed
              </Title>
              {isLoading ? (
                <LoadingCards count={3} />
              ) : recentProjects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentProjects.map((project) => (
                    <ProjectCard key={project._id} project={project} />
                  ))}
                </div>
              ) : (
                <Empty description="No recent projects" />
              )}
            </div>

            {/* Your Projects Section */}
            <section className={`p-6 rounded-xl shadow-sm ${
              isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <div className="flex justify-between items-center mb-6">
                <Title level={2} className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                  Your Projects
                </Title>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setCreateDialogOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Create Project
                </Button>
              </div>
              {isLoading ? (
                <LoadingCards />
              ) : createdProjects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {createdProjects.map((project) => (
                    <ProjectCard 
                      key={project._id} 
                      project={project}
                      isOwner={true}
                    />
                  ))}
                </div>
              ) : (
                <Empty description="No projects created yet" />
              )}
            </section>

            {/* Projects You're In Section */}
            <div className={`rounded-2xl shadow-sm p-6 border ${
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
            }`}>
              <Title level={2} className={isDarkMode ? "text-white" : "text-gray-900"}>
                Projects You're In
              </Title>
              {isLoading ? (
                <LoadingCards count={3} />
              ) : memberProjects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {memberProjects.map((project) => (
                    <ProjectCard key={project._id} project={project} isOwner={false} />
                  ))}
                </div>
              ) : (
                <Empty description="You're not a member of any projects" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <CreateProjectDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateProject}
        isDarkMode={isDarkMode}
      />
      <EditProjectDialog
        open={editDialogOpen}
        project={selectedProject}
        onClose={() => setEditDialogOpen(false)}
        onSubmit={handleEditProject}
        isDarkMode={isDarkMode}
      />
      <ConfirmDialog
        open={confirmDialogOpen}
        title="Delete Project"
        message={`Are you sure you want to delete "${selectedProject?.name}"?`}
        onConfirm={handleDeleteProject}
        onClose={() => setConfirmDialogOpen(false)}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default Dashboard;
