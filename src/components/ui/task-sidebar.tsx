"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  User,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  MessageCircle,
} from "lucide-react";

interface TaskSidebarProps {
  // Task info
  title: string;
  budget: number;
  status: string;
  createdAt: string;
  updatedAt: string;

  // Client info
  client: {
    id: string;
    name: string;
    avatar: string | null;
    role: string;
  };

  // Freelancer info (optional)
  freelancer?: {
    id: string;
    name: string;
    avatar: string | null;
  } | null;

  // User info
  currentUser?: {
    id: string;
    role: string;
  } | null;

  // Actions
  onStatusUpdate?: (status: string) => void;
  onDeleteTask?: () => void;
  onEditTask?: () => void;
  isUpdating?: boolean;
}

export function TaskSidebar({
  title,
  budget,
  status,
  createdAt,
  updatedAt,
  client,
  freelancer,
  currentUser,
  onStatusUpdate,
  onDeleteTask,
  onEditTask,
  isUpdating = false,
}: TaskSidebarProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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

  const isTaskCreator = currentUser && currentUser.id === client.id;
  const isTaskAssignee =
    currentUser && freelancer && currentUser.id === freelancer.id;

  return (
    <div className="space-y-6">
      {/* Task Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-3">{title}</h2>
            <div className="mb-4">{getStatusBadge(status)}</div>

            {/* Budget */}
            <div className="bg-primary/10 px-4 py-3 rounded-lg mb-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <DollarSign className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">Бюджет</span>
              </div>
              <div className="text-2xl font-bold text-primary">
                {budget.toLocaleString()} ₴
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Створено: {formatDate(createdAt)}</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Оновлено: {formatDate(updatedAt)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Замовник
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={client.avatar || ""} />
              <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{client.name}</p>
              <p className="text-sm text-muted-foreground">
                {client.role === "client" ? "Клієнт" : "Фрілансер"}
              </p>
            </div>
          </div>
          <div className="mt-3">
            <Button variant="outline" size="sm" className="w-full" asChild>
              <a href={`/clients/${client.id}`}>Переглянути профіль</a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Freelancer Info Card */}
      {freelancer && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Фрілансер
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={freelancer.avatar || ""} />
                <AvatarFallback>{freelancer.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{freelancer.name}</p>
                <p className="text-sm text-muted-foreground">Фрілансер</p>
              </div>
            </div>
            <div className="mt-3">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a href={`/freelancers/${freelancer.id}`}>
                  Переглянути профіль
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions Card */}
      {currentUser && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Дії</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isTaskCreator && (
              <>
                {status === "open" && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Очікуємо на фрілансера
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Заявки фрілансерів відображаються в закладці
                      &quot;Заявки&quot;
                    </p>
                  </div>
                )}
                {status === "in_progress" && (
                  <div className="space-y-2">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800 font-medium">
                        Проект в роботі
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Фрілансер працює над завданням
                      </p>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => onStatusUpdate?.("completed")}
                      disabled={isUpdating}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Завершити завдання
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => onStatusUpdate?.("cancelled")}
                      disabled={isUpdating}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Скасувати завдання
                    </Button>
                  </div>
                )}
                {status === "completed" && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">
                      Завдання завершено
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Робота виконана успішно
                    </p>
                  </div>
                )}
                {status === "cancelled" && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800 font-medium">
                      Завдання скасовано
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      Проект було скасовано
                    </p>
                  </div>
                )}
              </>
            )}

            {isTaskAssignee && (
              <>
                {status === "in_progress" && (
                  <div className="space-y-2">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800 font-medium">
                        Ви працюєте над цим завданням
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Використовуйте чат для спілкування з клієнтом
                      </p>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => onStatusUpdate?.("completed")}
                      disabled={isUpdating}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Завершити роботу
                    </Button>
                  </div>
                )}
                {status === "completed" && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">
                      Робота завершена
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Очікуємо підтвердження від клієнта
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Common Actions */}
            <div className="space-y-2 pt-3 border-t">
              {isTaskCreator && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={onEditTask}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Редагувати
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onDeleteTask}
                    className="w-full text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Видалити
                  </Button>
                </>
              )}

              {freelancer && (
                <Button asChild className="w-full">
                  <a href="/chat">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Перейти до чату
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
