import { useState } from 'react';
import { Layout as AntLayout } from 'antd';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const { Content } = AntLayout;

const Layout = () => {
  const { isDarkMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className={`flex h-screen overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={closeSidebar}
        isDarkMode={isDarkMode}
      />
      
      <div className={`flex flex-col flex-1 overflow-hidden transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'md:ml-64' : ''
      }`}>
        <Navbar 
          toggleSidebar={toggleSidebar}
          isDarkMode={isDarkMode}
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-800">
          <div className="w-full max-w-full mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={closeSidebar}
        />
      )}
    </div>
  );
};

export default Layout;
