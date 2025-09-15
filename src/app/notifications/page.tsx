"use client";

import { NotificationsManager } from "@/components/ui/notifications-manager";
import { PageHeader } from "@/components/ui/page-header";
import { useAppStore } from "@/lib/store";

export default function NotificationsPage() {
  const { user } = useAppStore();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light text-gray-600">
            Будь ласка, увійдіть в систему
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div>
        <div className="px-6 py-6">
          <PageHeader
            title="Сповіщення"
            description="Переглядайте та керуйте своїми сповіщеннями"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <NotificationsManager />
        </div>
      </div>
    </div>
  );
}
