"use client";

import { useState, useEffect } from "react";
import { AdminOnly } from "@/components/route-guard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import {
  FileText,
  DollarSign,
  User,
  Calendar,
  Search,
  XCircle,
  Eye,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/ui/page-header";
import {
  ContentLayout,
  ContentList,
  FilterSection,
} from "@/components/ui/content-layout";
import Link from "next/link";

interface Task {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: "open" | "in_progress" | "completed" | "cancelled";
  client_id: string;
  freelancer_id: string | null;
  created_at: string;
  updated_at: string;
}

export default function AdminProjectsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select(
          `
          *,
          client_id,
          freelancer_id
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching tasks:", error);
        return;
      }

      setTasks(data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (
    taskId: string,
    newStatus: "open" | "in_progress" | "completed" | "cancelled"
  ) => {
    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", taskId);

      if (error) {
        console.error("Error updating task status:", error);
        alert("Помилка при оновленні статусу завдання");
        return;
      }

      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
      alert("Статус завдання оновлено!");
    } catch (error) {
      console.error("Error updating task status:", error);
      alert("Помилка при оновленні статусу завдання");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (
      !confirm(
        "Ви впевнені, що хочете видалити це завдання? Цю дію неможливо скасувати."
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);

      if (error) {
        console.error("Error deleting task:", error);
        alert("Помилка при видаленні завдання");
        return;
      }

      setTasks(tasks.filter((task) => task.id !== taskId));
      alert("Завдання успішно видалено!");
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Помилка при видаленні завдання");
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="text-center">Завантаження...</div>
      </div>
    );
  }

  return (
    <AdminOnly>
      <div className="min-h-screen bg-background">
        <PageHeader
          title="Projects & Tasks"
          description="Manage and moderate all projects and tasks on the platform"
        />

        <ContentLayout
          filters={
            <>
              <FilterSection title="Statistics">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{tasks.length}</div>
                    <div className="text-sm text-muted-foreground">
                      Total Projects
                    </div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">
                      {tasks.filter((t) => t.status === "open").length}
                    </div>
                    <div className="text-sm text-muted-foreground">Open</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">
                      {tasks.filter((t) => t.status === "in_progress").length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      In Progress
                    </div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">
                      {tasks.filter((t) => t.status === "completed").length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Completed
                    </div>
                  </div>
                </div>
              </FilterSection>

              <FilterSection title="Filters">
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by title, description, or client..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </FilterSection>
            </>
          }
        >
          <ContentList
            emptyState={
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">
                    No projects found
                  </h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search parameters or filters
                  </p>
                </CardContent>
              </Card>
            }
          >
            {filteredTasks.map((task) => (
              <Card key={task.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-lg">{task.title}</h3>
                          {getStatusBadge(task.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {task.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span>{task.budget.toLocaleString()} ₴</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(task.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>Client ID: {task.client_id}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/tasks/${task.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            Admin View
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/tasks/${task.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            Public View
                          </Link>
                        </Button>
                        <Select
                          value={task.status}
                          onValueChange={(
                            value:
                              | "open"
                              | "in_progress"
                              | "completed"
                              | "cancelled"
                          ) => handleStatusChange(task.id, value)}
                          disabled={isUpdating}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">
                              In Progress
                            </SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Client and Freelancer Info */}
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="text-sm font-medium">
                            Client ID: {task.client_id}
                          </p>
                        </div>
                      </div>
                      {task.freelancer_id && (
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="text-sm font-medium">
                              Freelancer ID: {task.freelancer_id}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </ContentList>
        </ContentLayout>
      </div>
    </AdminOnly>
  );
}
