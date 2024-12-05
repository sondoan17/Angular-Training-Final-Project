import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Input, Button, Avatar, Tabs, Badge, Empty, message as antMessage, Upload } from 'antd';
import { SendOutlined, UserOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons';
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
  messageType: string;
  imageUrl: string;
  status: 'sent' | 'received' | 'seen';
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
 
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  const [searchUsername, setSearchUsername] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

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
        setMessages(chatResponse.data.messages || []);
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

  // Update the socket effect to include selectedUser dependency
  useEffect(() => {
    if (!selectedUser) return;

    socket.on('newMessage', (message: Message) => {
      // Only update messages if the message is from/to the selected user
      if (message.sender._id === selectedUser.id || message.receiver._id === selectedUser.id) {
        setMessages(prev => [...prev, message]);
      }
      
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
  }, [selectedUser]); // Add selectedUser as dependency

  const loadMessages = async (userId: string, pageNum: number) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/messages/${userId}?page=${pageNum}&limit=10`);
      
      if (pageNum === 1) {
        setMessages(response.data.messages || []);
      } else {
        // Prepend older messages to the beginning of the array
        setMessages(prev => [...(response.data.messages || []), ...prev]);
      }
      
      setHasMore(response.data.hasMore);
      setLoading(false);
    } catch (error) {
      console.error('Error loading messages:', error);
      antMessage.error('Failed to load messages');
      setLoading(false);
    }
  };

  const handleScroll = async () => {
    if (!messagesContainerRef.current || loading || !hasMore || !selectedUser) return;

    const { scrollTop } = messagesContainerRef.current;
    // Load more when user scrolls near the top
    if (scrollTop < 50) {
      setPage(prev => prev + 1);
      await loadMessages(selectedUser.id, page + 1);
    }
  };

  const handleSelectUser = async (userId: string, username: string) => {
    setSelectedUser({ id: userId, username });
    setPage(1);
    setHasMore(true);
    await loadMessages(userId, 1);
  };

  
  const handleImageUpload = async (file: File) => {
    if (!selectedUser) return false;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('receiverId', selectedUser.id);

    try {
      const response = await axiosInstance.post('/api/messages/send-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessages(prev => [...prev, response.data]);
      return false; // Prevent default upload behavior
    } catch (error) {
      console.error('Error uploading image:', error);
      antMessage.error('Failed to send image');
      return false;
    }
  };

 
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  
  const uploadButton = (
    <Upload
      beforeUpload={handleImageUpload}
      showUploadList={false}
      accept="image/*"
    >
      <Button
        icon={<UploadOutlined />}
        disabled={!selectedUser}
        className="rounded-full w-10 h-10 !p-0 flex items-center justify-center"
      />
    </Upload>
  );

  // Update the message rendering to handle images
  const renderMessage = (msg: Message) => (
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
        {msg.messageType === 'image' ? (
          <img src={msg.imageUrl} alt="Message" className="max-w-full rounded" />
        ) : (
          <div>{msg.content}</div>
        )}
        <div className={`text-xs mt-1 ${
          msg.sender._id === user?.id ? 'text-blue-100' : 'text-gray-500'
        }`}>
          {new Date(msg.createdAt).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );

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
            
            <div 
              className="flex-1 overflow-y-auto space-y-4 mb-4"
              ref={messagesContainerRef}
              onScroll={handleScroll}
            >
              {loading && page > 1 && (
                <div className="text-center py-2">
                  Loading more messages...
                </div>
              )}
              {messages.map(renderMessage)}
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
          {uploadButton}
        </div>
      </div>
    </div>
  );
};

export default Chat; 