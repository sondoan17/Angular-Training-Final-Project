import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Input, Button, Avatar, Tabs, Badge, Empty, message as antMessage } from 'antd';
import { SendOutlined, UserOutlined, SearchOutlined } from '@ant-design/icons';
import { socket } from '../../services/socket';
import type { TabsProps } from 'antd';
import { userService } from '../../services/api/userService';
import axiosInstance from '../../services/api/axiosInstance';

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    username: string;
  };
  receiver: {
    _id: string;
    username: string;
  };
  createdAt: string;
}

interface RecentChat {
  userId: string;
  username: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
}

const Chat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState<{id: string; username: string} | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<{id: string; username: string}[]>([]);
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  const [searchUsername, setSearchUsername] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch recent chats from API using axiosInstance
    const fetchRecentChats = async () => {
      try {
        const response = await axiosInstance.get('/api/messages/conversations');
        const conversations = response.data.map((conv: any) => ({
          userId: conv.otherUser._id,
          username: conv.otherUser.username,
          lastMessage: conv.lastMessage.content,
          timestamp: new Date(conv.lastMessage.createdAt).toLocaleString(),
          unread: conv.unreadCount
        }));
        setRecentChats(conversations);
      } catch (error) {
        console.error('Error fetching recent chats:', error);
        antMessage.error('Failed to load recent conversations');
      }
    };

    fetchRecentChats();
  }, []);

  const handleSearch = async () => {
    if (!searchUsername.trim()) return;
    
    try {
      const foundUser = await userService.findUserByUsername(searchUsername);
      if (foundUser) {
        setSelectedUser({ id: foundUser._id, username: foundUser.username });
        
        // Use axiosInstance which includes auth headers
        const chatResponse = await axiosInstance.get(`/api/messages/${foundUser._id}`);
        setMessages(chatResponse.data);
        antMessage.success('User found!');
      }
    } catch (error) {
      console.error('Error searching user:', error);
      antMessage.error('Failed to search user');
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !selectedUser || !user?.id) return;

    try {
      const response = await axiosInstance.post('/api/messages/send', {
        receiverId: selectedUser.id,
        content: message.trim()
      });

      setMessages(prev => [...prev, response.data]);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      antMessage.error('Failed to send message');
    }
  };

  // Add this useEffect to handle incoming messages
  useEffect(() => {
    socket.on('newMessage', (message: Message) => {
      setMessages(prev => [...prev, message]);
      
      // Update recent chats
      const updatedChat: RecentChat = {
        userId: message.sender._id,
        username: message.sender.username,
        lastMessage: message.content,
        timestamp: message.createdAt,
        unread: 1
      };

      setRecentChats(prev => {
        const existing = prev.findIndex(chat => chat.userId === message.sender._id);
        if (existing !== -1) {
          const newChats = [...prev];
          newChats[existing] = {
            ...newChats[existing],
            lastMessage: message.content,
            timestamp: message.createdAt,
            unread: newChats[existing].unread + 1
          };
          return newChats;
        }
        return [updatedChat, ...prev];
      });
    });

    return () => {
      socket.off('newMessage');
    };
  }, []);

  const handleSelectUser = async (userId: string, username: string) => {
    setSelectedUser({ id: userId, username });
    
    try {
      // Load chat history
      const chatResponse = await axiosInstance.get(`/api/messages/${userId}`);
      setMessages(chatResponse.data);
    } catch (error) {
      console.error('Error loading chat history:', error);
      antMessage.error('Failed to load chat history');
    }
  };

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Recent Chats',
      children: (
        <div className="h-[200px] overflow-y-auto">
          {recentChats.length === 0 ? (
            <Empty description="No recent chats" className="mt-8" />
          ) : (
            recentChats.map((chat) => (
              <div
                key={chat.userId}
                onClick={() => handleSelectUser(chat.userId, chat.username)}
                className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 
                  ${selectedUser?.id === chat.userId ? 'bg-blue-50' : ''}`}
              >
                <Avatar icon={<UserOutlined />} className="mr-3" />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="font-medium">{chat.username}</span>
                    <span className="text-xs text-gray-500">{chat.timestamp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 truncate">{chat.lastMessage}</span>
                    {chat.unread > 0 && (
                      <Badge count={chat.unread} className="ml-2" />
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ),
    },
    {
      key: '2',
      label: 'Search User',
      children: (
        <div className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter username"
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              onPressEnter={handleSearch}
              prefix={<SearchOutlined className="text-gray-400" />}
            />
            <Button onClick={handleSearch} type="primary">
              Search
            </Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <Tabs items={items} className="px-4" />
      
      <div className="flex-1 flex flex-col p-4">
        {selectedUser ? (
          <>
            <div className="bg-gray-100 p-2 rounded-lg mb-4">
              <span className="font-medium">Chatting with: </span>
              {selectedUser.username}
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${msg.sender._id === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      msg.sender._id === user?.id
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-gray-100 rounded-bl-none'
                    }`}
                  >
                    <div>{msg.content}</div>
                    <div className={`text-xs mt-1 ${
                      msg.sender._id === user?.id ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a chat or search for a user to start messaging
          </div>
        )}
        
        <div className="flex gap-2 pt-4 border-t">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onPressEnter={sendMessage}
            placeholder="Type a message..."
            disabled={!selectedUser}
            className="rounded-full"
          />
          <Button 
            type="primary"
            icon={<SendOutlined />}
            onClick={sendMessage}
            disabled={!selectedUser}
            className="rounded-full w-10 h-10 !p-0 flex items-center justify-center"
          />
        </div>
      </div>
    </div>
  );
};

export default Chat; 