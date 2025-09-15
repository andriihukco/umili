"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminOnly } from "@/components/route-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/ui/page-header";
import { BlockModal } from "@/components/ui/block-modal";
import {
  FileText,
  DollarSign,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Briefcase,
  Clock,
} from "lucide-react";
import Link from "next/link";

interface TaskProfile {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: "open" | "in_progress" | "completed" | "cancelled";
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
    email: string;
    avatar: string | null;
  } | null;
  freelancer: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  } | null;
}

export default function AdminTaskProfilePage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;

  const [task, setTask] = useState<TaskProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBlocking, setIsBlocking] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);

  useEffect(() => {
    fetchTaskProfile();
  }, [taskId]);

  const fetchTaskProfile = async () => {
    try {
      // Fetch task with client and freelancer info
      const { data: taskData, error: taskError } = await supabase
        .from("tasks")
        .select(
          `
          *,
          client:client_id(id, name, email, avatar),
          freelancer:freelancer_id(id, name, email, avatar)
        `
        )
        .eq("id", taskId)
        .single();

      if (taskError) {
        console.error("Error fetching task:", taskError);
        return;
      }

      setTask(taskData);
    } catch (error) {
      console.error("Error fetching task profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockTask = async (reason: string) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          is_blocked: true,
          block_reason: reason,
          blocked_at: new Date().toISOString(),
        })
        .eq("id", taskId);

      if (error) {
        console.error("Error blocking task:", error);
        return;
      }

      // Update local state
      setTask((prev) =>
        prev
          ? {
              ...prev,
              is_blocked: true,
              block_reason: reason,
              blocked_at: new Date().toISOString(),
            }
          : null
      );

      alert("Task blocked successfully!");
    } catch (error) {
      console.error("Error blocking task:", error);
      alert("Error blocking task. Please try again.");
    }
  };

  const handleUnblockTask = async () => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          is_blocked: false,
          block_reason: null,
          blocked_at: null,
        })
        .eq("id", taskId);

      if (error) {
        console.error("Error unblocking task:", error);
        return;
      }

      // Update local state
      setTask((prev) =>
        prev
          ? {
              ...prev,
              is_blocked: false,
              block_reason: null,
              blocked_at: null,
            }
          : null
      );

      alert("Task unblocked successfully!");
    } catch (error) {
      console.error("Error unblocking task:", error);
      alert("Error unblocking task. Please try again.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      open: { label: "Open", variant: "default" as const },
      in_progress: { label: "In Progress", variant: "secondary" as const },
      completed: { label: "Completed", variant: "outline" as const },
      cancelled: { label: "Cancelled", variant: "destructive" as const },
    };
    const statusInfo =
      statusMap[status as keyof typeof statusMap] || statusMap.open;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  if (isLoading) {
    return (
      <AdminOnly>
        <div className="min-h-screen bg-background">
          <PageHeader title="Loading..." description="Fetching task profile" />
          <div className="px-6 py-6">
            <div className="text-center">Loading task profile...</div>
          </div>
        </div>
      </AdminOnly>
    );
  }

  if (!task) {
    return (
      <AdminOnly>
        <div className="min-h-screen bg-background">
          <PageHeader
            title="Task Not Found"
            description="The requested task could not be found"
          />
          <div className="px-6 py-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Task not found</p>
              <Button asChild>
                <Link href="/admin/projects">Back to Projects</Link>
              </Button>
            </div>
          </div>
        </div>
      </AdminOnly>
    );
  }

  return (
    <AdminOnly>
      <div className="min-h-screen bg-background">
        <PageHeader
          title={task.title}
          description="Task management and moderation"
          actions={
            <Button variant="outline" asChild>
              <Link href="/admin/projects" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Projects
              </Link>
            </Button>
          }
        />

        <div className="px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Task Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-semibold">
                            {task.title}
                          </h2>
                          {getStatusBadge(task.status)}
                          {task.is_blocked && (
                            <Badge variant="destructive">Blocked</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Budget: ${task.budget.toLocaleString()}
                        </p>
                      </div>
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {task.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Created: {formatDate(task.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Updated: {formatDate(task.updated_at)}
                      </span>
                    </div>
                  </div>

                  {task.is_blocked && task.block_reason && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <h4 className="font-medium text-destructive">
                          Task Blocked
                        </h4>
                      </div>
                      <p className="text-sm text-destructive">
                        <strong>Reason:</strong> {task.block_reason}
                      </p>
                      {task.blocked_at && (
                        <p className="text-xs text-destructive mt-1">
                          Blocked on: {formatDate(task.blocked_at)}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Client and Freelancer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Client
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {task.client ? (
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={task.client.avatar || ""} />
                          <AvatarFallback>
                            {task.client.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{task.client.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {task.client.email}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        No client information
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Freelancer */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Freelancer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {task.freelancer ? (
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={task.freelancer.avatar || ""} />
                          <AvatarFallback>
                            {task.freelancer.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{task.freelancer.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {task.freelancer.email}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        No freelancer assigned
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Admin Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Admin Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {task.is_blocked ? (
                    <Button
                      onClick={handleUnblockTask}
                      disabled={isBlocking}
                      className="w-full"
                      variant="outline"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Unblock Task
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setShowBlockModal(true)}
                      disabled={isBlocking}
                      className="w-full"
                      variant="destructive"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Block Task
                    </Button>
                  )}

                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/tasks/${task.id}`}>
                      <FileText className="h-4 w-4 mr-2" />
                      View Public Task
                    </Link>
                  </Button>

                  {task.client && (
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/admin/users/${task.client.id}`}>
                        <User className="h-4 w-4 mr-2" />
                        View Client Profile
                      </Link>
                    </Button>
                  )}

                  {task.freelancer && (
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/admin/users/${task.freelancer.id}`}>
                        <Briefcase className="h-4 w-4 mr-2" />
                        View Freelancer Profile
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <BlockModal
          isOpen={showBlockModal}
          onClose={() => setShowBlockModal(false)}
          onConfirm={handleBlockTask}
          title="Block Task"
          description={`Are you sure you want to block "${task.title}"? This will prevent it from being viewed publicly.`}
          type="task"
        />
      </div>
    </AdminOnly>
  );
}
