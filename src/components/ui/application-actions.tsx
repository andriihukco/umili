"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import {
  CheckCircle,
  XCircle,
  Send,
  DollarSign,
  MessageCircle,
  User,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

interface Application {
  id: string;
  task_id: string;
  freelancer_id: string;
  message: string;
  proposed_budget: number | null;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  updated_at: string;
  freelancer: {
    id: string;
    name: string;
    avatar: string | null;
    bio: string | null;
    skills: string[] | null;
    hourly_rate: number | null;
  };
}

interface Task {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: string;
  client_id: string;
  freelancer_id: string | null;
  created_at: string;
  client: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

interface ApplicationActionsProps {
  task: Task;
  applications: Application[];
  onApplicationUpdate: () => void;
}

export function ApplicationActions({
  task,
  applications,
  onApplicationUpdate,
}: ApplicationActionsProps) {
  const { user, profile } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState("");
  const [proposedBudget, setProposedBudget] = useState("");

  const handleApply = async () => {
    if (!user || !applicationMessage.trim()) {
      toast.error("Будь ласка, напишіть повідомлення");
      return;
    }

    setIsApplying(true);

    try {
      const { error } = await supabase.from("applications").insert({
        task_id: task.id,
        freelancer_id: user.id,
        message: applicationMessage.trim(),
        proposed_budget: proposedBudget ? parseFloat(proposedBudget) : null,
      });

      if (error) {
        console.error("Error applying:", error);
        console.error("Error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });

        // Show more specific error message
        let errorMessage = "Помилка при подачі заявки";
        if (error.code === "23505") {
          errorMessage = "Ви вже подавали заявку на цей проєкт";
        } else if (error.code === "23503") {
          errorMessage = "Помилка з посиланнями на проєкт або користувача";
        } else if (error.message) {
          errorMessage = `Помилка: ${error.message}`;
        }

        toast.error(errorMessage);
        return;
      }

      toast.success("Заявку подано успішно!");
      setApplicationMessage("");
      setProposedBudget("");
      onApplicationUpdate();
    } catch (error) {
      console.error("Error applying:", error);
      toast.error("Помилка при подачі заявки");
    } finally {
      setIsApplying(false);
    }
  };

  const handleAcceptApplication = async (application: Application) => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("applications")
        .update({ status: "accepted" })
        .eq("id", application.id);

      if (error) {
        console.error("Error accepting application:", error);
        toast.error("Помилка при прийнятті заявки");
        return;
      }

      toast.success("Заявку прийнято! Розмова розпочата.");
      onApplicationUpdate();
    } catch (error) {
      console.error("Error accepting application:", error);
      toast.error("Помилка при прийнятті заявки");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectApplication = async (application: Application) => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("applications")
        .update({ status: "rejected" })
        .eq("id", application.id);

      if (error) {
        console.error("Error rejecting application:", error);
        toast.error("Помилка при відхиленні заявки");
        return;
      }

      toast.success("Заявку відхилено");
      onApplicationUpdate();
    } catch (error) {
      console.error("Error rejecting application:", error);
      toast.error("Помилка при відхиленні заявки");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: "Очікує", variant: "default" as const },
      accepted: { label: "Прийнято", variant: "secondary" as const },
      rejected: { label: "Відхилено", variant: "destructive" as const },
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

  const userApplication = applications.find(
    (app) => app.freelancer_id === user?.id
  );
  const pendingApplications = applications.filter(
    (app) => app.status === "pending"
  );

  return (
    <div className="space-y-6">
      {/* Apply Section - Only for freelancers */}
      {profile?.role === "freelancer" &&
        !userApplication &&
        task.status === "open" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Подати заявку
              </CardTitle>
              <CardDescription>
                Напишіть повідомлення клієнту та запропонуйте свою ціну
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="message">Повідомлення клієнту</Label>
                <Textarea
                  id="message"
                  placeholder="Розкажіть про свій досвід та чому ви підходите для цього проєкту..."
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Запропонована ціна (₴)</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder={`${task.budget}`}
                  value={proposedBudget}
                  onChange={(e) => setProposedBudget(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Бюджет проєкту: {task.budget.toLocaleString()} ₴
                </p>
              </div>
              <Button
                onClick={handleApply}
                disabled={isApplying || !applicationMessage.trim()}
                className="w-full"
              >
                {isApplying ? "Подаю заявку..." : "Подати заявку"}
              </Button>
            </CardContent>
          </Card>
        )}

      {/* User's Application Status */}
      {userApplication && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Ваша заявка
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Статус:</span>
                {getStatusBadge(userApplication.status)}
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Ваше повідомлення:
                </p>
                <p className="text-sm bg-muted p-3 rounded-lg">
                  {userApplication.message}
                </p>
              </div>
              {userApplication.proposed_budget && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">
                    Запропонована ціна:{" "}
                    {userApplication.proposed_budget.toLocaleString()} ₴
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Подано: {formatDate(userApplication.created_at)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Applications List - Only for clients */}
      {profile?.role === "client" && pendingApplications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Заявки умільців ({pendingApplications.length})
            </CardTitle>
            <CardDescription>
              Оберіть умільця для виконання проєкту
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingApplications.map((application) => (
              <div
                key={application.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {application.freelancer.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium">
                        {application.freelancer.name}
                      </h4>
                      {application.freelancer.hourly_rate && (
                        <p className="text-sm text-muted-foreground">
                          {application.freelancer.hourly_rate} ₴/год
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAcceptApplication(application)}
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Прийняти
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRejectApplication(application)}
                      disabled={isSubmitting}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Відхилити
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Повідомлення:</p>
                  <p className="text-sm bg-muted p-3 rounded-lg">
                    {application.message}
                  </p>
                </div>

                {application.proposed_budget && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm">
                      Запропонована ціна:{" "}
                      {application.proposed_budget.toLocaleString()} ₴
                    </span>
                  </div>
                )}

                {application.freelancer.skills &&
                  application.freelancer.skills.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Навички:</p>
                      <div className="flex flex-wrap gap-1">
                        {application.freelancer.skills.map((skill, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Подано: {formatDate(application.created_at)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* No Applications Message */}
      {profile?.role === "client" && pendingApplications.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Немає заявок</h3>
            <p className="text-muted-foreground">
              Поки що ніхто не подав заявку на цей проєкт
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
