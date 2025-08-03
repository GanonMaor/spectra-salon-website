import React from 'react';
import { ChannelIcon } from '../../../../components/ChannelIcon';

interface Message {
  id: string;
  sender: 'client' | 'admin';
  message: string;
  channel: 'chat' | 'whatsapp' | 'email' | 'sms' | 'instagram';
  created_at: string;
  status: 'new' | 'in-progress' | 'waiting' | 'resolved';
  client_id: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  message_count: number;
  last_message_at: string;
  unread_count: number;
}

interface ChatListProps {
  clients: Client[];
  messages: Message[];
  selectedClient: Client | null;
  onClientSelect: (client: Client) => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  clients,
  messages,
  selectedClient,
  onClientSelect
}) => {
  const getLastMessage = (clientId: string): Message | undefined => {
    return messages
      .filter(msg => msg.client_id === clientId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const truncateMessage = (text: string, maxLength: number = 60) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {clients.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          <p>No conversations found</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {clients.map((client) => {
            const lastMessage = getLastMessage(client.id);
            const isSelected = selectedClient?.id === client.id;

            return (
              <div
                key={client.id}
                onClick={() => onClientSelect(client)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {client.name ? client.name.charAt(0).toUpperCase() : '?'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {client.name || client.email || client.phone || 'Unknown'}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {lastMessage && (
                          <ChannelIcon channel={lastMessage.channel} size="sm" />
                        )}
                        {client.unread_count > 0 && (
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                            {client.unread_count}
                          </span>
                        )}
                      </div>
                    </div>

                    {lastMessage && (
                      <div className="mt-1">
                        <p className="text-sm text-gray-600">
                          {lastMessage.sender === 'admin' ? 'You: ' : ''}
                          {truncateMessage(lastMessage.message)}
                        </p>
                      </div>
                    )}

                    <div className="mt-1 flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {client.location && `${client.location} • `}
                        {client.message_count} message{client.message_count !== 1 ? 's' : ''}
                      </p>
                      {lastMessage && (
                        <p className="text-xs text-gray-500">
                          {formatTime(lastMessage.created_at)}
                        </p>
                      )}
                    </div>

                    {/* Status indicator */}
                    {lastMessage && (
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          lastMessage.status === 'new' ? 'bg-red-100 text-red-800' :
                          lastMessage.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                          lastMessage.status === 'waiting' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {lastMessage.status.replace('-', ' ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};