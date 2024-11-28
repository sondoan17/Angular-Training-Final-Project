import { useState, useEffect, useRef } from 'react';
import { Card, Badge, Button, Drawer } from 'antd';
import { MessageOutlined, CloseOutlined } from '@ant-design/icons';
import Chat from './Chat';
import { useAuth } from '../../hooks/useAuth';
import { socket } from '../../services/socket';
import './ChatBox.css';
const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    socket.on('newMessage', () => {
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    });

    return () => {
      socket.off('newMessage');
    };
  }, [isAuthenticated, isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Floating chat button */}
      <Button
        type="primary"
        shape="circle"
        size="large"
        icon={
          <Badge count={unreadCount}>
            <MessageOutlined style={{ fontSize: '24px' }} />
          </Badge>
        }
        onClick={handleOpen}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          zIndex: 1000
        }}
      />

      {/* Chat drawer */}
      <Drawer
        title="Messages"
        placement="right"
        onClose={() => setIsOpen(false)}
        open={isOpen}
        width={380}
        closeIcon={<CloseOutlined />}
        bodyStyle={{ padding: 0 }}
      >
        <Chat />
      </Drawer>
    </>
  );
};

export default ChatBox; 