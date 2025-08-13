import { useState, useEffect, useCallback, useRef } from "react";
import { useNotifications } from "../components/ui/notifications";

export interface PollingMessage {
  id: string;
  sender: "client" | "admin";
  message: string;
  channel: "chat" | "whatsapp" | "email" | "sms" | "instagram";
  created_at: string;
  status: "new" | "in-progress" | "waiting" | "resolved";
  client_id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
}

export interface PollingStats {
  totalMessages: number;
  newMessages: number;
  inProgressMessages: number;
  unreadCount: number;
  lastUpdate: Date;
}

interface UseUnifiedChatPollingOptions {
  enabled?: boolean;
  interval?: number;
  onNewMessage?: (message: PollingMessage) => void;
  onStatusChange?: (stats: PollingStats) => void;
  filters?: {
    channel?: string;
    status?: string;
  };
}

export const useUnifiedChatPolling = (
  options: UseUnifiedChatPollingOptions = {},
) => {
  const {
    enabled = true,
    interval = 10000, // 10 seconds
    onNewMessage,
    onStatusChange,
    filters = {},
  } = options;

  const [messages, setMessages] = useState<PollingMessage[]>([]);
  const [stats, setStats] = useState<PollingStats>({
    totalMessages: 0,
    newMessages: 0,
    inProgressMessages: 0,
    unreadCount: 0,
    lastUpdate: new Date(),
  });
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { addNotification } = useNotifications();
  const previousMessagesRef = useRef<PollingMessage[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      setError(null);

      // Build query parameters
      const params = new URLSearchParams({
        limit: "100",
        ...filters,
      });

      const response = await fetch(
        `/.netlify/functions/unified-messages?${params}`,
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status}`);
      }

      const data = await response.json();
      const newMessages: PollingMessage[] = data.messages || [];

      // Calculate stats
      const newStats: PollingStats = {
        totalMessages: data.total || newMessages.length,
        newMessages: newMessages.filter((m) => m.status === "new").length,
        inProgressMessages: newMessages.filter(
          (m) => m.status === "in-progress",
        ).length,
        unreadCount: newMessages.filter(
          (m) => m.status === "new" && m.sender === "client",
        ).length,
        lastUpdate: new Date(),
      };

      // Check for new messages
      const previousMessages = previousMessagesRef.current;
      if (previousMessages.length > 0) {
        const newMessageIds = new Set(newMessages.map((m) => m.id));
        const previousMessageIds = new Set(previousMessages.map((m) => m.id));

        // Find truly new messages (not just updated ones)
        const freshMessages = newMessages.filter(
          (m) => !previousMessageIds.has(m.id) && m.sender === "client",
        );

        // Notify about new messages
        freshMessages.forEach((message) => {
          // Call callback if provided
          onNewMessage?.(message);

          // Show notification
          addNotification({
            type: "chat",
            title: "New Message",
            message: `From ${message.client_name}`,
            duration: 8000,
            metadata: {
              clientName: message.client_name,
              messagePreview:
                message.message.length > 50
                  ? message.message.substring(0, 50) + "..."
                  : message.message,
              channel: message.channel,
            },
            action: {
              label: "View Chat",
              onClick: () => {
                // Navigate to unified chat page
                window.location.href = "/admin/support/unified-chat";
              },
            },
          });
        });

        // Check for status changes
        const statusChangedMessages = newMessages.filter((newMsg) => {
          const oldMsg = previousMessages.find((m) => m.id === newMsg.id);
          return oldMsg && oldMsg.status !== newMsg.status;
        });

        statusChangedMessages.forEach((message) => {
          if (message.status === "resolved") {
            addNotification({
              type: "success",
              title: "Message Resolved",
              message: `Conversation with ${message.client_name} has been resolved`,
              duration: 5000,
            });
          }
        });
      }

      // Update state
      setMessages(newMessages);
      setStats(newStats);
      previousMessagesRef.current = newMessages;

      // Call status change callback
      onStatusChange?.(newStats);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Polling error:", err);

      addNotification({
        type: "error",
        title: "Connection Error",
        message: "Failed to fetch latest messages",
        duration: 5000,
      });
    }
  }, [filters, onNewMessage, onStatusChange, addNotification]);

  const startPolling = useCallback(() => {
    if (!enabled || intervalRef.current) return;

    setIsPolling(true);

    // Initial fetch
    fetchMessages();

    // Set up interval
    intervalRef.current = setInterval(() => {
      fetchMessages();
    }, interval);
  }, [enabled, interval, fetchMessages]);

  const stopPolling = useCallback(() => {
    setIsPolling(false);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const refreshNow = useCallback(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Auto-start/stop polling based on enabled prop
  useEffect(() => {
    if (enabled) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => stopPolling();
  }, [enabled, startPolling, stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    messages,
    stats,
    isPolling,
    error,
    startPolling,
    stopPolling,
    refreshNow,
    // Helper methods
    getUnreadCount: () => stats.unreadCount,
    getNewMessagesCount: () => stats.newMessages,
    hasNewActivity: () => stats.newMessages > 0 || stats.unreadCount > 0,
  };
};
