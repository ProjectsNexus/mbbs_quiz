// components/NotificationDrawer.tsx
"use client";

import { X } from "lucide-react";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  time: string; // already formatted string
  isRead: boolean;
};

interface NotificationDrawerProps {
  notifications: Notification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void; // 🔹 new prop
}

export default function NotificationDrawer({
  notifications,
  isOpen,
  onClose,
  onMarkAsRead,
}: NotificationDrawerProps) {
  return (
    <div
      className={`fixed inset-0 z-50 transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-1/4 bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">Notifications</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-center text-gray-500 mt-8">
              No notifications
            </p>
          ) : (
            <ul className="divide-y">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  onClick={() => onMarkAsRead(n.id)} // 🔹 mark as read
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    !n.isRead ? "bg-gray-200" : ""
                  }`}
                >
                  <p className="font-medium">{n.title}</p>
                  <p className="text-sm text-gray-600">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                  {!n.isRead && (
                    <span className="inline-block mt-1 text-xs text-blue-600 font-medium">
                      Marked as new
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
