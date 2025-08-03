import { useState, useEffect, useCallback } from 'react';

interface ChatNotificationData {
  unreadCount: number;
  lastChecked: string;
}

export const useChatNotifications = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch('/.netlify/functions/support-tickets?status=new');
      if (response.ok) {
        const data = await response.json();
        const newCount = data.tickets?.length || 0;
        setUnreadCount(newCount);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(() => {
    localStorage.setItem('chat_last_checked', new Date().toISOString());
    setUnreadCount(0);
  }, []);

  // Poll for new messages every 30 seconds
  useEffect(() => {
    fetchUnreadCount();
    
    const interval = setInterval(fetchUnreadCount, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Check on window focus
  useEffect(() => {
    const handleFocus = () => {
      fetchUnreadCount();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchUnreadCount]);

  return {
    unreadCount,
    loading,
    fetchUnreadCount,
    markAsRead
  };
};