import React, { useState, useEffect } from "react";
import { ChatList } from "./ChatList";
import { ChatView } from "./ChatView";
import { ClientInfo } from "./ClientInfo";
import { LoadingSpinner } from "../../../../components/LoadingSpinner";
import { useUnifiedChatPolling } from "../../../../hooks/useUnifiedChatPolling";
import { useNotifications } from "../../../../components/ui/notifications";

interface Message {
  id: string;
  sender: "client" | "admin";
  message: string;
  channel: "chat" | "whatsapp" | "email" | "sms" | "instagram";
  attachment_url?: string;
  created_at: string;
  status: "new" | "in-progress" | "waiting" | "resolved";
  tag?: string;
  client_id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_location: string;
  assigned_to_name?: string;
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

export const UnifiedChatPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [channelFilter, setChannelFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { addNotification } = useNotifications();

  // Use real-time polling hook
  const {
    messages,
    stats,
    isPolling,
    error: pollingError,
    refreshNow,
  } = useUnifiedChatPolling({
    enabled: true,
    interval: 10000,
    filters: {
      ...(channelFilter ? { channel: channelFilter } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
    },
    onNewMessage: (message) => {
      // Additional handling if needed when in the chat page
      console.log("New message in chat page:", message);
    },
  });

  // Update clients list when messages change
  useEffect(() => {
    if (messages.length > 0) {
      // Debug log: print all messages from API
      console.log("UnifiedChatPage: messages from API:", messages);
      // Group messages by client to create client list
      const clientMap = new Map<string, Client>();
      messages.forEach((msg: any) => {
        if (msg.client_id && !clientMap.has(msg.client_id)) {
          clientMap.set(msg.client_id, {
            id: msg.client_id,
            name: msg.client_name || "Unknown",
            email: msg.client_email || "",
            phone: msg.client_phone || "",
            location: msg.client_location || "",
            message_count: 0,
            last_message_at: msg.created_at,
            unread_count: 0,
          });
        }

        const client = clientMap.get(msg.client_id);
        if (client) {
          client.message_count++;
          if (msg.status === "new") client.unread_count++;
          if (new Date(msg.created_at) > new Date(client.last_message_at)) {
            client.last_message_at = msg.created_at;
          }
        }
      });

      const clientsArr = Array.from(clientMap.values()).sort(
        (a, b) =>
          new Date(b.last_message_at).getTime() -
          new Date(a.last_message_at).getTime(),
      );
      console.log("UnifiedChatPage: clients after grouping:", clientsArr);
      setClients(clientsArr);
      setLoading(false);

      // Auto-select most recent client on first load
      if (!selectedClient && clientsArr.length > 0) {
        setSelectedClient(clientsArr[0]);
        fetchClientMessages(clientsArr[0].id);
      }
    } else {
      // No messages returned — render empty state instead of spinner
      setClients([]);
      setLoading(false);
    }
  }, [messages]);

  const fetchClientMessages = async (clientId: string) => {
    try {
      const response = await fetch(
        `/.netlify/functions/unified-messages?client_id=${clientId}&limit=50`,
      );
      if (!response.ok) throw new Error("Failed to fetch client messages");

      const data = await response.json();
      setSelectedMessages(data.messages || []);
    } catch (err) {
      console.error("Error fetching client messages:", err);
    }
  };

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    fetchClientMessages(client.id);
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedClient) return;

    try {
      const response = await fetch("/.netlify/functions/unified-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: selectedClient.email,
          phone: selectedClient.phone,
          message,
          sender: "admin",
          channel: "chat",
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      // Refresh messages
      await fetchClientMessages(selectedClient.id);
      await refreshNow();
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleUpdateMessage = async (
    messageId: string,
    updates: { status?: string; tag?: string; assigned_to?: string },
  ) => {
    try {
      const response = await fetch(
        `/.netlify/functions/unified-messages/${messageId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        },
      );

      if (!response.ok) throw new Error("Failed to update message");

      // Refresh messages
      await refreshNow();
      if (selectedClient) {
        await fetchClientMessages(selectedClient.id);
      }
    } catch (err) {
      console.error("Error updating message:", err);
    }
  };

  // Update error state from polling
  useEffect(() => {
    if (pollingError) {
      setError(pollingError);
    }
  }, [pollingError]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-medium">Error loading chat</h3>
        <p className="text-red-600 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-gray-50">
      {/* Left Sidebar - Chat List */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Conversations
          </h2>

          {/* Filters */}
          <div className="space-y-2">
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Channels</option>
              <option value="chat">Chat</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="instagram">Instagram</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Status</option>
              <option value="new">New</option>
              <option value="in-progress">In Progress</option>
              <option value="waiting">Waiting</option>
              <option value="resolved">Resolved</option>
            </select>

            {/* Real-time status and refresh */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={refreshNow}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
              >
                Refresh Now
              </button>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${isPolling ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
                ></div>
                <span className="text-xs text-gray-500">
                  {isPolling ? "Live" : "Offline"}
                </span>
              </div>
            </div>

            {/* Stats summary */}
            {stats && (
              <div className="text-xs text-gray-600 pt-1">
                <div>Total: {stats.totalMessages}</div>
                <div>New: {stats.newMessages}</div>
                <div>Unread: {stats.unreadCount}</div>
                <div>Last update: {stats.lastUpdate.toLocaleTimeString()}</div>
              </div>
            )}
          </div>
        </div>

        <ChatList
          clients={clients}
          messages={messages}
          selectedClient={selectedClient}
          onClientSelect={handleClientSelect}
        />
      </div>

      {/* Center - Chat View */}
      <div className="flex-1 flex flex-col">
        {selectedClient ? (
          <ChatView
            client={selectedClient}
            messages={selectedMessages}
            onSendMessage={handleSendMessage}
            onUpdateMessage={handleUpdateMessage}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <h3 className="text-lg font-medium">Select a conversation</h3>
              <p className="mt-1">
                Choose a client from the left to start chatting
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Client Info */}
      {selectedClient && (
        <div className="w-1/4 bg-white border-l border-gray-200">
          <ClientInfo client={selectedClient} />
        </div>
      )}
    </div>
  );
};
