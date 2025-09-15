"use client";

import { useState, useEffect } from "react";
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
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import { PageHeader } from "@/components/ui/page-header";
import {
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  User,
  Calendar,
  Eye,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";

interface Application {
  id: string;
  message: string;
  proposed_budget: number | null;
  status: string;
  created_at: string;
  freelancer: {
    id: string;
    name: string;
    avatar: string | null;
    role: string;
  };
  task: {
    id: string;
    title: string;
    budget: number;
    status: string;
  };
}

export default function ApplicationsPage() {
  const { user, profile } = useAppStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && profile?.role === "client") {
      fetchApplications();
    }
  }, [user, profile]);

  const fetchApplications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("applications")
        .select(
          `
          *,
          freelancer:freelancer_id(id, name, avatar, role),
          task:task_id(id, title, budget, status)
        `
        )
        .eq("task.created_by", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching applications:", error);
        return;
      }

      setApplications(data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplicationAction = async (
    applicationId: string,
    action: "accepted" | "rejected"
  ) => {
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
        const application = applications.find(
          (app) => app.id === applicationId
        );
        if (application) {
          const { error: taskError } = await supabase
            .from("tasks")
            .update({
              assigned_to: application.freelancer.id,
              status: "in_progress",
            })
            .eq("id", application.task.id);

          if (taskError) {
            console.error("Error assigning freelancer:", taskError);
            alert("Помилка при призначенні фрілансера");
            return;
          }
        }
      }

      alert(`Заявка ${action === "accepted" ? "прийнята" : "відхилена"}!`);
      fetchApplications();
    } catch (error) {
      console.error(`Error ${action} application:`, error);
      alert(
        `Помилка при ${
          action === "accepted" ? "прийнятті" : "відхиленні"
        } заявки`
      );
    }
  };

  const getStatusBadge = (status: string) => {
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <CardTitle>Доступ обмежено</CardTitle>
            <CardDescription>
              Для перегляду заявок необхідно увійти в систему
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
              Тільки клієнти можуть переглядати заявки фрілансерів
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
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Завантаження...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Заявки фрілансерів"
        description="Керуйте заявками на ваші завдання"
      />

      {applications.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Немає заявок</h3>
              <p className="text-muted-foreground mb-6">
                Поки що немає заявок на ваші завдання. Створіть завдання, щоб
                почати отримувати заявки від фрілансерів.
              </p>
              <Button asChild>
                <Link href="/tasks/create">Створити завдання</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {applications.map((application) => (
            <Card
              key={application.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">
                      {application.task.title}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>
                          Бюджет: {application.task.budget.toLocaleString()} ₴
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
                  {getStatusBadge(application.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Freelancer Info */}
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Avatar>
                      <AvatarImage src={application.freelancer.avatar || ""} />
                      <AvatarFallback>
                        {application.freelancer.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {application.freelancer.name}
                      </p>
                      <p className="text-sm text-muted-foreground">Фрілансер</p>
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
                      <h4 className="font-semibold">Запропонований бюджет:</h4>
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-semibold text-green-800">
                          {application.proposed_budget.toLocaleString()} ₴
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-4 border-t">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/tasks/${application.task.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        Переглянути завдання
                      </Link>
                    </Button>

                    {application.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() =>
                            handleApplicationAction(application.id, "accepted")
                          }
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Прийняти
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleApplicationAction(application.id, "rejected")
                          }
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Відхилити
                        </Button>
                      </>
                    )}

                    {application.status === "accepted" && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Заявка прийнята
                        </span>
                      </div>
                    )}

                    {application.status === "rejected" && (
                      <div className="flex items-center gap-2 text-red-600">
                        <XCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Заявка відхилена
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
