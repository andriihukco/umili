"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Send, User, Calendar, DollarSign } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Database } from "@/lib/supabase";
import Link from "next/link";

type Task = Database["public"]["Tables"]["tasks"]["Row"] & {
  creator: {
    id: string;
    name: string;
    avatar: string | null;
  };
  assignee: {
    id: string;
    name: string;
    avatar: string | null;
  } | null;
};
type Message = Database["public"]["Tables"]["messages"]["Row"] & {
  sender: {
    id: string;
    name: string;
    avatar: string | null;
  };
};

interface ChatIntegrationProps {
  userRole: "client" | "freelancer";
  userId: string;
}

export function ChatIntegration({ userRole, userId }: ChatIntegrationProps) {
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActiveTasks();
  }, [userId]);

  useEffect(() => {
    if (selectedTask) {
      fetchMessages();
      subscribeToMessages();
    }
  }, [selectedTask]);

  const fetchActiveTasks = async () => {
    try {
      // Check if Supabase is properly configured
      if (!isSupabaseConfigured()) {
        console.warn("Supabase environment variables not configured");
        setActiveTasks([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("tasks")
        .select(
          `
          *,
          creator:created_by(id, name, avatar),
          assignee:assigned_to(id, name, avatar)
        `
        )
        .or(`created_by.eq.${userId},assigned_to.eq.${userId}`)
        .in("status", ["in_progress", "completed"])
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) {
        // Only log meaningful errors
        if (error.code || error.message || error.details || error.hint) {
          console.error("Error fetching active tasks:", error);
        } else {
          console.warn("No active tasks found or network issue");
        }
        setActiveTasks([]);
        return;
      }

      setActiveTasks(data || []);
      if (data && data.length > 0) {
        setSelectedTask(data[0]);
      }
    } catch (error) {
      console.error("Unexpected error fetching active tasks:", error);
      setActiveTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedTask) return;

    try {
      // Check if Supabase is properly configured
      if (!isSupabaseConfigured()) {
        console.warn("Supabase environment variables not configured");
        setMessages([]);
        return;
      }

      const { data, error } = await supabase
        .from("messages")
        .select(
          `
          *,
          sender:sender_id(id, name, avatar)
        `
        )
        .eq("task_id", selectedTask.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        // Only log meaningful errors
        if (error.code || error.message || error.details || error.hint) {
          console.error("Error fetching messages:", error);
        } else {
          console.warn("No messages found or network issue");
        }
        setMessages([]);
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error("Unexpected error fetching messages:", error);
      setMessages([]);
    }
  };

  const subscribeToMessages = () => {
    if (!selectedTask) return;

    const channel = supabase
      .channel(`messages:${selectedTask.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `task_id=eq.${selectedTask.id}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => [newMessage, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async () => {
    if (!selectedTask || !newMessage.trim()) return;

    try {
      const { error } = await supabase.from("messages").insert({
        task_id: selectedTask.id,
        sender_id: userId,
        text: newMessage.trim(),
      });

      if (error) {
        console.error("Error sending message:", error);
        return;
      }

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("uk-UA", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Останні повідомлення
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeTasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Останні повідомлення
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">
              Немає активних завдань для обговорення
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/chat">Перейти до чату</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Останні повідомлення
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Task Selection */}
        <div className="space-y-2">
          {activeTasks.map((task) => (
            <div
              key={task.id}
              className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                selectedTask?.id === task.id
                  ? "bg-primary/10 border-primary"
                  : "hover:bg-muted"
              }`}
              onClick={() => setSelectedTask(task)}
            >
              <div className="flex items-start justify-between">
                <h4 className="font-medium text-sm line-clamp-1">
                  {task.title}
                </h4>
                {getStatusBadge(task.status)}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <DollarSign className="h-3 w-3" />
                <span>{task.budget.toLocaleString()} ₴</span>
              </div>
            </div>
          ))}
        </div>

        {/* Messages */}
        {selectedTask && (
          <div className="space-y-3">
            <div className="text-sm font-medium">
              {userRole === "client" ? (
                <>
                  З фрілансером:{" "}
                  {selectedTask.assignee?.name || "Не призначено"}
                </>
              ) : (
                <>З клієнтом: {selectedTask.creator.name}</>
              )}
            </div>

            <div className="max-h-32 overflow-y-auto space-y-2">
              {messages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-2">
                  Поки що немає повідомлень
                </p>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-2 ${
                      message.sender_id === userId
                        ? "flex-row-reverse"
                        : "flex-row"
                    }`}
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={message.sender?.avatar || ""} />
                      <AvatarFallback>
                        {message.sender?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`max-w-[80%] rounded-lg px-2 py-1 text-xs ${
                        message.sender_id === userId
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p>{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender_id === userId
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Quick Message Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Швидке повідомлення..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1 px-2 py-1 text-sm border rounded-md"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                size="sm"
              >
                <Send className="h-3 w-3" />
              </Button>
            </div>

            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/chat">Відкрити повний чат</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
