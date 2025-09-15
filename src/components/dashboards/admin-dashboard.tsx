"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Briefcase,
  DollarSign,
  TrendingUp,
  Clock,
  BarChart3,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Database } from "@/lib/supabase";
import { PageHeader } from "@/components/ui/page-header";

type Task = Database["public"]["Tables"]["tasks"]["Row"];
type User = Database["public"]["Tables"]["users"]["Row"];

interface AdminStats {
  totalUsers: number;
  totalTasks: number;
  totalRevenue: number;
  activeFreelancers: number;
  activeClients: number;
  completedTasks: number;
  pendingApplications: number;
  platformGrowth: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalTasks: 0,
    totalRevenue: 0,
    activeFreelancers: 0,
    activeClients: 0,
    completedTasks: 0,
    pendingApplications: 0,
    platformGrowth: 0,
  });
  const [activeTab, setActiveTab] = useState<"overview">("overview");
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // Fetch all users
      const { data: users } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      // Fetch all tasks
      const { data: tasks } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      // Fetch all applications
      const { data: applications } = await supabase
        .from("applications")
        .select("*");

      // Calculate stats
      const totalUsers = users?.length || 0;
      const totalTasks = tasks?.length || 0;
      const activeFreelancers =
        users?.filter((user) => user.role === "freelancer").length || 0;
      const activeClients =
        users?.filter((user) => user.role === "client").length || 0;
      const completedTasks =
        tasks?.filter((task) => task.status === "completed").length || 0;
      const pendingApplications =
        applications?.filter((app) => app.status === "pending").length || 0;

      // Calculate total revenue (simplified - would need transaction data)
      const totalRevenue =
        tasks
          ?.filter((task) => task.status === "completed")
          .reduce((sum, task) => sum + Number(task.budget), 0) || 0;

      // Calculate platform growth (simplified - would need historical data)
      const platformGrowth = 15.2; // Placeholder

      setStats({
        totalUsers,
        totalTasks,
        totalRevenue,
        activeFreelancers,
        activeClients,
        completedTasks,
        pendingApplications,
        platformGrowth,
      });

      setRecentUsers(users?.slice(0, 5) || []);
      setRecentTasks(tasks?.slice(0, 5) || []);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Завантаження даних...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Admin Dashboard"
        description="Platform management and activity monitoring"
      />
      <div className="px-6 py-6">
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "overview"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Overview
              </button>
            </nav>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === "overview" && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Користувачі
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeFreelancers} умільців, {stats.activeClients}{" "}
                    клієнтів
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Проєкти</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalTasks}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.completedTasks} завершених
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Дохід платформи
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₴{stats.totalRevenue.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Загальний обсяг транзакцій
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Ріст платформи
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    +{stats.platformGrowth}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    За останній місяць
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Заявки на розгляд
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.pendingApplications}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Потребують уваги
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Активні умільці
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.activeFreelancers}
                  </div>
                  <p className="text-xs text-muted-foreground">На платформі</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Активні клієнти
                  </CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.activeClients}
                  </div>
                  <p className="text-xs text-muted-foreground">На платформі</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Users */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Нові користувачі</CardTitle>
                      <CardDescription>
                        Останні зареєстровані користувачі
                      </CardDescription>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/admin/users">Всі користувачі</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentUsers.length > 0 ? (
                      recentUsers.map((user) => (
                        <div key={user.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium">{user.name}</h4>
                            <Badge
                              variant={
                                user.role === "admin"
                                  ? "destructive"
                                  : user.role === "client"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {user.role === "freelancer"
                                ? "Фрілансер"
                                : user.role === "client"
                                ? "Клієнт"
                                : "Адмін"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {user.email}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              Роль: {user.role}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(user.created_at).toLocaleDateString(
                                "uk-UA"
                              )}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        Немає нових користувачів
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Tasks */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Останні завдання</CardTitle>
                      <CardDescription>
                        Нові завдання на платформі
                      </CardDescription>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/admin/tasks">Всі завдання</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentTasks.length > 0 ? (
                      recentTasks.map((task) => (
                        <div key={task.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium line-clamp-1">
                              {task.title}
                            </h4>
                            <div className="flex gap-2">
                              <Badge variant="secondary">₴{task.budget}</Badge>
                              <Badge
                                variant={
                                  task.status === "completed"
                                    ? "default"
                                    : task.status === "in_progress"
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {task.status === "open"
                                  ? "Відкрите"
                                  : task.status === "in_progress"
                                  ? "В роботі"
                                  : task.status === "completed"
                                  ? "Завершене"
                                  : "Скасоване"}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {task.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {new Date(task.created_at).toLocaleDateString(
                                "uk-UA"
                              )}
                            </span>
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/tasks/${task.id}`}>
                                Переглянути
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        Немає проєктів
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Адміністративні дії</CardTitle>
                <CardDescription>
                  Керування платформою та користувачами
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button asChild className="h-20 flex-col gap-2">
                    <Link href="/admin/users">
                      <Users className="h-6 w-6" />
                      <span>Користувачі</span>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-20 flex-col gap-2"
                  >
                    <Link href="/admin/projects">
                      <Briefcase className="h-6 w-6" />
                      <span>Проєкти та завдання</span>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-20 flex-col gap-2"
                  >
                    <Link href="/admin/analytics">
                      <BarChart3 className="h-6 w-6" />
                      <span>Аналітика</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Subscription Management Tab */}
      </div>
    </div>
  );
}
