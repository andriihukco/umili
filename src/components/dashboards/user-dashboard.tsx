"use client";

import { useAppStore } from "@/lib/store";
import { FreelancerDashboard } from "./freelancer-dashboard";
import { ClientDashboard } from "./client-dashboard";
import { AdminDashboard } from "./admin-dashboard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function UserDashboard() {
  const { profile, isLoading } = useAppStore();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!profile) {
    return null;
  }

  switch (profile.role) {
    case "freelancer":
      return <FreelancerDashboard />;
    case "client":
      return <ClientDashboard />;
    case "admin":
      return <AdminDashboard />;
    default:
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Невідома роль</h2>
            <p className="text-muted-foreground">
              Ваша роль користувача не визначена
            </p>
          </div>
        </div>
      );
  }
}
