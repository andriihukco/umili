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
import { PortfolioManager } from "@/components/ui/portfolio-manager";
import { SkillsManager } from "@/components/ui/skills-manager";
import { ExperienceManager } from "@/components/ui/experience-manager";
import { FreelancerReviews } from "@/components/ui/freelancer-reviews";
import { FreelancerProjects } from "@/components/ui/freelancer-projects";
import { FreelancerRatingDisplay } from "@/components/ui/freelancer-rating-display";
import { BlockedError } from "@/components/ui/blocked-error";
import { ProfileSkeleton } from "@/components/ui/profile-skeleton";
import { MessageCircle } from "lucide-react";
import Link from "next/link";

interface Freelancer {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  bio: string | null;
  hourly_rate: number | null;
  created_at: string;
  updated_at: string;
  experience_years: number | null;
  location: string | null;
  is_blocked: boolean;
  block_reason: string | null;
  blocked_at: string | null;
  availability: string | null;
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

export default function FreelancerProfilePage() {
  const params = useParams();
  const { user } = useAppStore();
  const [freelancer, setFreelancer] = useState<Freelancer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("portfolio");

  const freelancerId = params.id as string;

  useEffect(() => {
    if (freelancerId) {
      fetchFreelancer();
    }
  }, [freelancerId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchFreelancer = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", freelancerId)
        .eq("role", "freelancer")
        .single();

      if (error) {
        console.error("Error fetching freelancer:", error);
        return;
      }

      setFreelancer(data);
    } catch (error) {
      console.error("Error fetching freelancer:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!freelancer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <CardTitle>Фрілансер не знайдено</CardTitle>
            <CardDescription>
              Фрілансер з таким ID не існує або був видалений
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/catalog/freelancers">Повернутися до каталогу</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (
    freelancer.is_blocked &&
    freelancer.block_reason &&
    freelancer.blocked_at
  ) {
    return (
      <BlockedError
        type="user"
        reason={freelancer.block_reason}
        blockedAt={freelancer.blocked_at}
        backHref="/catalog/freelancers"
        backLabel="Back to Freelancers"
      />
    );
  }

  // Define tabs
  const tabs = [
    { id: "portfolio", label: "Портфоліо" },
    { id: "experience", label: "Досвід роботи" },
    { id: "skills-projects", label: "Навички + Проєкти" },
    { id: "reviews", label: "Відгуки" },
  ];

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "portfolio":
        return <PortfolioManager userId={freelancer.id} isEditable={false} />;
      case "experience":
        return <ExperienceManager userId={freelancer.id} isEditable={false} />;
      case "skills-projects":
        return (
          <div className="space-y-6">
            <SkillsManager userId={freelancer.id} isEditable={false} />
            <FreelancerProjects freelancerId={freelancer.id} />
          </div>
        );
      case "reviews":
        return <FreelancerReviews freelancerId={freelancer.id} />;
      default:
        return <PortfolioManager userId={freelancer.id} isEditable={false} />;
    }
  };

  return (
    <ProfileLayout
      sidebar={
        <ProfileSidebar
          name={freelancer.name}
          role={freelancer.role}
          avatar={freelancer.avatar}
          bio={freelancer.bio}
          location={freelancer.location}
          createdAt={freelancer.created_at}
          stats={{
            hourlyRate: freelancer.hourly_rate || undefined,
          }}
          portfolioLinks={freelancer.portfolio_links}
          actions={
            user &&
            user.id !== freelancer.id && (
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
            <FreelancerRatingDisplay
              freelancerId={freelancer.id}
              size="sm"
              showCount={true}
            />
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
