import React, { useState, useRef, useEffect } from 'react';
import { MessageBubble } from '../../../../components/MessageBubble';
import { ChannelIcon } from '../../../../components/ChannelIcon';
import { PaperAirplaneIcon, TagIcon } from '@heroicons/react/24/outline';

interface Message {
  id: string;
  sender: 'client' | 'admin';
  message: string;
  channel: 'chat' | 'whatsapp' | 'email' | 'sms' | 'instagram';
  attachment_url?: string;
  attachment_name?: string;
  attachment_mime?: string;
  attachment_size?: number;
  created_at: string;
  status: 'new' | 'in-progress' | 'waiting' | 'resolved';
  tag?: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
}

interface ChatViewProps {
  client: Client;
  messages: Message[];
  onSendMessage: (message: string) => void;
  onUpdateMessage: (messageId: string, updates: { status?: string; tag?: string }) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  client,
  messages,
  onSendMessage,
  onUpdateMessage
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const handleStatusChange = (messageId: string, status: string) => {
    onUpdateMessage(messageId, { status });
    setSelectedMessage(null);
  };

  const handleTagChange = (messageId: string, tag: string) => {
    onUpdateMessage(messageId, { tag });
    setSelectedMessage(null);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const quickReplies = [
    "Thank you for contacting us! We'll get back to you shortly.",
    "Can you please provide more details about your issue?",
    "I'd be happy to help you with that. Let me look into it.",
    "Is there anything else I can help you with today?",
    "Thank you for your patience. We're working on resolving this."
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">
                {client.name ? client.name.charAt(0).toUpperCase() : '?'}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {client.name || client.email || client.phone || 'Unknown'}
              </h3>
              <p className="text-sm text-gray-500">
                {client.email && `${client.email} • `}
                {client.phone && `${client.phone} • `}
                {messages.length} message{messages.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Status and Tags Controls */}
          <div className="flex items-center space-x-2">
            <select
              onChange={(e) => {
                const latestMessage = messages[messages.length - 1];
                if (latestMessage && e.target.value) {
                  handleStatusChange(latestMessage.id, e.target.value);
                }
              }}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              defaultValue=""
            >
              <option value="">Change Status</option>
              <option value="new">New</option>
              <option value="in-progress">In Progress</option>
              <option value="waiting">Waiting</option>
              <option value="resolved">Resolved</option>
            </select>

            <button
              onClick={() => setSelectedMessage(selectedMessage ? null : messages[messages.length - 1]?.id)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
              title="Add Tag"
            >
              <TagIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>No messages yet</p>
            <p className="text-sm mt-1">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={message.id} className="space-y-2">
              <MessageBubble
                message={message.message}
                sender={message.sender}
                timestamp={formatTime(message.created_at)}
                channel={message.channel}
                attachmentUrl={message.attachment_url}
                status={message.status}
                tag={message.tag}
                onClick={() => setSelectedMessage(selectedMessage === message.id ? null : message.id)}
                isSelected={selectedMessage === message.id}
              />

              {message.attachment_name && (
                <div className="mt-2 ml-8">
                  {message.attachment_mime && message.attachment_mime.startsWith('image/') ? (
                    <a href={`/.netlify/functions/download-attachment?id=${message.id}`} target="_blank" rel="noopener noreferrer">
                      <img
                        src={`/.netlify/functions/download-attachment?id=${message.id}`}
                        alt={message.attachment_name}
                        className="w-32 h-32 object-contain rounded border"
                      />
                    </a>
                  ) : (
                    <a
                      href={`/.netlify/functions/download-attachment?id=${message.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 text-blue-700 text-sm"
                    >
                      📎 {message.attachment_name} ({Math.round((message.attachment_size || 0) / 1024)} KB)
                    </a>
                  )}
                </div>
              )}

              {/* Quick Actions for Selected Message */}
              {selectedMessage === message.id && (
                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm ml-8">
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={message.status}
                        onChange={(e) => handleStatusChange(message.id, e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="new">New</option>
                        <option value="in-progress">In Progress</option>
                        <option value="waiting">Waiting</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Tag
                      </label>
                      <select
                        value={message.tag || ''}
                        onChange={(e) => handleTagChange(message.id, e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="">No Tag</option>
                        <option value="Urgent">Urgent</option>
                        <option value="Sales">Sales</option>
                        <option value="Support">Support</option>
                        <option value="Billing">Billing</option>
                        <option value="Demo">Demo</option>
                        <option value="Follow-up">Follow-up</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      <div className="bg-white border-t border-gray-200 p-2">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {quickReplies.map((reply, index) => (
            <button
              key={index}
              onClick={() => setNewMessage(reply)}
              className="flex-shrink-0 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
            >
              {reply}
            </button>
          ))}
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};