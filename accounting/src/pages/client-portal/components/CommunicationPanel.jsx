import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const CommunicationPanel = () => {
  const [selectedConversation, setSelectedConversation] = useState(1);
  const [newMessage, setNewMessage] = useState('');

  const conversations = [
    {
      id: 1,
      name: "Michael Rodriguez",
      role: "Account Manager",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      lastMessage: "I\'ve uploaded your Q3 financial statements. Please review when you have a moment.",
      timestamp: "2 hours ago",
      unread: 2,
      online: true
    },
    {
      id: 2,
      name: "Sarah Chen",
      role: "Tax Specialist",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      lastMessage: "Your tax documents are ready for review. The deadline is approaching.",
      timestamp: "1 day ago",
      unread: 0,
      online: false
    },
    {
      id: 3,
      name: "AccountingPro Support",
      role: "Support Team",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg",
      lastMessage: "Thank you for contacting support. Your issue has been resolved.",
      timestamp: "3 days ago",
      unread: 0,
      online: true
    }
  ];

  const messages = [
    {
      id: 1,
      sender: "Michael Rodriguez",
      content: "Good morning! I hope you\'re doing well. I wanted to update you on the progress of your financial statements.",
      timestamp: new Date(Date.now() - 7200000),
      isOwn: false,
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      id: 2,
      sender: "You",
      content: "Thank you for the update. I appreciate your prompt communication.",
      timestamp: new Date(Date.now() - 6900000),
      isOwn: true
    },
    {
      id: 3,
      sender: "Michael Rodriguez",
      content: "I\'ve uploaded your Q3 financial statements to the document center. The reports show strong performance this quarter with revenue growth of 12.5% compared to Q2.",
      timestamp: new Date(Date.now() - 6600000),
      isOwn: false,
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      id: 4,
      sender: "Michael Rodriguez",
      content: "Please review the documents when you have a moment. I\'m available for any questions or clarifications you might need.",
      timestamp: new Date(Date.now() - 6300000),
      isOwn: false,
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    }
  ];

  const notifications = [
    {
      id: 1,
      type: "document",
      title: "New Financial Statement Available",
      message: "Q3 2024 financial statement has been uploaded to your document center",
      timestamp: "2 hours ago",
      read: false
    },
    {
      id: 2,
      type: "reminder",
      title: "Tax Filing Reminder",
      message: "Your quarterly tax filing is due in 5 days",
      timestamp: "1 day ago",
      read: false
    },
    {
      id: 3,
      type: "payment",
      title: "Invoice Payment Received",
      message: "Payment of $15,750 has been processed for Invoice #INV-2024-0847",
      timestamp: "2 days ago",
      read: true
    }
  ];

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'document':
        return 'FileText';
      case 'reminder':
        return 'Clock';
      case 'payment':
        return 'CreditCard';
      default:
        return 'Bell';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Conversations List */}
      <div className="lg:col-span-1 bg-surface rounded-lg border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-heading font-semibold text-text-primary">Messages</h3>
        </div>
        
        <div className="overflow-y-auto h-full">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation.id)}
              className={`
                w-full p-4 text-left hover:bg-background nav-transition border-b border-border
                ${selectedConversation === conversation.id ? 'bg-primary-50' : ''}
              `}
            >
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <img
                    src={conversation.avatar}
                    alt={conversation.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {conversation.online && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-surface"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-text-primary truncate">
                      {conversation.name}
                    </h4>
                    {conversation.unread > 0 && (
                      <span className="bg-accent text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {conversation.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary mb-1">{conversation.role}</p>
                  <p className="text-sm text-text-secondary line-clamp-2">
                    {conversation.lastMessage}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">{conversation.timestamp}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="lg:col-span-2 bg-surface rounded-lg border border-border flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <img
              src={conversations.find(c => c.id === selectedConversation)?.avatar}
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h3 className="font-medium text-text-primary">
                {conversations.find(c => c.id === selectedConversation)?.name}
              </h3>
              <p className="text-sm text-text-secondary">
                {conversations.find(c => c.id === selectedConversation)?.role}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex space-x-3 max-w-[70%] ${message.isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {!message.isOwn && (
                  <img
                    src={message.avatar}
                    alt={message.sender}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                )}
                
                <div>
                  <div className={`
                    p-3 rounded-lg
                    ${message.isOwn 
                      ? 'bg-primary text-white' :'bg-background text-text-primary'
                    }
                  `}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <p className={`text-xs text-text-secondary mt-1 ${message.isOwn ? 'text-right' : 'text-left'}`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-border">
          <div className="flex space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-border-focus focus:border-transparent outline-none"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed nav-transition"
            >
              <Icon name="Send" size={16} color="white" />
            </button>
          </div>
        </div>
      </div>

      {/* Notifications Panel */}
      <div className="lg:col-span-3 bg-surface rounded-lg border border-border">
        <div className="p-4 border-b border-border">
          <h3 className="font-heading font-semibold text-text-primary">Recent Notifications</h3>
        </div>
        
        <div className="divide-y divide-border">
          {notifications.map((notification) => (
            <div key={notification.id} className={`p-4 hover:bg-background nav-transition ${!notification.read ? 'bg-primary-50' : ''}`}>
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon 
                    name={getNotificationIcon(notification.type)} 
                    size={20} 
                    color="var(--color-secondary)" 
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-text-primary">{notification.title}</h4>
                      <p className="text-sm text-text-secondary mt-1">{notification.message}</p>
                      <p className="text-xs text-text-secondary mt-2">{notification.timestamp}</p>
                    </div>
                    
                    {!notification.read && (
                      <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunicationPanel;