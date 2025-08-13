import React from "react";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  message_count?: number;
  last_message_at?: string;
  unread_count?: number;
}

interface ClientInfoProps {
  client: Client;
}

export const ClientInfo: React.FC<ClientInfoProps> = ({ client }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Client Details</h3>
      </div>

      {/* Client Avatar and Name */}
      <div className="p-4 border-b border-gray-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-xl font-medium text-gray-700">
              {client.name ? client.name.charAt(0).toUpperCase() : "?"}
            </span>
          </div>
          <h4 className="text-lg font-medium text-gray-900">
            {client.name || "Unknown Client"}
          </h4>
          <p className="text-sm text-gray-500 mt-1">
            Client ID: {client.id.slice(0, 8)}...
          </p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="p-4 border-b border-gray-200">
        <h5 className="text-sm font-medium text-gray-900 mb-3">
          Contact Information
        </h5>
        <div className="space-y-3">
          {client.email && (
            <div className="flex items-center space-x-3">
              <EnvelopeIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-900">{client.email}</p>
                <a
                  href={`mailto:${client.email}`}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Send Email
                </a>
              </div>
            </div>
          )}

          {client.phone && (
            <div className="flex items-center space-x-3">
              <PhoneIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-900">{client.phone}</p>
                <a
                  href={`tel:${client.phone}`}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Call Now
                </a>
              </div>
            </div>
          )}

          {client.location && (
            <div className="flex items-center space-x-3">
              <MapPinIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <p className="text-sm text-gray-900">{client.location}</p>
            </div>
          )}
        </div>
      </div>

      {/* Conversation Stats */}
      <div className="p-4 border-b border-gray-200">
        <h5 className="text-sm font-medium text-gray-900 mb-3">
          Conversation Stats
        </h5>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-900">
                {client.message_count || 0} total messages
              </p>
              {client.unread_count && client.unread_count > 0 && (
                <p className="text-xs text-red-600">
                  {client.unread_count} unread
                </p>
              )}
            </div>
          </div>

          {client.last_message_at && (
            <div className="flex items-center space-x-3">
              <CalendarIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-900">Last message</p>
                <p className="text-xs text-gray-500">
                  {formatDate(client.last_message_at)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-gray-200">
        <h5 className="text-sm font-medium text-gray-900 mb-3">
          Quick Actions
        </h5>
        <div className="space-y-2">
          <button className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Schedule Call
          </button>
          <button className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
            Create Task
          </button>
          <button className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
            View History
          </button>
        </div>
      </div>

      {/* Notes Section */}
      <div className="flex-1 p-4">
        <h5 className="text-sm font-medium text-gray-900 mb-3">
          Internal Notes
        </h5>
        <textarea
          placeholder="Add internal notes about this client..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />
        <button className="mt-2 w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
          Save Notes
        </button>
      </div>

      {/* Tags */}
      <div className="p-4 border-t border-gray-200">
        <h5 className="text-sm font-medium text-gray-900 mb-3">Tags</h5>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            VIP Client
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Active
          </span>
          <button className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
            + Add Tag
          </button>
        </div>
      </div>
    </div>
  );
};
