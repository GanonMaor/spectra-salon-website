import React from 'react';
import { 
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';

interface ChannelIconProps {
  channel: 'chat' | 'whatsapp' | 'email' | 'sms' | 'instagram';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ChannelIcon: React.FC<ChannelIconProps> = ({ 
  channel, 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const getIcon = () => {
    switch (channel) {
      case 'whatsapp':
        return (
          <div className={`${sizeClasses[size]} ${className} bg-green-500 rounded-full flex items-center justify-center`}>
            <span className="text-white text-xs font-bold">W</span>
          </div>
        );
      case 'email':
        return <EnvelopeIcon className={`${sizeClasses[size]} ${className} text-blue-500`} />;
      case 'sms':
        return <DevicePhoneMobileIcon className={`${sizeClasses[size]} ${className} text-purple-500`} />;
      case 'instagram':
        return (
          <div className={`${sizeClasses[size]} ${className} bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center`}>
            <span className="text-white text-xs font-bold">IG</span>
          </div>
        );
      case 'chat':
      default:
        return <ChatBubbleLeftRightIcon className={`${sizeClasses[size]} ${className} text-gray-500`} />;
    }
  };

  const getChannelName = () => {
    switch (channel) {
      case 'whatsapp': return 'WhatsApp';
      case 'email': return 'Email';
      case 'sms': return 'SMS';
      case 'instagram': return 'Instagram';
      case 'chat': return 'Chat';
      default: return 'Unknown';
    }
  };

  return (
    <div className="flex items-center space-x-1" title={getChannelName()}>
      {getIcon()}
    </div>
  );
};