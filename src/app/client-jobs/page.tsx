"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import { PageHeader } from "@/components/ui/page-header";
import { ContentLayout, ContentList } from "@/components/ui/content-layout";
import { TaskListSkeleton } from "@/components/ui/task-list-skeleton";
import {
  Plus,
  Eye,
  Edit,
  DollarSign,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  MessageCircle,
  Archive,
} from "lucide-react";
import Link from "next/link";

interface Task {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: string;
  created_at: string;
  updated_at: string;
  client_id: string;
  freelancer_id: string | null;
  project_type: string | null;
  deadline: string | null;
  estimated_duration: string | null;
  freelancer: {
    id: string;
    name: string;
    avatar: string | null;
  } | null;
  applications: {
    id: string;
    freelancer_id: string;
    task_id: string;
    message: string;
    proposed_budget: number | null;
    status: string;
    created_at: string;
    freelancer: {
      id: string;
      name: string;
      avatar: string | null;
    };
  }[];
}

export default function ClientJobsPage() {
  const { user, profile } = useAppStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMyTasks = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("tasks")
        .select(
          `
          *,
          freelancer:freelancer_id(id, name, avatar),
          applications:applications(
            id, freelancer_id, task_id, message, proposed_budget, status, created_at,
            freelancer:freelancer_id(id, name, avatar)
          )
        `
        )
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching my tasks:", error);
        return;
      }

      setTasks(data || []);
    } catch (error) {
      console.error("Error fetching my tasks:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchMyTasks();
    }
  }, [user, fetchMyTasks]);

  const handleApplicationAction = async (
    applicationId: string,
    action: "accept" | "reject"
  ) => {
    try {
      const { error } = await supabase
        .from("applications")
        .update({ status: action === "accept" ? "accepted" : "rejected" })
        .eq("id", applicationId);

      if (error) {
        console.error("Error updating application:", error);
        return;
      }

      // If accepted, update the task to assign the freelancer
      if (action === "accept") {
        const application = tasks
          .flatMap((task) => task.applications)
          .find((app) => app.id === applicationId);

        if (application) {
          const { error: taskError } = await supabase
            .from("tasks")
            .update({
              freelancer_id: application.freelancer_id,
              status: "in_progress",
            })
            .eq("id", application.task_id);

          if (taskError) {
            console.error("Error updating task:", taskError);
          }
        }
      }

      // Refresh data
      fetchMyTasks();
    } catch (error) {
      console.error("Error handling application:", error);
    }
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
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getApplicationStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: "Очікує", variant: "secondary" as const },
      accepted: { label: "Прийнята", variant: "default" as const },
      rejected: { label: "Відхилена", variant: "destructive" as const },
    };
    const statusInfo =
      statusMap[status as keyof typeof statusMap] || statusMap.pending;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Filter tasks by status
  const openTasks = tasks.filter((task) => task.status === "open");
  const completedTasks = tasks.filter((task) => task.status === "completed");

  // Get tasks with pending applications
  const tasksWithApplications = tasks.filter((task) =>
    task.applications.some((app) => app.status === "pending")
  );

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <CardTitle>Доступ обмежено</CardTitle>
            <CardDescription>
              Для перегляду ваших завдань необхідно увійти в систему
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 justify-center">
              <Button asChild>
                <Link href="/auth/login">Увійти</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/auth/register">Реєстрація</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (profile?.role !== "client") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-red-600">Доступ обмежено</CardTitle>
            <CardDescription>
              Тільки клієнти можуть переглядати цю сторінку
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/catalog/tasks">Переглянути завдання</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <TaskListSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div>
        <div className="px-6 py-6">
          <PageHeader
            title="Мої завдання"
            description="Керуйте завданнями та заявками фрілансерів"
            actions={
              <Button asChild>
                <Link href="/tasks/create" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Створити завдання
                </Link>
              </Button>
            }
          />
        </div>
      </div>

      {/* Main Content */}
      <ContentLayout>
        <Tabs defaultValue="created" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="created" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Створені завдання ({openTasks.length})
            </TabsTrigger>
            <TabsTrigger
              value="applications"
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Заявки ({tasksWithApplications.length})
            </TabsTrigger>
            <TabsTrigger value="archive" className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              Архів ({completedTasks.length})
            </TabsTrigger>
          </TabsList>

          {/* Created Jobs Tab */}
          <TabsContent value="created" className="space-y-6">
            {openTasks.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plus className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      Немає відкритих завдань
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Ви ще не створили жодного завдання. Створіть перше
                      завдання, щоб почати роботу з фрілансерами.
                    </p>
                    <Button asChild>
                      <Link href="/tasks/create">Створити завдання</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <ContentList>
                {openTasks.map((task) => (
                  <Card
                    key={task.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">
                            {task.title}
                          </CardTitle>
                          <CardDescription className="text-base mb-4">
                            {task.description}
                          </CardDescription>
                        </div>
                        {getStatusBadge(task.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold text-lg">
                            {task.budget.toLocaleString()} ₴
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(task.created_at)}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <MessageCircle className="h-4 w-4 text-muted-foreground" />
                          <span>{task.applications.length} заявок</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <Button variant="outline" asChild>
                            <Link href={`/tasks/${task.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              Переглянути
                            </Link>
                          </Button>
                          <Button variant="outline" asChild>
                            <Link href={`/tasks/${task.id}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Редагувати
                            </Link>
                          </Button>
                        </div>

                        <div className="text-sm text-muted-foreground">
                          Очікуємо на фрілансера
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </ContentList>
            )}
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            {tasksWithApplications.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Немає заявок</h3>
                    <p className="text-muted-foreground mb-6">
                      На ваші завдання ще не надходили заявки від фрілансерів.
                    </p>
                    <Button asChild>
                      <Link href="/tasks/create">Створити завдання</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <ContentList>
                {tasksWithApplications.map((task) =>
                  task.applications
                    .filter((app) => app.status === "pending")
                    .map((application) => (
                      <Card
                        key={application.id}
                        className="hover:shadow-lg transition-shadow"
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg mb-2">
                                {task.title}
                              </CardTitle>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  <span>
                                    Бюджет: {task.budget.toLocaleString()} ₴
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>
                                    Заявка: {formatDate(application.created_at)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {getApplicationStatusBadge(application.status)}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {/* Freelancer Info */}
                            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                              <Avatar>
                                <AvatarImage
                                  src={application.freelancer.avatar || ""}
                                />
                                <AvatarFallback>
                                  {application.freelancer.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {application.freelancer.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Фрілансер
                                </p>
                              </div>
                            </div>

                            {/* Application Message */}
                            <div className="space-y-2">
                              <h4 className="font-semibold">
                                Повідомлення від фрілансера:
                              </h4>
                              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm">{application.message}</p>
                              </div>
                            </div>

                            {/* Proposed Budget */}
                            {application.proposed_budget && (
                              <div className="space-y-2">
                                <h4 className="font-semibold">
                                  Запропонований бюджет:
                                </h4>
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                  <p className="text-sm font-semibold text-green-800">
                                    {application.proposed_budget.toLocaleString()}{" "}
                                    ₴
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-3 pt-4 border-t">
                              <Button
                                onClick={() =>
                                  handleApplicationAction(
                                    application.id,
                                    "accept"
                                  )
                                }
                                className="flex items-center gap-2"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Прийняти
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() =>
                                  handleApplicationAction(
                                    application.id,
                                    "reject"
                                  )
                                }
                                className="flex items-center gap-2"
                              >
                                <XCircle className="h-4 w-4" />
                                Відхилити
                              </Button>
                              <Button variant="outline" asChild>
                                <Link href={`/tasks/${task.id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Переглянути завдання
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                )}
              </ContentList>
            )}
          </TabsContent>

          {/* Archive Tab */}
          <TabsContent value="archive" className="space-y-6">
            {completedTasks.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Archive className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      Архів порожній
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Тут будуть відображатися завершені проєкти.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <ContentList>
                {completedTasks.map((task) => (
                  <Card
                    key={task.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">
                            {task.title}
                          </CardTitle>
                          <CardDescription className="text-base mb-4">
                            {task.description}
                          </CardDescription>
                        </div>
                        {getStatusBadge(task.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold text-lg">
                            {task.budget.toLocaleString()} ₴
                          </span>
                        </div>

                        {task.freelancer && (
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>Фрілансер: {task.freelancer.name}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(task.created_at)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <Button variant="outline" asChild>
                            <Link href={`/tasks/${task.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              Переглянути
                            </Link>
                          </Button>
                        </div>

                        <div className="text-sm text-green-600 font-medium">
                          Завершено
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </ContentList>
            )}
          </TabsContent>
        </Tabs>
      </ContentLayout>
    </div>
  );
}
