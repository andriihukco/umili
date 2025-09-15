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
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import { PageHeader } from "@/components/ui/page-header";
import {
  Clock,
  DollarSign,
  Calendar,
  Eye,
  MessageCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";

interface Application {
  id: string;
  message: string;
  proposed_budget: number | null;
  status: string;
  created_at: string;
  task: {
    id: string;
    title: string;
    description: string;
    budget: number;
    status: string;
    created_at: string;
    client: {
      id: string;
      name: string;
      avatar: string | null;
    };
  };
}

export default function MyApplicationsPage() {
  const { user, profile } = useAppStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMyApplications = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("applications")
        .select(
          `
          *,
          task:task_id(
            id, title, description, budget, status, created_at,
            client:client_id(id, name, avatar)
          )
        `
        )
        .eq("freelancer_id", user.id)
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
  }, [user]);

  useEffect(() => {
    if (user && profile?.role === "freelancer") {
      fetchMyApplications();
    }
  }, [user, profile, fetchMyApplications]);

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
              Для перегляду ваших заявок необхідно увійти в систему
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

  if (profile?.role !== "freelancer") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-red-600">Доступ обмежено</CardTitle>
            <CardDescription>
              Тільки фрілансери можуть переглядати свої заявки
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div>
        <div className="px-6 py-6">
          <PageHeader
            title="Мої заявки"
            description="Переглядайте статус ваших заявок на завдання"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        <div className="max-w-6xl mx-auto">
          {applications.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Немає заявок</h3>
                  <p className="text-muted-foreground mb-6">
                    Ви ще не подавали заявки на завдання. Перегляньте доступні
                    завдання та подайте свою першу заявку.
                  </p>
                  <Button asChild>
                    <Link href="/catalog/tasks">Переглянути завдання</Link>
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
                              Бюджет: {application.task.budget.toLocaleString()}{" "}
                              ₴
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
                      {/* Client Info */}
                      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <Avatar>
                          <AvatarImage
                            src={application.task.client.avatar || ""}
                          />
                          <AvatarFallback>
                            {application.task.client.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {application.task.client.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Клієнт
                          </p>
                        </div>
                      </div>

                      {/* Task Description */}
                      <div className="space-y-2">
                        <h4 className="font-semibold">Опис завдання:</h4>
                        <div className="p-3 bg-gray-50 border rounded-lg">
                          <p className="text-sm line-clamp-3">
                            {application.task.description}
                          </p>
                        </div>
                      </div>

                      {/* Your Application Message */}
                      <div className="space-y-2">
                        <h4 className="font-semibold">Ваше повідомлення:</h4>
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm">{application.message}</p>
                        </div>
                      </div>

                      {/* Proposed Budget */}
                      {application.proposed_budget && (
                        <div className="space-y-2">
                          <h4 className="font-semibold">
                            Ваш запропонований бюджет:
                          </h4>
                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm font-semibold text-green-800">
                              {application.proposed_budget.toLocaleString()} ₴
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Status and Actions */}
                      <div className="flex items-center gap-3 pt-4 border-t">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/tasks/${application.task.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            Переглянути завдання
                          </Link>
                        </Button>

                        {application.status === "pending" && (
                          <div className="flex items-center gap-2 text-blue-600">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              Очікуємо відповіді від клієнта
                            </span>
                          </div>
                        )}

                        {application.status === "accepted" && (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              Заявка прийнята! Можете починати роботу
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
      </div>
    </div>
  );
}
