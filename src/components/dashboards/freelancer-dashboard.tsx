"use client";

import { useEffect, useState, useCallback } from "react";
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
  Briefcase,
  Clock,
  CheckCircle,
  DollarSign,
  Star,
  MessageSquare,
  Eye,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Database } from "@/lib/supabase";
import { ChatIntegration } from "@/components/ui/chat-integration";
import { useAppStore } from "@/lib/store";
import {
  useNotifications,
  NotificationToast,
} from "@/components/ui/notification";
import { PageHeader } from "@/components/ui/page-header";
import { StatsGrid } from "@/components/ui/stats-grid";
import { ContentGrid } from "@/components/ui/content-grid";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

type Task = Database["public"]["Tables"]["tasks"]["Row"];
type Application = Database["public"]["Tables"]["applications"]["Row"];

interface УмілецьStats {
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  completedTasks: number;
  totalEarnings: number;
  averageRating: number;
}

export function FreelancerDashboard() {
  const { user, profile } = useAppStore();
  const { notifications, addNotification, dismissNotification } =
    useNotifications();
  const [stats, setStats] = useState<УмілецьStats>({
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    completedTasks: 0,
    totalEarnings: 0,
    averageRating: 0,
  });
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const subscribeToApplications = useCallback(() => {
    const channel = supabase
      .channel("applications_changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "applications",
        },
        (payload) => {
          // Show notification for application status change
          const application = payload.new as Application;
          if (application.freelancer_id === user?.id) {
            addNotification(
              "info",
              "Статус заявки змінився",
              `Ваша заявка ${
                application.status === "accepted" ? "прийнята" : "відхилена"
              }`
            );
          }
          // Refresh data when application status changes
          fetchFreelancerData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, addNotification]);

  useEffect(() => {
    fetchFreelancerData();
    const unsubscribe = subscribeToApplications();
    return unsubscribe;
  }, [subscribeToApplications]);

  const fetchFreelancerData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch applications
      const { data: applications } = await supabase
        .from("applications")
        .select("*")
        .eq("freelancer_id", user.id);

      // Fetch assigned tasks
      const { data: assignedTasks } = await supabase
        .from("tasks")
        .select("*")
        .eq("freelancer_id", user.id);

      // Fetch recent open tasks
      const { data: recentTasksData } = await supabase
        .from("tasks")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(5);

      // Calculate stats
      const totalApplications = applications?.length || 0;
      const pendingApplications =
        applications?.filter((app) => app.status === "pending").length || 0;
      const acceptedApplications =
        applications?.filter((app) => app.status === "accepted").length || 0;
      const completedTasks =
        assignedTasks?.filter((task) => task.status === "completed").length ||
        0;

      // Calculate total earnings (simplified - would need transaction data)
      const totalEarnings =
        assignedTasks
          ?.filter((task) => task.status === "completed")
          .reduce((sum, task) => sum + Number(task.budget), 0) || 0;

      setStats({
        totalApplications,
        pendingApplications,
        acceptedApplications,
        completedTasks,
        totalEarnings,
        averageRating: 4.8, // Placeholder
      });

      setRecentTasks(recentTasksData || []);
      setMyApplications(applications?.slice(0, 5) || []);
    } catch (error) {
      console.error("Error fetching freelancer data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Завантаження даних..." />;
  }

  return (
    <div className="min-h-screen bg-white">
      <NotificationToast
        notifications={notifications}
        onDismiss={dismissNotification}
      />

      {/* Header */}
      <div className="py-12 px-6">
        <PageHeader
          title="Особистий кабінет умільця"
          description="Керуйте своїми проєктами та розвивайте таланти"
        />
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100"></div>

      {/* Divider */}
      <div className="border-t border-gray-100"></div>

      {/* Stats Grid */}
      <div className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <StatsGrid
            stats={[
              {
                title: "Заявки",
                value: stats.totalApplications,
                description: `${stats.pendingApplications} очікують розгляду`,
                icon: <Briefcase className="h-4 w-4 text-muted-foreground" />,
              },
              {
                title: "Завершені",
                value: stats.completedTasks,
                description: "Проєктів успішно завершено",
                icon: <CheckCircle className="h-4 w-4 text-muted-foreground" />,
              },
              {
                title: "Заробіток",
                value: `₴${stats.totalEarnings.toLocaleString()}`,
                description: "Загальний заробіток",
                icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
              },
              {
                title: "Рейтинг",
                value: stats.averageRating,
                description: "Середня оцінка клієнтів",
                icon: <Star className="h-4 w-4 text-muted-foreground" />,
              },
            ]}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100"></div>

      {/* Main Content */}
      <div className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <ContentGrid>
            {/* Recent Tasks - Only for freelancers */}
            {profile?.role === "freelancer" ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Нові можливості</CardTitle>
                      <CardDescription>
                        Свіжі проєкти, що чекають на ваші таланти
                      </CardDescription>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/catalog/tasks">Всі проєкти</Link>
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
                            <Badge variant="secondary">₴{task.budget}</Badge>
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
                        Поки немає нових можливостей
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* My Applications - Only for freelancers */}
            {profile?.role === "freelancer" ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Мої заявки</CardTitle>
                      <CardDescription>
                        Перегляд статусу ваших поданих заявок
                      </CardDescription>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/my-applications">Всі заявки</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {myApplications.length > 0 ? (
                      myApplications.map((application) => (
                        <div
                          key={application.id}
                          className="border rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium line-clamp-1">
                              Заявка #{application.id.slice(0, 8)}
                            </h4>
                            <Badge
                              variant={
                                application.status === "accepted"
                                  ? "default"
                                  : application.status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {application.status === "accepted"
                                ? "Прийнято"
                                : application.status === "rejected"
                                ? "Відхилено"
                                : "В очікуванні"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {application.message}
                          </p>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-muted-foreground">
                              {new Date(
                                application.created_at
                              ).toLocaleDateString("uk-UA")}
                            </span>
                            {application.proposed_budget && (
                              <span className="text-sm font-medium">
                                ₴{application.proposed_budget}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/tasks/${application.task_id}`}>
                                <Eye className="h-4 w-4 mr-1" />
                                Переглянути завдання
                              </Link>
                            </Button>
                            {application.status === "accepted" && (
                              <Button variant="outline" size="sm" asChild>
                                <Link href="/chat">
                                  <MessageSquare className="h-4 w-4 mr-1" />
                                  Чат
                                </Link>
                              </Button>
                            )}
                            {application.status === "pending" && (
                              <div className="flex items-center gap-1 text-amber-600">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-xs">Очікує рішення</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        Ви ще не подавали заявки на проєкти
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Chat Integration */}
            {user && (
              <div className="xl:col-span-1">
                <ChatIntegration userRole="freelancer" userId={user.id} />
              </div>
            )}
          </ContentGrid>

          {/* Quick Actions */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Швидкі дії</CardTitle>
              <CardDescription>
                Найпопулярніші функції для роботи
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button asChild className="h-20 flex-col gap-2">
                  <Link href="/catalog/tasks">
                    <Briefcase className="h-6 w-6" />
                    <span>Знайти проєкти</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-20 flex-col gap-2"
                >
                  <Link href="/my-applications">
                    <Clock className="h-6 w-6" />
                    <span>Мої заявки</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-20 flex-col gap-2"
                >
                  <Link href="/chat">
                    <MessageSquare className="h-6 w-6" />
                    <span>Повідомлення</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
