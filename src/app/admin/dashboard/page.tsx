"use client";

import { useState, useEffect } from "react";
import { AdminOnly } from "@/components/route-guard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import {
  Users,
  FileText,
  DollarSign,
  UserCheck,
  BarChart3,
  Eye,
  Ban,
  Shield,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { BlockModal } from "@/components/ui/block-modal";
import Link from "next/link";

interface DashboardStats {
  totalUsers: number;
  totalTasks: number;
  totalApplications: number;
  totalRevenue: number;
  usersByRole: {
    freelancers: number;
    clients: number;
    admins: number;
  };
  tasksByStatus: {
    open: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };
  recentTasks: Array<{
    id: string;
    title: string;
    budget: number;
    status: string;
    created_at: string;
    client_id: string;
  }>;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    created_at: string;
    is_blocked: boolean;
    block_reason: string | null;
    blocked_at: string | null;
  }>;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    name: string;
    is_blocked: boolean;
  } | null>(null);
  const [isBlocking, setIsBlocking] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch users count
      const { count: totalUsers } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });

      // Fetch tasks count
      const { count: totalTasks } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true });

      // Fetch applications count
      const { count: totalApplications } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true });

      // Fetch users by role
      const { data: usersData } = await supabase.from("users").select("role");

      const usersByRole = {
        freelancers:
          usersData?.filter((u) => u.role === "freelancer").length || 0,
        clients: usersData?.filter((u) => u.role === "client").length || 0,
        admins: usersData?.filter((u) => u.role === "admin").length || 0,
      };

      // Fetch tasks by status
      const { data: tasksData } = await supabase.from("tasks").select("status");

      const tasksByStatus = {
        open: tasksData?.filter((t) => t.status === "open").length || 0,
        in_progress:
          tasksData?.filter((t) => t.status === "in_progress").length || 0,
        completed:
          tasksData?.filter((t) => t.status === "completed").length || 0,
        cancelled:
          tasksData?.filter((t) => t.status === "cancelled").length || 0,
      };

      // Calculate total revenue (sum of completed tasks budgets)
      const { data: completedTasks } = await supabase
        .from("tasks")
        .select("budget")
        .eq("status", "completed");

      const totalRevenue =
        completedTasks?.reduce((sum, task) => sum + task.budget, 0) || 0;

      // Fetch recent tasks
      const { data: recentTasks } = await supabase
        .from("tasks")
        .select(
          `
          id,
          title,
          budget,
          status,
          created_at,
          client_id
        `
        )
        .order("created_at", { ascending: false })
        .limit(5);

      // Fetch recent users
      const { data: recentUsers } = await supabase
        .from("users")
        .select(
          "id, name, email, role, created_at, is_blocked, block_reason, blocked_at"
        )
        .order("created_at", { ascending: false })
        .limit(5);

      setStats({
        totalUsers: totalUsers || 0,
        totalTasks: totalTasks || 0,
        totalApplications: totalApplications || 0,
        totalRevenue,
        usersByRole,
        tasksByStatus,
        recentTasks: recentTasks || [],
        recentUsers: recentUsers || [],
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleBlockUser = async (reason: string) => {
    if (!selectedUser) return;

    setIsBlocking(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({
          is_blocked: true,
          block_reason: reason,
          blocked_at: new Date().toISOString(),
        })
        .eq("id", selectedUser.id);

      if (error) throw error;

      // Update local state
      setStats((prev) =>
        prev
          ? {
              ...prev,
              recentUsers: prev.recentUsers.map((user) =>
                user.id === selectedUser.id
                  ? {
                      ...user,
                      is_blocked: true,
                      block_reason: reason,
                      blocked_at: new Date().toISOString(),
                    }
                  : user
              ),
            }
          : null
      );

      alert("User blocked successfully!");
      setBlockModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error blocking user:", error);
      alert("Failed to block user");
    } finally {
      setIsBlocking(false);
    }
  };

  const handleUnblockUser = async (userId: string) => {
    setIsBlocking(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({
          is_blocked: false,
          block_reason: null,
          blocked_at: null,
        })
        .eq("id", userId);

      if (error) throw error;

      // Update local state
      setStats((prev) =>
        prev
          ? {
              ...prev,
              recentUsers: prev.recentUsers.map((user) =>
                user.id === userId
                  ? {
                      ...user,
                      is_blocked: false,
                      block_reason: null,
                      blocked_at: null,
                    }
                  : user
              ),
            }
          : null
      );

      alert("User unblocked successfully!");
    } catch (error) {
      console.error("Error unblocking user:", error);
      alert("Failed to unblock user");
    } finally {
      setIsBlocking(false);
    }
  };

  const openBlockModal = (user: {
    id: string;
    name: string;
    is_blocked: boolean;
  }) => {
    setSelectedUser(user);
    setBlockModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      open: { label: "Відкрите", variant: "default" as const },
      in_progress: { label: "В роботі", variant: "secondary" as const },
      completed: { label: "Завершене", variant: "outline" as const },
      cancelled: { label: "Скасоване", variant: "destructive" as const },
    };
    const statusInfo =
      statusMap[status as keyof typeof statusMap] || statusMap.open;
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          statusInfo.variant === "default"
            ? "bg-blue-100 text-blue-800"
            : statusInfo.variant === "secondary"
            ? "bg-gray-100 text-gray-800"
            : statusInfo.variant === "outline"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {statusInfo.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="text-center">Завантаження...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="text-center">Помилка завантаження даних</div>
      </div>
    );
  }

  return (
    <AdminOnly>
      <div className="min-h-screen bg-background">
        <PageHeader
          title="Admin Dashboard"
          description="Platform statistics overview and management"
        />
        <div className="px-6 py-6">
          {/* Main Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Всього користувачів
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats.usersByRole.freelancers} фрілансерів, +
                  {stats.usersByRole.clients} клієнтів
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Всього проєктів
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTasks}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.tasksByStatus.open} відкритих,{" "}
                  {stats.tasksByStatus.completed} завершених
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Всього заявок
                </CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalApplications}
                </div>
                <p className="text-xs text-muted-foreground">
                  Заявки від фрілансерів
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Загальний дохід
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalRevenue.toLocaleString()} ₴
                </div>
                <p className="text-xs text-muted-foreground">
                  Від завершених проєктів
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg">
                  Керування користувачами
                </CardTitle>
                <CardDescription>
                  Перегляд та управління всіма користувачами
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/admin/users">
                    <Users className="h-4 w-4 mr-2" />
                    Перейти до користувачів
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Projects & Tasks</CardTitle>
                <CardDescription>
                  Manage and moderate all projects and tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/admin/projects">
                    <FileText className="h-4 w-4 mr-2" />
                    Go to Projects & Tasks
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Аналітика</CardTitle>
                <CardDescription>Детальна статистика та звіти</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/admin/analytics">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Перейти до аналітики
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Tasks */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Останні проєкти</CardTitle>
                <CardDescription>Нещодавно створені проєкти</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{task.title}</h4>
                        <p className="text-xs text-gray-600">
                          Client ID: {task.client_id} •{" "}
                          {task.budget.toLocaleString()} ₴
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(task.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(task.status)}
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/tasks/${task.id}`}>
                            <Eye className="h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Users */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Останні користувачі</CardTitle>
                <CardDescription>
                  Нещодавно зареєстровані користувачі
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`flex items-center justify-between p-3 border rounded-lg ${
                        user.is_blocked ? "bg-red-50 border-red-200" : ""
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{user.name}</h4>
                          {user.is_blocked && (
                            <Ban className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(user.created_at)}
                        </p>
                        {user.is_blocked && user.block_reason && (
                          <p className="text-xs text-red-600 mt-1">
                            Blocked: {user.block_reason}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === "freelancer"
                              ? "bg-blue-100 text-blue-800"
                              : user.role === "client"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.role === "freelancer"
                            ? "Фрілансер"
                            : user.role === "client"
                            ? "Клієнт"
                            : "Адмін"}
                        </span>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/users/${user.id}`}>
                            <Eye className="h-3 w-3" />
                          </Link>
                        </Button>
                        {user.is_blocked ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnblockUser(user.id)}
                            disabled={isBlocking}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Shield className="h-3 w-3" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openBlockModal(user)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Ban className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Block Modal */}
        <BlockModal
          isOpen={blockModalOpen}
          onClose={() => {
            setBlockModalOpen(false);
            setSelectedUser(null);
          }}
          onConfirm={handleBlockUser}
          title="Block User"
          description={`Are you sure you want to block this user? This will prevent them from accessing the platform.`}
          type="user"
        />
      </div>
    </AdminOnly>
  );
}
