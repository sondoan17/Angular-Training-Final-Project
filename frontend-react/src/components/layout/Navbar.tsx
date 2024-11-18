import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Avatar, Dropdown, Button } from 'antd';
import { 
  MenuOutlined, 
  SearchOutlined, 
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SunOutlined,
  MoonOutlined 
} from '@ant-design/icons';
import { useTheme } from '../../context/ThemeContext';

interface NavbarProps {
  toggleSidebar: () => void;
  isDarkMode: boolean;
}

const Navbar = ({ toggleSidebar, isDarkMode }: NavbarProps) => {
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userMenuItems = [
    {
      key: 'profile',
      label: 'Profile',
      icon: <UserOutlined />,
      onClick: () => navigate('/profile')
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: () => navigate('/login')
    }
  ];

  return (
    <nav className={`shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={toggleSidebar}
              className={`p-2 rounded-md ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            />
            <div className="flex-shrink-0 flex items-center ml-4">
              <img
                className="h-8 w-auto"
                src="https://res.cloudinary.com/db2tvcbza/image/upload/v1730869163/logo_sfhhhd.png"
                alt="Logo"
                crossOrigin="anonymous"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <Input
                prefix={<SearchOutlined className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />}
                placeholder="Search projects and tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-64 transition-all duration-300 ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''
                }`}
              />
            </div>

            <Button
              type="text"
              icon={<SearchOutlined />}
              className={`md:hidden ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
              onClick={() => setShowMobileSearch(!showMobileSearch)}
            />

            <Button
              type="text"
              icon={<BellOutlined />}
              className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}
            />

            <Button
              type="text"
              icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
              onClick={toggleTheme}
              className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}
            />

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Avatar
                src={`https://ui-avatars.com/api/?name=${user?.username}&background=random`}
                className="cursor-pointer"
              />
            </Dropdown>
          </div>
        </div>

        {showMobileSearch && (
          <div className="md:hidden pb-2 px-2">
            <Input
              prefix={<SearchOutlined className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />}
              placeholder="Search projects and tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
            />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
