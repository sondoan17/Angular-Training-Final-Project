import { useState, useEffect, useCallback } from 'react';
import { Input, Select, Button, Spin, Card } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash/debounce';
import { searchService } from '../../services/api/searchService';

const { Option } = Select;

interface SearchResult {
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

interface SearchFilters {
  status: string;
  priority: string;
  type: string;
}

const Search = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    status: '',
    priority: '',
    type: ''
  });

  const statuses = ['Not Started', 'In Progress', 'Stuck', 'Done'];
  const priorities = ['Critical', 'High', 'Medium', 'Low'];
  const types = ['task', 'bug'];

  const performSearch = useCallback(
    debounce(async (term: string, searchFilters: SearchFilters) => {
      if (!term.trim()) {
        setResults([]);
        return;
      }

      try {
        setIsLoading(true);
        const searchResults = await searchService.search(term, searchFilters);
        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    performSearch(searchTerm, filters);
    return () => {
      performSearch.cancel();
    };
  }, [searchTerm, filters, performSearch]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getStatusClass = (status: string): string => {
    switch (status) {
      case 'Not Started': return 'bg-gray-500 text-white';
      case 'In Progress': return 'bg-blue-500 text-white';
      case 'Stuck': return 'bg-red-500 text-white';
      case 'Done': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPriorityClass = (priority: string): string => {
    switch (priority?.toLowerCase()) {
      case 'low': return 'bg-green-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'critical': return 'bg-purple-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
          {/* Search Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Search
            </h1>
            <Button
              icon={<FilterOutlined />}
              onClick={() => setIsFiltersVisible(!isFiltersVisible)}
              className="self-end"
            >
              Filters
            </Button>
          </div>

          {/* Search Input */}
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search projects and tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
            size="large"
          />

          {/* Filters */}
          {isFiltersVisible && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 animate-slideDown">
              <Select
                placeholder="Status"
                allowClear
                className="w-full"
                value={filters.status}
                onChange={(value) => handleFilterChange('status', value)}
              >
                {statuses.map(status => (
                  <Option key={status} value={status}>{status}</Option>
                ))}
              </Select>

              <Select
                placeholder="Priority"
                allowClear
                className="w-full"
                value={filters.priority}
                onChange={(value) => handleFilterChange('priority', value)}
              >
                {priorities.map(priority => (
                  <Option key={priority} value={priority}>{priority}</Option>
                ))}
              </Select>

              <Select
                placeholder="Type"
                allowClear
                className="w-full"
                value={filters.type}
                onChange={(value) => handleFilterChange('type', value)}
              >
                {types.map(type => (
                  <Option key={type} value={type}>{type}</Option>
                ))}
              </Select>
            </div>
          )}

          {/* Results */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Spin size="large" />
              </div>
            ) : (
              results.map((result) => (
                <Card
                  key={result._id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    if (result.type === 'project') {
                      navigate(`/projects/${result._id}`);
                    } else {
                      navigate(`/projects/${result.projectId}/tasks/${result._id}`);
                    }
                  }}
                >
                  <div className="flex flex-col gap-2">
                    {result.type === 'project' ? (
                      <>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {result.name}
                        </h3>
                        <span className="text-sm text-gray-500">Project</span>
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {result.title}
                        </h3>
                        <span className="text-sm text-gray-500">
                          Task in {result.projectName}
                        </span>
                        <div className="flex gap-2 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(result.status!)}`}>
                            {result.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${getPriorityClass(result.priority!)}`}>
                            {result.priority}
                          </span>
                        </div>
                      </>
                    )}
                    {result.description && (
                      <p className="text-gray-600 dark:text-gray-300 line-clamp-2 mt-2">
                        {result.description}
                      </p>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search; 