import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Avatar, Dropdown, Button, List } from 'antd';
import debounce from 'lodash/debounce';
import { 
  MenuOutlined, 
  SearchOutlined, 
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SunOutlined,
  MoonOutlined,
  FolderOutlined,
  CheckSquareOutlined
} from '@ant-design/icons';
import { useTheme } from '../../context/ThemeContext';
import { searchService } from '../../services/api/searchService';
import type { SearchResult } from '../../services/api/searchService';
import NotificationPopover from '../notifications/NotificationPopover';

interface NavbarProps {
  toggleSidebar: () => void;
  isDarkMode: boolean;
}

const Navbar = ({ toggleSidebar, isDarkMode }: NavbarProps) => {
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = useCallback(
    debounce(async (term: string) => {
      if (!term.trim()) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      try {
        setIsSearching(true);
        const results = await searchService.search(term);
        setSearchResults(results.slice(0, 5)); // Show only first 5 results
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    performSearch(value);
  };

  const handleResultClick = (result: SearchResult) => {
    setShowResults(false);
    setSearchTerm('');
    if (result.type === 'project') {
      navigate(`/projects/${result._id}`);
    } else {
      navigate(`/projects/${result.projectId}/tasks/${result._id}`);
    }
  };

  const renderSearchResults = () => (
    <div className={`
      absolute top-full left-0 w-[400px] mt-2 
      bg-white dark:bg-gray-800 
      rounded-lg shadow-lg 
      border border-gray-200 dark:border-gray-700 
      z-50 overflow-hidden
      transform origin-top
      animate-dropdown
    `}>
      <List
        loading={isSearching}
        dataSource={searchResults}
        renderItem={(result) => (
          <List.Item
            className="border-b last:border-b-0 border-gray-100 dark:border-gray-700 
                      hover:bg-gray-50 dark:hover:bg-gray-700 
                      transition-colors duration-150 cursor-pointer"
            onClick={() => handleResultClick(result)}
          >
            <div className="flex items-center gap-3 px-4 py-3 w-full">
              <div className={`
                flex-shrink-0 w-8 h-8 rounded-lg 
                ${result.type === 'project' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-green-100 dark:bg-green-900'}
                flex items-center justify-center
              `}>
                {result.type === 'project' ? (
                  <FolderOutlined className="text-blue-600 dark:text-blue-400" />
                ) : (
                  <CheckSquareOutlined className="text-green-600 dark:text-green-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {result.type === 'project' ? result.name : result.title}
                </div>
                {result.type === 'task' && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    in {result.projectName}
                  </div>
                )}
              </div>
            </div>
          </List.Item>
        )}
        locale={{
          emptyText: (
            <div className="py-8 text-center">
              <SearchOutlined className="text-2xl text-gray-400 dark:text-gray-600 mb-2" />
              <div className="text-gray-500 dark:text-gray-400">
                {searchTerm ? 'No results found' : 'Type to search...'}
              </div>
            </div>
          )
        }}
      />
      {searchResults.length > 0 && (
        <div className="p-3 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="link"
            block
            onClick={() => {
              navigate(`/search?term=${encodeURIComponent(searchTerm)}`);
              setShowResults(false);
              setSearchTerm('');
            }}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
          >
            View all results
          </Button>
        </div>
      )}
    </div>
  );

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
            <div className="relative hidden md:block" ref={searchRef}>
              <Input
                prefix={<SearchOutlined className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />}
                placeholder="Search projects and tasks..."
                value={searchTerm}
                onChange={handleSearchChange}
                className={`w-64 transition-all duration-300 ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''
                }`}
              />
              {showResults && renderSearchResults()}
            </div>

            <Button
              type="text"
              icon={<SearchOutlined />}
              className={`md:hidden ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
              onClick={() => setShowMobileSearch(!showMobileSearch)}
            />

            <NotificationPopover />

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
              onChange={handleSearchChange}
              className={`w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
            />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
