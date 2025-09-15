"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
import { ProfileSidebar } from "@/components/ui/profile-sidebar";
import { ClientRatingDisplay } from "@/components/ui/client-rating-display";
import { ProfileSkeleton } from "@/components/ui/profile-skeleton";
import { MessageCircle } from "lucide-react";
import Link from "next/link";

interface Client {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
  location: string | null;
  portfolio_links: {
    website: string;
    github: string;
    linkedin: string;
    dribbble: string;
    behance: string;
    figma: string;
    instagram: string;
    twitter: string;
    youtube: string;
    tiktok: string;
  } | null;
}

interface ClientStats {
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  cancelledTasks: number;
  totalSpent: number;
  averageRating: number;
  ratingCount: number;
}

export default function ClientProfilePage() {
  const params = useParams();
  const { user } = useAppStore();
  const [client, setClient] = useState<Client | null>(null);
  const [clientStats, setClientStats] = useState<ClientStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("portfolio");

  const clientId = params.id as string;

  useEffect(() => {
    if (clientId) {
      fetchClient();
      fetchClientStats();
    }
  }, [clientId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchClient = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", clientId)
        .eq("role", "client")
        .single();

      if (error) {
        console.error("Error fetching client:", error);
        return;
      }

      setClient(data);
    } catch (error) {
      console.error("Error fetching client:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClientStats = async () => {
    try {
      // Get client's tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("status, budget")
        .eq("client_id", clientId);

      if (tasksError) {
        console.error("Error fetching client tasks:", tasksError);
        return;
      }

      // Get client's ratings
      const { data: ratingsData, error: ratingsError } = await supabase
        .from("ratings")
        .select("rating")
        .eq("rated_id", clientId);

      if (ratingsError) {
        console.error("Error fetching client ratings:", ratingsError);
        return;
      }

      const tasks = tasksData || [];
      const ratings = ratingsData || [];

      const stats: ClientStats = {
        totalTasks: tasks.length,
        activeTasks: tasks.filter((task) => task.status === "in_progress")
          .length,
        completedTasks: tasks.filter((task) => task.status === "completed")
          .length,
        cancelledTasks: tasks.filter((task) => task.status === "cancelled")
          .length,
        totalSpent: tasks
          .filter((task) => task.status === "completed")
          .reduce((sum, task) => sum + task.budget, 0),
        averageRating:
          ratings.length > 0
            ? ratings.reduce((sum, rating) => sum + rating.rating, 0) /
              ratings.length
            : 0,
        ratingCount: ratings.length,
      };

      setClientStats(stats);
    } catch (error) {
      console.error("Error fetching client stats:", error);
    }
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!client) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <CardTitle>Клієнт не знайдено</CardTitle>
            <CardDescription>
              Клієнт з таким ID не існує або був видалений
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

  // Define tabs
  const tabs = [
    { id: "portfolio", label: "Портфоліо" },
    { id: "experience", label: "Досвід" },
    { id: "education", label: "Освіта" },
    { id: "achievements", label: "Досягнення" },
  ];

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "portfolio":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Портфоліо клієнта</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Клієнт ще не додав портфоліо проєктів
              </p>
            </CardContent>
          </Card>
        );
      case "experience":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Досвід роботи</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Клієнт ще не додав інформацію про досвід роботи
              </p>
            </CardContent>
          </Card>
        );
      case "education":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Освіта</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Клієнт ще не додав інформацію про освіту
              </p>
            </CardContent>
          </Card>
        );
      case "achievements":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Досягнення</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Клієнт ще не додав інформацію про досягнення
              </p>
            </CardContent>
          </Card>
        );
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Портфоліо клієнта</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Клієнт ще не додав портфоліо проєктів
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <ProfileLayout
      sidebar={
        <ProfileSidebar
          name={client.name}
          role={client.role}
          avatar={client.avatar}
          bio={client.bio}
          location={client.location}
          createdAt={client.created_at}
          stats={{
            totalProjects: clientStats?.totalTasks,
            completedProjects: clientStats?.completedTasks,
            activeProjects: clientStats?.activeTasks,
            totalSpent: clientStats?.totalSpent,
            averageRating: clientStats?.averageRating,
            ratingCount: clientStats?.ratingCount,
          }}
          portfolioLinks={client.portfolio_links}
          actions={
            user &&
            user.id !== client.id && (
              <div className="space-y-2">
                <Button className="w-full">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Написати
                </Button>
                <Button variant="outline" className="w-full">
                  Запросити
                </Button>
              </div>
            )
          }
          ratingComponent={
            clientStats && clientStats.ratingCount > 0 ? (
              <ClientRatingDisplay
                clientId={client.id}
                size="sm"
                showCount={true}
              />
            ) : null
          }
        />
      }
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderTabContent()}
    </ProfileLayout>
  );
}
