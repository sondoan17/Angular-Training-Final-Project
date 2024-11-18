import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Button, theme, message } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  SearchOutlined,
  FolderOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { projectService } from '../../services/api/projectService';
import { useAuth } from '../../hooks/useAuth';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects } from '../../store/slices/projectsSlice';
import { RootState } from '../../store/store';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

interface Project {
  _id: string;
  name: string;
  createdBy: {
    _id: string;
    username: string;
  };
}

const Sidebar = ({ isOpen, onClose, isDarkMode }: SidebarProps) => {
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { allProjects, isLoading } = useSelector((state: RootState) => state.projects);

  useEffect(() => {
    if (user?.id) {
      const lastFetch = localStorage.getItem('lastProjectsFetch');
      const now = new Date().getTime();
      
      if (!lastFetch || now - parseInt(lastFetch) > 5 * 60 * 1000) {
        dispatch(fetchProjects());
        localStorage.setItem('lastProjectsFetch', now.toString());
      }
    }
  }, [dispatch, user?.id]);

  const handleCreateProject = () => {
    
    navigate('/dashboard');
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/dashboard')
    },
    {
      key: 'assigned',
      icon: <UserOutlined />,
      label: 'Assigned to me',
      onClick: () => navigate('/assigned-tasks')
    },
    {
      key: 'search',
      icon: <SearchOutlined />,
      label: 'Search',
      onClick: () => navigate('/search')
    },
    {
      type: 'divider'
    },
    {
      key: 'projects',
      label: 'My Projects',
      type: 'group',
      children: allProjects.map(project => ({
        key: project._id,
        icon: <FolderOutlined />,
        label: project.name,
        onClick: () => navigate(`/projects/${project._id}`)
      }))
    }
  ];

  return (
    <>
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
      >
        <div className="h-full flex flex-col">
          <Menu
            mode="inline"
            items={menuItems}
            className={`flex-1 border-r-0 ${
              isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'
            }`}
            theme={isDarkMode ? 'dark' : 'light'}
          />
          
          <div className="p-4">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              block
              onClick={handleCreateProject}
              className={isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              New Project
            </Button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
};

export default Sidebar;
