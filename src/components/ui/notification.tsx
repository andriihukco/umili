"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle, X } from "lucide-react";

interface Notification {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  message: string;
  timestamp: Date;
}

interface NotificationProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

export function NotificationToast({
  notifications,
  onDismiss,
}: NotificationProps) {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className={`min-w-80 shadow-lg border-l-4 ${
            notification.type === "success"
              ? "border-l-green-500"
              : notification.type === "error"
              ? "border-l-red-500"
              : "border-l-blue-500"
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {notification.type === "success" && (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                  {notification.type === "error" && (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  {notification.type === "info" && (
                    <AlertCircle className="h-5 w-5 text-blue-500" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">
                    {notification.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {notification.timestamp.toLocaleTimeString("uk-UA")}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDismiss(notification.id)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (
    type: "success" | "error" | "info",
    title: string,
    message: string
  ) => {
    const notification: Notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date(),
    };

    setNotifications((prev) => [...prev, notification]);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      dismissNotification(notification.id);
    }, 5000);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAll,
  };
}
