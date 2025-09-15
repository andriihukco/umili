"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { ClientCTACard } from "@/components/ui/client-cta-card";
import {
  Briefcase,
  Calendar,
  DollarSign,
  MapPin,
  CheckCircle,
  Clock,
  Building2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: string;
  created_at: string;
  deadline: string | null;
  client: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

interface Company {
  id: string;
  name: string;
  avatar: string | null;
  location: string | null;
  website: string | null;
  projects_count: number;
}

interface CompanyData {
  client: {
    id: string;
    name: string;
    avatar: string | null;
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
  }[];
}

interface ProjectData {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: string;
  created_at: string;
  deadline: string | null;
  client: {
    id: string;
    name: string;
    avatar: string | null;
  }[];
}

interface FreelancerProjectsProps {
  freelancerId: string;
}

export function FreelancerProjects({ freelancerId }: FreelancerProjectsProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjectsAndCompanies = useCallback(async () => {
    try {
      // Fetch completed projects
      const { data: projectsData, error: projectsError } = await supabase
        .from("tasks")
        .select(
          `
          id,
          title,
          description,
          budget,
          status,
          created_at,
          deadline,
          client:users!tasks_created_by_fkey(id, name, avatar)
        `
        )
        .eq("assigned_to", freelancerId)
        .in("status", ["completed", "in_progress"])
        .order("created_at", { ascending: false })
        .limit(10);

      if (projectsError) {
        console.error("Error fetching projects:", projectsError);
        setProjects([]);
      } else {
        // Transform the data to match our interface
        const transformedProjects: Project[] = (projectsData || []).map(
          (item: ProjectData) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            budget: item.budget,
            status: item.status,
            created_at: item.created_at,
            deadline: item.deadline,
            client: item.client[0] || {
              id: "unknown",
              name: "Unknown Client",
              avatar: null,
            },
          })
        );

        setProjects(transformedProjects);
      }

      // Fetch companies (clients) the freelancer has worked with
      const { data: companiesData, error: companiesError } = await supabase
        .from("tasks")
        .select(
          `
          client:users!tasks_created_by_fkey(id, name, avatar, location, portfolio_links)
        `
        )
        .eq("assigned_to", freelancerId)
        .in("status", ["completed", "in_progress"]);

      if (companiesError) {
        console.error("Error fetching companies:", companiesError);
        setCompanies([]);
      } else {
        // Group by client and count projects
        const companyMap = new Map();
        (companiesData || []).forEach((item: CompanyData) => {
          const client = item.client[0];
          if (client) {
            if (companyMap.has(client.id)) {
              companyMap.get(client.id).projects_count += 1;
            } else {
              companyMap.set(client.id, {
                id: client.id,
                name: client.name,
                avatar: client.avatar,
                location: client.location,
                website: client.portfolio_links?.website || null,
                projects_count: 1,
              });
            }
          }
        });

        setCompanies(Array.from(companyMap.values()).slice(0, 6));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [freelancerId]);

  useEffect(() => {
    if (freelancerId) {
      fetchProjectsAndCompanies();
    }
  }, [freelancerId, fetchProjectsAndCompanies]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "short",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Завершено
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3 mr-1" />В роботі
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Проєкти та Компанії
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-muted-foreground">Завантаження...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Останні проєкти ({projects.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Поки що немає завершених проєктів
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{project.title}</h4>
                        {getStatusBadge(project.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {project.description.length > 150
                          ? `${project.description.substring(0, 150)}...`
                          : project.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span>{project.budget} ₴</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(project.created_at)}</span>
                        </div>
                        {project.deadline && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>До {formatDate(project.deadline)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/tasks/${project.id}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>

                  {/* Client Info */}
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={project.client.avatar || ""} />
                      <AvatarFallback className="text-xs">
                        {project.client.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {project.client.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Companies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Компанії ({companies.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {companies.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Поки що немає компаній</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {companies.slice(0, 10).map((company) => (
                <div
                  key={company.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={company.avatar || ""} />
                      <AvatarFallback>{company.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-medium">{company.name}</h4>
                      {company.location && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{company.location}</span>
                        </div>
                      )}
                    </div>
                    <Badge variant="outline">
                      {company.projects_count} проєкт
                      {company.projects_count > 1
                        ? "ів"
                        : company.projects_count === 1
                        ? ""
                        : "ів"}
                    </Badge>
                  </div>

                  {company.website && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      asChild
                    >
                      <Link
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Відвідати сайт
                      </Link>
                    </Button>
                  )}
                </div>
              ))}
              {/* Client CTA Card - Show as 11th item */}
              {companies.length >= 10 && (
                <ClientCTACard
                  onCardClick={() => (window.location.href = "/auth/register")}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
