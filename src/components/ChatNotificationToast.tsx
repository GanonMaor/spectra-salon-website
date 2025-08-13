import React, { useEffect } from "react";
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface ChatNotificationToastProps {
  show: boolean;
  onClose: () => void;
  message: string;
  sender?: string;
  duration?: number;
}

export const ChatNotificationToast: React.FC<ChatNotificationToastProps> = ({
  show,
  onClose,
  message,
  sender = "New Customer",
  duration = 5000,
}) => {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 animate-slide-in-right">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-600" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">New Message</p>
              <button
                onClick={onClose}
                className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">From: {sender}</p>
            <p className="text-sm text-gray-800 mt-2 line-clamp-2">{message}</p>
          </div>
        </div>

        <div className="mt-3">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            View Messages
          </button>
        </div>
      </div>
    </div>
  );
};

// Add animation styles if not already in CSS
const styles = `
  @keyframes slide-in-right {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  .animate-slide-in-right {
    animation: slide-in-right 0.3s ease-out;
  }
`;
