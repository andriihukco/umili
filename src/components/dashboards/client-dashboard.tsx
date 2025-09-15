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
  Plus,
  Users,
  Clock,
  CheckCircle,
  DollarSign,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Eye,
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

interface ClientStats {
  totalTasks: number;
  openTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  totalSpent: number;
  activeУмільці: number;
}

export function ClientDashboard() {
  const { user, profile } = useAppStore();
  const { notifications, addNotification, dismissNotification } =
    useNotifications();
  const [stats, setStats] = useState<ClientStats>({
    totalTasks: 0,
    openTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    totalSpent: 0,
    activeУмільці: 0,
  });
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [pendingApplications, setPendingApplications] = useState<Application[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [processingApplication, setProcessingApplication] = useState<
    string | null
  >(null);

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
        () => {
          // Refresh data when application status changes
          fetchClientData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    fetchClientData();
    const unsubscribe = subscribeToApplications();
    return unsubscribe;
  }, [subscribeToApplications]);

  const fetchClientData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch my tasks
      const { data: myTasks } = await supabase
        .from("tasks")
        .select("*")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      // Fetch applications for my tasks
      const { data: applications } = await supabase
        .from("applications")
        .select(
          `
          *,
          tasks!inner(client_id)
        `
        )
        .eq("tasks.client_id", user.id);

      // Calculate stats
      const totalTasks = myTasks?.length || 0;
      const openTasks =
        myTasks?.filter((task) => task.status === "open").length || 0;
      const inProgressTasks =
        myTasks?.filter((task) => task.status === "in_progress").length || 0;
      const completedTasks =
        myTasks?.filter((task) => task.status === "completed").length || 0;

      // Calculate total spent (simplified - would need transaction data)
      const totalSpent =
        myTasks
          ?.filter((task) => task.status === "completed")
          .reduce((sum, task) => sum + Number(task.budget), 0) || 0;

      // Count unique freelancers
      const activeFreelancers = new Set(
        myTasks
          ?.filter((task) => task.freelancer_id)
          .map((task) => task.freelancer_id)
      ).size;

      setStats({
        totalTasks,
        openTasks,
        inProgressTasks,
        completedTasks,
        totalSpent,
        activeУмільці: activeFreelancers,
      });

      setRecentTasks(myTasks?.slice(0, 5) || []);
      setPendingApplications(
        applications?.filter((app) => app.status === "pending").slice(0, 5) ||
          []
      );
    } catch (error) {
      console.error("Error fetching client data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationAction = async (
    applicationId: string,
    action: "accepted" | "rejected"
  ) => {
    setProcessingApplication(applicationId);

    try {
      const { error } = await supabase
        .from("applications")
        .update({ status: action })
        .eq("id", applicationId);

      if (error) {
        console.error(`Error ${action} application:`, error);
        alert(
          `Помилка при ${
            action === "accepted" ? "прийнятті" : "відхиленні"
          } заявки`
        );
        return;
      }

      // If accepted, assign the freelancer to the task
      if (action === "accepted") {
        const application = pendingApplications.find(
          (app) => app.id === applicationId
        );
        if (application) {
          const { error: taskError } = await supabase
            .from("tasks")
            .update({
              freelancer_id: application.freelancer_id,
              status: "in_progress",
            })
            .eq("id", application.task_id);

          if (taskError) {
            console.error("Error assigning freelancer:", taskError);
            alert("Помилка при призначенні умільця");
            return;
          }
        }
      }

      // Show notification
      addNotification(
        "success",
        "Заявка оброблена",
        `Заявка ${action === "accepted" ? "прийнята" : "відхилена"} успішно`
      );

      // Refresh data
      fetchClientData();
    } catch (error) {
      console.error(`Error ${action} application:`, error);
      addNotification(
        "error",
        "Помилка",
        `Помилка при ${
          action === "accepted" ? "прийнятті" : "відхиленні"
        } заявки`
      );
    } finally {
      setProcessingApplication(null);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Завантаження даних..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <NotificationToast
        notifications={notifications}
        onDismiss={dismissNotification}
      />
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <PageHeader
          title="Особистий кабінет клієнта"
          description="Керуйте своїми проєктами та знаходьте талановитих умільців"
        />

        {/* Stats Grid */}
        <StatsGrid
          stats={[
            {
              title: "Завдання",
              value: stats.totalTasks,
              description: `${stats.openTasks} очікують виконавців`,
              icon: <Plus className="h-4 w-4 text-muted-foreground" />,
            },
            {
              title: "В роботі",
              value: stats.inProgressTasks,
              description: "Проєктів у виконанні",
              icon: <Clock className="h-4 w-4 text-muted-foreground" />,
            },
            {
              title: "Завершені",
              value: stats.completedTasks,
              description: "Успішно завершених проєктів",
              icon: <CheckCircle className="h-4 w-4 text-muted-foreground" />,
            },
            {
              title: "Витрачено",
              value: `₴${stats.totalSpent.toLocaleString()}`,
              description: "Загальний бюджет проєктів",
              icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
            },
          ]}
        />

        {/* Main Content */}
        <ContentGrid>
          {/* My Tasks - Only for clients */}
          {profile?.role === "client" ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Мої проєкти</CardTitle>
                    <CardDescription>
                      Останні створені вами проєкти
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href="/my-tasks">Всі проєкти</Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link href="/tasks/create">Створити проєкт</Link>
                    </Button>
                  </div>
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
                            <Link href={`/tasks/${task.id}`}>Переглянути</Link>
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        Ви ще не створювали проєкти
                      </p>
                      <Button asChild>
                        <Link href="/tasks/create">Створити перший проєкт</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Pending Applications - Only for clients */}
          {profile?.role === "client" ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Заявки на розгляд</CardTitle>
                    <CardDescription>
                      Заявки умільців на ваші проєкти
                    </CardDescription>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/applications">Всі заявки</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingApplications.length > 0 ? (
                    pendingApplications.map((application) => (
                      <div
                        key={application.id}
                        className="border rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium line-clamp-1">
                            Заявка #{application.id.slice(0, 8)}
                          </h4>
                          <Badge variant="secondary">В очікуванні</Badge>
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
                          <Button
                            size="sm"
                            onClick={() =>
                              handleApplicationAction(
                                application.id,
                                "accepted"
                              )
                            }
                            disabled={processingApplication === application.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Прийняти
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleApplicationAction(
                                application.id,
                                "rejected"
                              )
                            }
                            disabled={processingApplication === application.id}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Відхилити
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/tasks/${application.task_id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              Переглянути
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Немає заявок на розгляд
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Chat Integration */}
          {user && (
            <div className="xl:col-span-1">
              <ChatIntegration userRole="client" userId={user.id} />
            </div>
          )}
        </ContentGrid>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Швидкі дії</CardTitle>
            <CardDescription>Найпопулярніші функції для роботи</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button asChild className="h-20 flex-col gap-2">
                <Link href="/tasks/create">
                  <Plus className="h-6 w-6" />
                  <span>Створити проєкт</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col gap-2">
                <Link href="/catalog/freelancers">
                  <Users className="h-6 w-6" />
                  <span>Знайти умільця</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col gap-2">
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
  );
}
