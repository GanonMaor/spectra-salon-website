import React, { useState, useRef, useEffect } from 'react';
import { 
  ChatBubbleLeftRightIcon, 
  XMarkIcon, 
  PaperAirplaneIcon,
  PaperClipIcon 
} from '@heroicons/react/24/outline';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! How can I help you today? 😊',
      sender: 'agent',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isInfoCollected, setIsInfoCollected] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (text: string, sender: 'user' | 'agent') => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const sendToUnifiedChat = async (message: string) => {
    try {
      setLoading(true);
      const response = await fetch('/.netlify/functions/unified-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userInfo.name,
          email: userInfo.email,
          phone: userInfo.phone,
          message,
          channel: 'chat',
          sender: 'client'
        })
      });
      if (response.status === 429) {
        addMessage("You are sending messages too quickly. Please wait a minute and try again.", 'agent');
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Add confirmation message
      setTimeout(() => {
        addMessage("Thanks! Your message has been sent to our team. We'll get back to you shortly.", 'agent');
      }, 1000);

    } catch (error) {
      console.error('Error sending message:', error);
      addMessage("Sorry, there was an error sending your message. Please try again.", 'agent');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f && f.type.startsWith('image/')) {
      setFilePreview(URL.createObjectURL(f));
    } else {
      setFilePreview(null);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !file) return;

    // Add user message to chat
    if (newMessage.trim()) addMessage(newMessage, 'user');
    const messageToSend = newMessage;
    setNewMessage('');

    // If user info not collected yet, collect it first
    if (!isInfoCollected) {
      addMessage("To better assist you, could you please provide your contact information?", 'agent');
      setIsInfoCollected(true);
      setFile(null);
      setFilePreview(null);
      return;
    }

    setLoading(true);
    try {
      if (file) {
        // Upload file to API
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', userInfo.name);
        formData.append('email', userInfo.email);
        formData.append('phone', userInfo.phone);
        formData.append('message', messageToSend);
        formData.append('channel', 'chat');
        formData.append('sender', 'client');
        const res = await fetch('/.netlify/functions/upload-attachment', {
          method: 'POST',
          body: formData
        });
        if (res.status === 429) {
          addMessage("You are uploading files too quickly. Please wait a minute and try again.", 'agent');
          setFile(null);
          setFilePreview(null);
          return;
        }
        if (!res.ok) throw new Error('Failed to upload file');
        addMessage("File uploaded successfully! Our team will review it soon.", 'agent');
        setFile(null);
        setFilePreview(null);
      } else if (messageToSend) {
        await sendToUnifiedChat(messageToSend);
      }
    } catch (err) {
      addMessage("Sorry, there was an error uploading your file. Please try again.", 'agent');
    } finally {
      setLoading(false);
    }
  };

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInfo.name && !userInfo.email && !userInfo.phone) {
      return;
    }

    setIsInfoCollected(true);
    addMessage("Thank you! Now you can send your message and our team will respond.", 'agent');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const quickReplies = [
    "I'm interested in pricing",
    "I need a demo",
    "I have a technical question",
    "I want to learn more about features"
  ];

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-50 ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isOpen ? (
          <XMarkIcon className="w-6 h-6 text-white" />
        ) : (
          <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-blue-600 text-white px-4 py-3 rounded-t-lg">
            <h3 className="font-semibold">Chat with Spectra Support</h3>
            <p className="text-xs text-blue-100 mt-1">We typically reply in a few minutes</p>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-900 border border-gray-200 px-3 py-2 rounded-lg text-sm">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* User Info Form (if not collected) */}
          {isOpen && !isInfoCollected && messages.length > 2 && (
            <div className="p-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleInfoSubmit} className="space-y-2">
                <input
                  type="text"
                  placeholder="Your name"
                  value={userInfo.name}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="email"
                  placeholder="Your email"
                  value={userInfo.email}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="tel"
                  placeholder="Your phone (optional)"
                  value={userInfo.phone}
                  onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  Continue
                </button>
              </form>
            </div>
          )}

          {/* Quick Replies (before info collection) */}
          {isOpen && !isInfoCollected && messages.length <= 2 && (
            <div className="p-4 border-t border-gray-200 bg-white">
              <p className="text-xs text-gray-600 mb-2">Quick replies:</p>
              <div className="space-y-1">
                {quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      addMessage(reply, 'user');
                      addMessage("Great! To better assist you, could you please provide your contact information?", 'agent');
                    }}
                    className="w-full text-left px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message Input (after info collection) */}
          {isOpen && isInfoCollected && (
            <div className="p-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                {/* File upload UI */}
                <div className="flex items-center space-x-2 mt-2">
                  <label className="cursor-pointer flex items-center text-blue-600 hover:text-blue-800">
                    <PaperClipIcon className="w-5 h-5 mr-1" />
                    <input type="file" className="hidden" onChange={handleFileChange} />
                    Attach
                  </label>
                  {file && (
                    <span className="text-xs text-gray-700">{file.name}</span>
                  )}
                  {filePreview && (
                    <img src={filePreview} alt="preview" className="w-10 h-10 object-cover rounded ml-2" />
                  )}
                </div>
                <button
                  type="submit"
                  disabled={(!newMessage.trim() && !file) || loading}
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
};