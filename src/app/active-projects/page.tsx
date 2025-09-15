"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Clock,
  MessageSquare,
  User,
  Calendar,
  DollarSign,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAppStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { Database } from "@/lib/supabase";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

interface ProjectWithDetails extends Task {
  client_name?: string;
  freelancer_name?: string;
  progress?: number;
}

export default function ActiveProjectsPage() {
  const { user, profile } = useAppStore();
  const [projects, setProjects] = useState<ProjectWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveProjects = useCallback(async () => {
    try {
      if (!user) return;

      let query = supabase
        .from("tasks")
        .select(
          `
          *,
          client:users!tasks_created_by_fkey(name),
          freelancer:users!tasks_assigned_to_fkey(name)
        `
        )
        .in("status", ["in_progress"]);

      if (profile?.role === "freelancer") {
        query = query.eq("assigned_to", user.id);
      } else if (profile?.role === "client") {
        query = query.eq("created_by", user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching active projects:", error);
        return;
      }

      // Transform data to include names
      const projectsWithDetails: ProjectWithDetails[] = (data || []).map(
        (task) => ({
          ...task,
          client_name: (task as Task & { client?: { name: string } }).client
            ?.name,
          freelancer_name: (task as Task & { freelancer?: { name: string } })
            .freelancer?.name,
          progress: Math.floor(Math.random() * 100), // Mock progress
          deadline:
            task.deadline ||
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Mock deadline
        })
      );

      setProjects(projectsWithDetails);
    } catch (error) {
      console.error("Error fetching active projects:", error);
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  useEffect(() => {
    fetchActiveProjects();
  }, [fetchActiveProjects]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_progress":
        return <Badge variant="secondary">В роботі</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (loading) {
    return <LoadingSpinner message="Завантаження активних проєктів..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div>
        <div className="px-6 py-6">
          <PageHeader
            title="Активні проєкти"
            description={
              profile?.role === "freelancer"
                ? "Проєкти, над якими ви працюєте"
                : "Ваші проєкти в роботі"
            }
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        <div className="max-w-6xl mx-auto">
          {projects.length > 0 ? (
            <div className="grid gap-6">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">
                          {project.title}
                        </CardTitle>
                        <CardDescription className="text-sm mb-3">
                          {project.description}
                        </CardDescription>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span className="font-medium">
                              ₴{project.budget}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              До{" "}
                              {new Date(
                                project.deadline || project.created_at
                              ).toLocaleDateString("uk-UA")}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>
                              {profile?.role === "freelancer"
                                ? project.client_name || "Клієнт"
                                : project.freelancer_name || "Фрілансер"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(project.status)}
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {project.progress}% завершено
                          </div>
                          <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className={`h-2 rounded-full ${getProgressColor(
                                project.progress || 0
                              )}`}
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Створено{" "}
                          {new Date(project.created_at).toLocaleDateString(
                            "uk-UA"
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/tasks/${project.id}`}>
                            <FileText className="h-4 w-4 mr-1" />
                            Переглянути
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/chat">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Чат
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Немає активних проєктів
                </h3>
                <p className="text-gray-600 mb-4">
                  {profile?.role === "freelancer"
                    ? "Ви ще не працюєте над жодним проєктом"
                    : "У вас немає проєктів в роботі"}
                </p>
                <div className="flex justify-center gap-2">
                  {profile?.role === "freelancer" ? (
                    <Button asChild>
                      <Link href="/catalog/tasks">Знайти завдання</Link>
                    </Button>
                  ) : (
                    <Button asChild>
                      <Link href="/tasks/create">Створити завдання</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
