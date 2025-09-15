"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import { ProfileLayout } from "@/components/ui/profile-layout";
import { TaskSidebar } from "@/components/ui/task-sidebar";
import { ApplicationActions } from "@/components/ui/application-actions";
import { BlockedError } from "@/components/ui/blocked-error";
import { TaskDetailSkeleton } from "@/components/ui/task-detail-skeleton";
import { MessageCircle } from "lucide-react";
import Link from "next/link";

interface Task {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: string;
  client_id: string;
  freelancer_id: string | null;
  created_at: string;
  updated_at: string;
  is_blocked: boolean;
  block_reason: string | null;
  blocked_at: string | null;
  client: {
    id: string;
    name: string;
    avatar: string | null;
    role: string;
  };
  freelancer: {
    id: string;
    name: string;
    avatar: string | null;
  } | null;
}

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

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAppStore();
  const [task, setTask] = useState<Task | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  const taskId = params.id as string;

  useEffect(() => {
    if (taskId) {
      fetchTask();
      fetchApplications();
    }
  }, [taskId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTask = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select(
          `
          *,
          client:client_id(id, name, avatar, role),
          freelancer:freelancer_id(id, name, avatar)
        `
        )
        .eq("id", taskId)
        .single();

      if (error) {
        console.error("Error fetching task:", error);
        return;
      }

      setTask(data);
    } catch (error) {
      console.error("Error fetching task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select(
          `
          *,
          freelancer:freelancer_id(id, name, avatar, bio, skills, hourly_rate)
        `
        )
        .eq("task_id", taskId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching applications:", error);
        return;
      }

      setApplications(data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const handleApplicationUpdate = () => {
    fetchApplications();
    fetchTask(); // Refresh task to get updated status
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!task || !user) return;

    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", task.id);

      if (error) {
        console.error("Error updating task:", error);
        alert("Помилка при оновленні статусу завдання");
        return;
      }

      setTask({ ...task, status: newStatus });
      alert("Статус завдання оновлено!");
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Помилка при оновленні статусу завдання");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!task || !user) return;

    if (
      !confirm(
        "Ви впевнені, що хочете видалити це завдання? Цю дію неможливо скасувати."
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase.from("tasks").delete().eq("id", task.id);

      if (error) {
        console.error("Error deleting task:", error);
        alert("Помилка при видаленні завдання");
        return;
      }

      alert("Завдання успішно видалено!");
      router.push("/catalog/tasks");
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Помилка при видаленні завдання");
    }
  };

  if (isLoading) {
    return <TaskDetailSkeleton />;
  }

  if (!task) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <CardTitle>Завдання не знайдено</CardTitle>
            <CardDescription>
              Завдання з таким ID не існує або було видалено
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/catalog/tasks">Повернутися до каталогу</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (task.is_blocked && task.block_reason && task.blocked_at) {
    return (
      <BlockedError
        type="task"
        reason={task.block_reason}
        blockedAt={task.blocked_at}
        backHref="/catalog/tasks"
        backLabel="Back to Tasks"
      />
    );
  }

  // Define tabs based on task status and user role
  const getTabs = () => {
    const baseTabs = [{ id: "description", label: "Опис завдання" }];

    if (applications.length > 0 || task.status !== "open") {
      baseTabs.push({
        id: "applications",
        label: "Заявки",
      });
    }

    if (task.freelancer) {
      baseTabs.push({ id: "chat", label: "Чат" });
    }

    return baseTabs;
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "description":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Опис завдання</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{task.description}</p>
              </div>
            </CardContent>
          </Card>
        );
      case "applications":
        return (
          <ApplicationActions
            task={task}
            applications={applications}
            onApplicationUpdate={handleApplicationUpdate}
          />
        );
      case "chat":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Чат з фрілансером</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/chat">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Перейти до чату
                </Link>
              </Button>
            </CardContent>
          </Card>
        );
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Опис завдання</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{task.description}</p>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <ProfileLayout
      sidebar={
        <TaskSidebar
          title={task.title}
          budget={task.budget}
          status={task.status}
          createdAt={task.created_at}
          updatedAt={task.updated_at}
          client={task.client}
          freelancer={task.freelancer}
          currentUser={
            user ? { id: user.id, role: user.role || "client" } : null
          }
          onStatusUpdate={handleStatusUpdate}
          onDeleteTask={handleDeleteTask}
          isUpdating={isUpdating}
        />
      }
      tabs={getTabs()}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderTabContent()}
    </ProfileLayout>
  );
}
