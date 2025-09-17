"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
import {
  hasContactDetails,
  getContactWarningMessage,
  detectContactDetails,
} from "@/lib/contact-detection";
import { MessageContent } from "@/components/ui/message-content";
import { useToast } from "@/hooks/use-toast";
import {
  Send,
  MessageCircle,
  Eye,
  XCircle,
  Paperclip,
  FileText,
  Smile,
  MoreVertical,
  Search,
  Check,
  CheckCheck,
  ChevronLeft,
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
  is_read?: boolean;
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
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = useCallback(async () => {
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
  }, [user]);

  const fetchMessages = useCallback(async () => {
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
  }, [selectedConversation]);

  const subscribeToMessages = useCallback(() => {
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
  }, [selectedConversation]);

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

    // Check for contact details in the message
    const messageContent =
      newMessage.trim() || (selectedFile ? `Файл: ${selectedFile.name}` : "");
    if (hasContactDetails(messageContent)) {
      const contactMatches = detectContactDetails(messageContent);
      const contactTypes = contactMatches.map((match) => match.type);
      const warningMessage = getContactWarningMessage(contactTypes);

      toast({
        title: "⚠️ Попередження про контактні дані",
        description: warningMessage,
        duration: 8000,
      });
    }

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
        content: messageContent,
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

  const getOtherParticipant = (conversation: Conversation) => {
    if (profile?.role === "client") {
      return conversation.freelancer;
    } else {
      return conversation.client;
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("uk-UA", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString("uk-UA", { weekday: "short" });
    } else {
      return date.toLocaleDateString("uk-UA", {
        day: "2-digit",
        month: "2-digit",
      });
    }
  };

  const formatConversationTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "щойно";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} год. тому`;
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString("uk-UA", { weekday: "short" });
    } else {
      return date.toLocaleDateString("uk-UA", {
        day: "2-digit",
        month: "2-digit",
      });
    }
  };

  const filteredConversations = conversations.filter((conversation) => {
    if (!searchQuery) return true;
    const otherParticipant = getOtherParticipant(conversation);
    return (
      conversation.task.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      otherParticipant.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
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
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Завантаження...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Conversations Sidebar */}
      <div
        className={`${
          showMobileChat ? "hidden" : "flex"
        } lg:flex flex-col w-full lg:w-80 border-r bg-white`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">Чат</h1>
            <Button variant="ghost" size="sm" className="lg:hidden">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Пошук розмов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? "Нічого не знайдено" : "Немає активних розмов"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? "Спробуйте інші ключові слова"
                  : profile?.role === "client"
                  ? "Ви ще не маєте активних розмов з фрілансерами."
                  : "Ви ще не маєте активних розмов з клієнтами."}
              </p>
              {!searchQuery && (
                <Button asChild>
                  <Link href="/catalog/tasks">Переглянути завдання</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="p-2">
              {filteredConversations.map((conversation) => {
                const otherParticipant = getOtherParticipant(conversation);
                const isSelected = selectedConversation?.id === conversation.id;

                return (
                  <div
                    key={conversation.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                      isSelected
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => {
                      setSelectedConversation(conversation);
                      setShowMobileChat(true);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={otherParticipant.avatar || ""} />
                        <AvatarFallback>
                          {otherParticipant.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm truncate">
                            {otherParticipant.name}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {formatConversationTime(conversation.updated_at)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate mb-1">
                          {conversation.task.title}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {conversation.task.budget.toLocaleString()} ₴
                          </Badge>
                          {getStatusBadge(conversation.task.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div
        className={`${
          showMobileChat ? "flex" : "hidden"
        } lg:flex flex-1 flex-col bg-white`}
      >
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden"
                    onClick={() => setShowMobileChat(false)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={
                        profile?.role === "client"
                          ? selectedConversation.freelancer.avatar || ""
                          : selectedConversation.client.avatar || ""
                      }
                    />
                    <AvatarFallback>
                      {(profile?.role === "client"
                        ? selectedConversation.freelancer.name
                        : selectedConversation.client.name
                      ).charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold">
                      {profile?.role === "client"
                        ? selectedConversation.freelancer.name
                        : selectedConversation.client.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedConversation.task.title}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/tasks/${selectedConversation.task.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Поки що немає повідомлень</p>
                    <p className="text-sm mt-2">Почніть обговорення</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => {
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

                    const isOwnMessage = message.sender_id === user.id;
                    const prevMessage = messages[index - 1];
                    const showAvatar =
                      !prevMessage ||
                      prevMessage.sender_id !== message.sender_id;

                    return (
                      <div
                        key={message.id}
                        className={`flex gap-2 ${
                          isOwnMessage ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        {showAvatar && !isOwnMessage && (
                          <Avatar className="h-8 w-8 mt-1">
                            <AvatarImage src={message.sender.avatar || ""} />
                            <AvatarFallback>
                              {message.sender.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        {showAvatar && isOwnMessage && <div className="w-8" />}
                        {!showAvatar && <div className="w-2" />}

                        <div
                          className={`max-w-[70%] ${
                            isOwnMessage ? "flex flex-col items-end" : ""
                          }`}
                        >
                          <div
                            className={`rounded-2xl px-4 py-2 ${
                              isOwnMessage
                                ? "bg-primary text-primary-foreground rounded-br-md"
                                : "bg-muted rounded-bl-md"
                            }`}
                          >
                            <MessageContent
                              content={message.content}
                              className="text-sm whitespace-pre-wrap"
                            />
                          </div>
                          <div
                            className={`flex items-center gap-1 mt-1 ${
                              isOwnMessage ? "flex-row-reverse" : ""
                            }`}
                          >
                            <span className="text-xs text-muted-foreground">
                              {formatMessageTime(message.created_at)}
                            </span>
                            {isOwnMessage && (
                              <div className="text-xs text-muted-foreground">
                                {message.is_read ? (
                                  <CheckCheck className="h-3 w-3 text-blue-500" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              {selectedFile && (
                <div className="mb-3 p-3 bg-muted rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">{selectedFile.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
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

              <div className="flex items-end gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSendingMessage}
                  className="p-2"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1 relative">
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
                    className="pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={
                    isSendingMessage || (!newMessage.trim() && !selectedFile)
                  }
                  size="sm"
                  className="p-2"
                >
                  {isUploadingFile ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Оберіть розмову</h3>
              <p>Виберіть розмову зі списку, щоб почати обговорення</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
