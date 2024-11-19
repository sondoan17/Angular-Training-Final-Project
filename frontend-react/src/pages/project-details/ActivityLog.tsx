import { useEffect, useState } from 'react';
import { List, Avatar, Pagination } from 'antd';
import { projectService } from '../../services/api/projectService';
import { formatDistanceToNow } from 'date-fns';

interface ActivityLogProps {
  projectId: string;
}

const ActivityLog = ({ projectId }: ActivityLogProps) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  useEffect(() => {
    loadActivityLog(1);
  }, [projectId]);

  const loadActivityLog = async (page: number) => {
    try {
      setLoading(true);
      const response = await projectService.getProjectActivityLog(projectId, page);
      setActivities(response.activities);
      setPagination({
        ...pagination,
        current: page,
        total: response.total
      });
    } catch (error) {
      console.error('Error loading activity log:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatActivityAction = (action: string) => {
    const changes = action.split('. ');
    return changes.map((change, index) => {
      if (change.includes('changed from')) {
        const [field, values] = change.split(' changed from ');
        const [oldValue, newValue] = values.split(' to ');
        return (
          <div key={index}>
            <strong className="text-gray-900 dark:text-gray-100">{field}</strong>
            {' changed from '}
            <span className="text-red-500 dark:text-red-400">{oldValue}</span>
            {' to '}
            <span className="text-green-500 dark:text-green-400">{newValue}</span>
          </div>
        );
      }
      return <div key={index}>{change}</div>;
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-6 dark:text-gray-200">Activity Log</h3>
      <List
        loading={loading}
        dataSource={activities}
        renderItem={(activity: any) => (
          <List.Item className="border-b dark:border-gray-700">
            <List.Item.Meta
              avatar={
                <Avatar src={activity.user?.avatar || 'https://joeschmoe.io/api/v1/random'} />
              }
              title={
                <span className="dark:text-gray-200">
                  {activity.user?.username || 'Unknown User'}
                </span>
              }
              description={
                <div className="dark:text-gray-400">
                  {formatActivityAction(activity.action)}
                  <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
      />
      <Pagination
        className="mt-6"
        current={pagination.current}
        pageSize={pagination.pageSize}
        total={pagination.total}
        onChange={(page) => loadActivityLog(page)}
      />
    </div>
  );
};

export default ActivityLog;
