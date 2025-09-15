"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Calendar } from "lucide-react";

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface ProfileHeaderProps {
  // Basic info
  name: string;
  role: string;
  avatar?: string | null;
  bio?: string | null;
  location?: string | null;
  createdAt: string;

  // Stats (optional)
  stats?: {
    totalProjects?: number;
    completedProjects?: number;
    activeProjects?: number;
    totalSpent?: number;
    averageRating?: number;
    ratingCount?: number;
    hourlyRate?: number;
    responseTime?: string;
  };

  // Tabs
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;

  // Actions
  actions?: React.ReactNode;

  // Rating component (optional)
  ratingComponent?: React.ReactNode;
}

export function ProfileHeader({
  name,
  role,
  avatar,
  bio,
  location,
  createdAt,
  stats,
  tabs,
  activeTab,
  onTabChange,
  actions,
  ratingComponent,
}: ProfileHeaderProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "long",
    });
  };

  return (
    <div className="space-y-6">
      {/* Main Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Avatar className="h-20 w-20 flex-shrink-0">
                <AvatarImage src={avatar || ""} alt={name} />
                <AvatarFallback className="text-2xl font-semibold">
                  {name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                  <h1 className="text-2xl font-bold text-foreground">{name}</h1>
                  <Badge variant="secondary" className="w-fit">
                    {role === "freelancer" ? "Фрілансер" : "Клієнт"}
                  </Badge>
                  {ratingComponent}
                </div>

                {/* Key Info Row */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                  {location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>На платформі з {formatDate(createdAt)}</span>
                  </div>
                  {stats?.hourlyRate && (
                    <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full">
                      <span className="text-sm font-semibold text-primary">
                        ₴ {stats.hourlyRate}/год
                      </span>
                    </div>
                  )}
                </div>

                {/* Bio */}
                {bio && (
                  <p className="text-muted-foreground line-clamp-2">{bio}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            {actions && (
              <div className="flex flex-col sm:flex-row gap-2 lg:ml-auto">
                {actions}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.totalProjects !== undefined && (
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {stats.totalProjects}
                </div>
                <div className="text-sm text-blue-600">
                  {role === "freelancer" ? "Проєктів" : "Завдань"}
                </div>
              </CardContent>
            </Card>
          )}

          {stats.completedProjects !== undefined && (
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {stats.completedProjects}
                </div>
                <div className="text-sm text-green-600">Завершено</div>
              </CardContent>
            </Card>
          )}

          {stats.activeProjects !== undefined && (
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {stats.activeProjects}
                </div>
                <div className="text-sm text-orange-600">Активних</div>
              </CardContent>
            </Card>
          )}

          {stats.totalSpent !== undefined && (
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  ₴{stats.totalSpent.toLocaleString()}
                </div>
                <div className="text-sm text-purple-600">
                  {role === "freelancer" ? "Зароблено" : "Витрачено"}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="border-b border-border">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 border-b-2 ${
                activeTab === tab.id
                  ? "text-foreground border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground hover:border-muted-foreground"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
