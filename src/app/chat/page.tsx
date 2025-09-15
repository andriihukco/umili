"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import { PageHeader } from "@/components/ui/page-header";
import {
  Send,
  MessageCircle,
  User,
  Calendar,
  DollarSign,
  Eye,
  XCircle,
  Paperclip,
  FileText,
} from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  message_type: "text" | "application" | "system" | "file";
  created_at: string;
  sender: {
    id: string;
    name: string;
    avatar: string | null;
  };
  attachments?: {
    id: string;
    file_name: string;
    file_url: string;
    file_type: string;
    file_size: number;
  }[];
}

interface Conversation {
  id: string;
  task_id: string;
  client_id: string;
  freelancer_id: string;
  created_at: string;
  updated_at: string;
  task: {
    id: string;
    title: string;
    budget: number;
    status: string;
    created_at: string;
  };
  client: {
    id: string;
    name: string;
    avatar: string | null;
  };
  freelancer: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

export default function ChatPage() {
  const { user, profile } = useAppStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("conversations")
        .select(
          `
          *,
          task:task_id(id, title, budget, status, created_at),
          client:client_id(id, name, avatar),
          freelancer:freelancer_id(id, name, avatar)
        `
        )
        .or(`client_id.eq.${user.id},freelancer_id.eq.${user.id}`)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error fetching conversations:", error);
        return;
      }

      setConversations(data || []);
      if (data && data.length > 0) {
        setSelectedConversation(data[0]);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedConversation) return;

    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", selectedConversation.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const subscribeToMessages = () => {
    if (!selectedConversation) return;

    const channel = supabase
      .channel(`messages:${selectedConversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedConversation.id}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages();
      subscribeToMessages();
    }
  }, [selectedConversation, fetchMessages, subscribeToMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("Файл занадто великий. Максимальний розмір: 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      const filePath = `chat-files/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("chat-files")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Error uploading file:", uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from("chat-files")
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading file:", error);
      return null;
    }
  };

  const handleSendMessage = async () => {
    if (!user || !selectedConversation || (!newMessage.trim() && !selectedFile))
      return;

    setIsSendingMessage(true);

    try {
      let fileUrl: string | null = null;
      let messageType: "text" | "file" = "text";

      // Upload file if selected
      if (selectedFile) {
        setIsUploadingFile(true);
        fileUrl = await uploadFile(selectedFile);
        setIsUploadingFile(false);

        if (!fileUrl) {
          alert("Помилка при завантаженні файлу");
          setIsSendingMessage(false);
          return;
        }

        messageType = "file";
      }

      const { error } = await supabase.from("messages").insert({
        conversation_id: selectedConversation.id,
        sender_id: user.id,
        content:
          newMessage.trim() ||
          (selectedFile ? `Файл: ${selectedFile.name}` : ""),
        message_type: messageType,
      });

      if (error) {
        console.error("Error sending message:", error);
        alert("Помилка при відправці повідомлення");
        return;
      }

      setNewMessage("");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Помилка при відправці повідомлення");
    } finally {
      setIsSendingMessage(false);
      setIsUploadingFile(false);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("uk-UA", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getOtherParticipant = (conversation: Conversation) => {
    if (profile?.role === "client") {
      return conversation.freelancer;
    } else {
      return conversation.client;
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <CardTitle>Доступ обмежено</CardTitle>
            <CardDescription>
              Для використання чату необхідно увійти в систему
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
            title="Чат"
            description="Обговорення з клієнтами та фрілансерами"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        <div className="max-w-6xl mx-auto">
          {conversations.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    Немає активних розмов
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {profile?.role === "client"
                      ? "Ви ще не маєте активних розмов з фрілансерами."
                      : "Ви ще не маєте активних розмов з клієнтами."}
                  </p>
                  <Button asChild>
                    <Link href="/catalog/tasks">Переглянути завдання</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-200px)] min-h-[600px]">
              {/* Conversations List */}
              <div className="lg:col-span-1 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Розмови
                    </CardTitle>
                    <CardDescription>
                      Оберіть розмову для обговорення
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {conversations.map((conversation) => {
                      const otherParticipant =
                        getOtherParticipant(conversation);
                      return (
                        <div
                          key={conversation.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedConversation?.id === conversation.id
                              ? "bg-primary/10 border-primary"
                              : "hover:bg-muted"
                          }`}
                          onClick={() => setSelectedConversation(conversation)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-sm line-clamp-2">
                              {conversation.task.title}
                            </h4>
                            {getStatusBadge(conversation.task.status)}
                          </div>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{otherParticipant.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              <span>
                                {conversation.task.budget.toLocaleString()} ₴
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(conversation.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>

              {/* Chat Area */}
              <div className="lg:col-span-2">
                {selectedConversation ? (
                  <Card className="h-full flex flex-col">
                    <CardHeader className="border-b">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {selectedConversation.task.title}
                          </CardTitle>
                          <CardDescription>
                            {profile?.role === "client" ? (
                              <>
                                З фрілансером:{" "}
                                {selectedConversation.freelancer.name}
                              </>
                            ) : (
                              <>
                                З клієнтом: {selectedConversation.client.name}
                              </>
                            )}
                          </CardDescription>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/tasks/${selectedConversation.task.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            Переглянути
                          </Link>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col p-0">
                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Поки що немає повідомлень</p>
                            <p className="text-sm mt-2">Почніть обговорення</p>
                          </div>
                        ) : (
                          messages.map((message) => {
                            if (message.message_type === "system") {
                              return (
                                <div key={message.id} className="text-center">
                                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-sm text-muted-foreground">
                                    <MessageCircle className="h-4 w-4" />
                                    {message.content}
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div
                                key={message.id}
                                className={`flex gap-3 ${
                                  message.sender_id === user.id
                                    ? "flex-row-reverse"
                                    : "flex-row"
                                }`}
                              >
                                <Avatar className="h-8 w-8">
                                  <AvatarImage
                                    src={message.sender.avatar || ""}
                                  />
                                  <AvatarFallback>
                                    {message.sender.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div
                                  className={`max-w-[70%] rounded-lg px-3 py-2 ${
                                    message.sender_id === user.id
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted"
                                  }`}
                                >
                                  <p className="text-sm">{message.content}</p>
                                  <p
                                    className={`text-xs mt-1 ${
                                      message.sender_id === user.id
                                        ? "text-primary-foreground/70"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    {formatTime(message.created_at)}
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Message Input */}
                      <div className="border-t p-4">
                        {/* File Selection Display */}
                        {selectedFile && (
                          <div className="mb-3 p-3 bg-muted rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span className="text-sm">
                                {selectedFile.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                ({(selectedFile.size / 1024 / 1024).toFixed(2)}{" "}
                                MB)
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedFile(null);
                                if (fileInputRef.current) {
                                  fileInputRef.current.value = "";
                                }
                              }}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileSelect}
                            className="hidden"
                            accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isSendingMessage}
                          >
                            <Paperclip className="h-4 w-4" />
                          </Button>
                          <Input
                            placeholder="Напишіть повідомлення..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                            disabled={isSendingMessage}
                          />
                          <Button
                            onClick={handleSendMessage}
                            disabled={
                              isSendingMessage ||
                              (!newMessage.trim() && !selectedFile)
                            }
                            size="sm"
                          >
                            {isUploadingFile ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="h-full flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Оберіть розмову для обговорення</p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
