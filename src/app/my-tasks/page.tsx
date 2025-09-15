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
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import { PageHeader } from "@/components/ui/page-header";
import { TaskListSkeleton } from "@/components/ui/task-list-skeleton";
import { Plus, Eye, Edit, DollarSign, User, Calendar } from "lucide-react";
import Link from "next/link";
import { mapProjectTypeToDisplay } from "@/lib/project-types";

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
}

export default function MyTasksPage() {
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
          freelancer:freelancer_id(id, name, avatar)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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
            description="Керуйте завданнями, які ви створили"
            actions={
              profile?.role === "client" && (
                <Button asChild>
                  <Link
                    href="/tasks/create"
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Створити завдання
                  </Link>
                </Button>
              )
            }
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        <div className="max-w-6xl mx-auto">
          {tasks.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Немає завдань</h3>
                  <p className="text-muted-foreground mb-6">
                    Ви ще не створили жодного завдання. Створіть перше завдання,
                    щоб почати роботу з фрілансерами.
                  </p>
                  {profile?.role === "client" && (
                    <Button asChild>
                      <Link href="/tasks/create">Створити завдання</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {tasks.map((task) => (
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
                        {/* Task Type and Deadline */}
                        <div className="flex items-center gap-3 mb-4">
                          {task.project_type && (
                            <Badge variant="outline" className="text-xs">
                              {mapProjectTypeToDisplay(task.project_type) ||
                                task.project_type}
                            </Badge>
                          )}
                          {task.deadline && (
                            <span className="text-sm text-orange-600 font-medium">
                              Дедлайн: {formatDate(task.deadline)}
                            </span>
                          )}
                        </div>
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

                    {/* Additional Info */}
                    {task.estimated_duration && (
                      <div className="mb-4">
                        <span className="text-sm text-muted-foreground">
                          Тривалість:{" "}
                          <span className="font-medium">
                            {task.estimated_duration}
                          </span>
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Button variant="outline" asChild>
                          <Link href={`/tasks/${task.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            Переглянути
                          </Link>
                        </Button>

                        {task.status === "open" && (
                          <Button variant="outline" asChild>
                            <Link href={`/tasks/${task.id}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Редагувати
                            </Link>
                          </Button>
                        )}
                      </div>

                      <div className="text-sm">
                        {task.status === "open" && (
                          <span className="text-muted-foreground">
                            Очікуємо на фрілансера
                          </span>
                        )}

                        {task.status === "in_progress" && (
                          <span className="text-blue-600 font-medium">
                            В роботі
                          </span>
                        )}

                        {task.status === "completed" && (
                          <span className="text-green-600 font-medium">
                            Завершено
                          </span>
                        )}

                        {task.status === "cancelled" && (
                          <span className="text-red-600 font-medium">
                            Скасовано
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
