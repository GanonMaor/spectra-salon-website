import React from "react";
import { ChannelIcon } from "./ChannelIcon";

interface MessageBubbleProps {
  message: string;
  sender: "client" | "admin";
  timestamp: string;
  channel: "chat" | "whatsapp" | "email" | "sms" | "instagram";
  attachmentUrl?: string;
  status?: "new" | "in-progress" | "waiting" | "resolved";
  tag?: string;
  onClick?: () => void;
  isSelected?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  sender,
  timestamp,
  channel,
  attachmentUrl,
  status,
  tag,
  onClick,
  isSelected = false,
}) => {
  const isAdmin = sender === "admin";

  return (
    <div
      className={`flex ${isAdmin ? "justify-end" : "justify-start"} group cursor-pointer`}
      onClick={onClick}
    >
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg transition-all ${
          isAdmin
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-900 border border-gray-200"
        } ${isSelected ? "ring-2 ring-blue-500" : ""} hover:shadow-md`}
      >
        {/* Message Content */}
        <div className="space-y-2">
          {/* Attachment Preview */}
          {attachmentUrl && (
            <div className="mb-2">
              {attachmentUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                <img
                  src={attachmentUrl}
                  alt="Attachment"
                  className="max-w-full h-auto rounded-lg"
                />
              ) : (
                <a
                  href={attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center px-3 py-2 rounded ${
                    isAdmin
                      ? "bg-blue-700 hover:bg-blue-800"
                      : "bg-gray-100 hover:bg-gray-200"
                  } transition-colors`}
                >
                  📎 View Attachment
                </a>
              )}
            </div>
          )}

          {/* Message Text */}
          <p className="text-sm whitespace-pre-wrap break-words">{message}</p>

          {/* Meta Information */}
          <div
            className={`flex items-center justify-between text-xs ${
              isAdmin ? "text-blue-100" : "text-gray-500"
            }`}
          >
            <div className="flex items-center space-x-2">
              <ChannelIcon
                channel={channel}
                size="sm"
                className={isAdmin ? "text-blue-100" : ""}
              />
              <span>{timestamp}</span>
            </div>

            {/* Status and Tag for admin messages */}
            {isAdmin && (status || tag) && (
              <div className="flex items-center space-x-1">
                {status && (
                  <span className="px-2 py-1 bg-blue-700 rounded text-xs">
                    {status}
                  </span>
                )}
                {tag && (
                  <span className="px-2 py-1 bg-blue-700 rounded text-xs">
                    {tag}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Status and Tag for client messages */}
          {!isAdmin && (status || tag) && (
            <div className="flex items-center space-x-1 mt-1">
              {status && status !== "new" && (
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    status === "in-progress"
                      ? "bg-yellow-100 text-yellow-800"
                      : status === "waiting"
                        ? "bg-blue-100 text-blue-800"
                        : status === "resolved"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {status.replace("-", " ")}
                </span>
              )}
              {tag && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                  {tag}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <div className="mt-2 text-xs opacity-75">
            Click again to hide options
          </div>
        )}
      </div>
    </div>
  );
};
