import { useState, useEffect } from 'react';
import { List, Badge, Popover, Button, Empty, Spin } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import { notificationService, Notification } from '../../services/api/notificationService';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const NotificationPopover = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const loadNotifications = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const data = await notificationService.getUserNotifications(pageNum);
      if (pageNum === 1) {
        setNotifications(data.notifications);
      } else {
        setNotifications(prev => [...prev, ...data.notifications]);
      }
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await notificationService.markAsRead(notification._id);
      setNotifications(prev =>
        prev.map(n =>
          n._id === notification._id ? { ...n, read: true } : n
        )
      );
    }

    if (notification.taskId) {
      navigate(`/projects/${notification.projectId}/tasks/${notification.taskId}`);
    } else if (notification.projectId) {
      navigate(`/projects/${notification.projectId}`);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const content = (
    <div className="w-80">
      <div className="flex justify-between items-center mb-2 p-2">
        <h3 className="text-lg font-semibold m-0">Notifications</h3>
        {unreadCount > 0 && (
          <Button
            type="link"
            size="small"
            onClick={handleMarkAllAsRead}
            icon={<CheckOutlined />}
          >
            Mark all as read
          </Button>
        )}
      </div>
      <List
        dataSource={notifications}
        loading={loading}
        renderItem={(notification) => (
          <List.Item
            className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
              !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
            }`}
            onClick={() => handleNotificationClick(notification)}
          >
            <List.Item.Meta
              title={notification.title}
              description={
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {notification.message}
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </span>
                </div>
              }
            />
          </List.Item>
        )}
        locale={{
          emptyText: <Empty description="No notifications" />
        }}
      />
      {hasMore && (
        <div className="text-center mt-2">
          <Button
            type="link"
            loading={loading}
            onClick={() => {
              setPage(p => p + 1);
              loadNotifications(page + 1);
            }}
          >
            Load more
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      placement="bottomRight"
      arrow={false}
    >
      <Badge count={unreadCount} offset={[-2, 2]}>
        <Button
          type="text"
          icon={<BellOutlined />}
          className="text-gray-500 dark:text-gray-400"
        />
      </Badge>
    </Popover>
  );
};

export default NotificationPopover; 