import { useEffect, useState } from 'react';
import { List, Avatar, Pagination } from 'antd';
import { projectService } from '../../services/api/projectService';
import { formatDistanceToNow } from 'date-fns';

interface ActivityLogProps {
  projectId: string;
}

interface ActivityItem {
  _id: string;
  performedBy: {
    _id: string;
    username: string;
  };
  action: string;
  timestamp: string;
}

const ActivityLog = ({ projectId }: ActivityLogProps) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0
  });

  useEffect(() => {
    loadActivityLog(1);
  }, [projectId]);

  const loadActivityLog = async (page: number) => {
    try {
      setLoading(true);
      const response = await projectService.getProjectActivityLog(projectId, page, pagination.pageSize);
      setActivities(response.logs);
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
    if (action.includes('changed from')) {
      const taskMatch = action.match(/"([^"]+)"/);
      const taskName = taskMatch ? taskMatch[1] : '';
      const statusMatch = action.match(/from "([^"]+)" to "([^"]+)"/);
      const [oldStatus, newStatus] = statusMatch ? [statusMatch[1], statusMatch[2]] : ['', ''];

      return (
        <div>
          <strong className="text-gray-900 dark:text-gray-100">Task: {taskName}</strong>
          <div>
            Status changed from{' '}
            <span className="text-red-500 dark:text-red-400">{oldStatus}</span>
            {' to '}
            <span className="text-green-500 dark:text-green-400">{newStatus}</span>
          </div>
        </div>
      );
    }
    return <div>{action}</div>;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-6 dark:text-gray-200">Activity Log</h3>
      <List
        loading={loading}
        dataSource={activities}
        renderItem={(activity: ActivityItem) => (
          <List.Item className="border-b dark:border-gray-700">
            <List.Item.Meta
              avatar={
                <Avatar>
                  {activity.performedBy.username.charAt(0).toUpperCase()}
                </Avatar>
              }
              title={
                <span className="dark:text-gray-200">
                  {activity.performedBy.username}
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
