"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MapPin,
  Calendar,
  Star,
  Globe,
  Github,
  Linkedin,
  Instagram,
  Twitter,
  Mail,
} from "lucide-react";

interface ProfileSidebarProps {
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
  };

  // Portfolio links
  portfolioLinks?: {
    website?: string;
    github?: string;
    linkedin?: string;
    dribbble?: string;
    behance?: string;
    figma?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
  } | null;

  // Actions
  actions?: React.ReactNode;

  // Rating component (optional)
  ratingComponent?: React.ReactNode;
}

export function ProfileSidebar({
  name,
  role,
  avatar,
  bio,
  location,
  createdAt,
  stats,
  portfolioLinks,
  actions,
  ratingComponent,
}: ProfileSidebarProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "long",
    });
  };

  return (
    <div className="space-y-6">
      {/* Profile Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Avatar className="h-24 w-24 mx-auto mb-4">
              <AvatarImage src={avatar || ""} alt={name} />
              <AvatarFallback className="text-2xl font-semibold">
                {name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <h2 className="text-xl font-bold mb-2">{name}</h2>

            <div className="flex items-center justify-center gap-2 mb-3">
              <Badge variant="secondary">
                {role === "freelancer" ? "Фрілансер" : "Клієнт"}
              </Badge>
              {ratingComponent}
            </div>

            {/* Key Info */}
            <div className="space-y-2 text-sm text-muted-foreground mb-4">
              {location && (
                <div className="flex items-center justify-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{location}</span>
                </div>
              )}
              <div className="flex items-center justify-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>На платформі з {formatDate(createdAt)}</span>
              </div>
              {stats?.hourlyRate && (
                <div className="flex items-center justify-center gap-1 bg-primary/10 px-3 py-1 rounded-full">
                  <span className="text-sm font-semibold text-primary">
                    ₴ {stats.hourlyRate}/год
                  </span>
                </div>
              )}
            </div>

            {/* Bio */}
            {bio && <p className="text-sm text-muted-foreground mb-4">{bio}</p>}

            {/* Actions */}
            {actions && <div className="space-y-2">{actions}</div>}
          </div>
        </CardContent>
      </Card>

      {/* Stats Card */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Статистика</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.totalProjects !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {role === "freelancer" ? "Проєктів" : "Завдань"}
                </span>
                <span className="font-semibold text-blue-600">
                  {stats.totalProjects}
                </span>
              </div>
            )}

            {stats.completedProjects !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Завершено</span>
                <span className="font-semibold text-green-600">
                  {stats.completedProjects}
                </span>
              </div>
            )}

            {stats.activeProjects !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Активних</span>
                <span className="font-semibold text-orange-600">
                  {stats.activeProjects}
                </span>
              </div>
            )}

            {stats.totalSpent !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {role === "freelancer" ? "Зароблено" : "Витрачено"}
                </span>
                <span className="font-semibold text-purple-600">
                  ₴{stats.totalSpent.toLocaleString()}
                </span>
              </div>
            )}

            {stats.averageRating !== undefined &&
              stats.ratingCount !== undefined &&
              stats.ratingCount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Рейтинг</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-semibold">
                      {stats.averageRating.toFixed(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({stats.ratingCount})
                    </span>
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      )}

      {/* Contact & Links Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Контакти та посилання</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <Mail className="h-4 w-4 mr-2" />
            Написати листа
          </Button>

          {portfolioLinks && (
            <div className="space-y-2">
              {portfolioLinks.website && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Веб-сайт
                </Button>
              )}
              {portfolioLinks.github && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </Button>
              )}
              {portfolioLinks.linkedin && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn
                </Button>
              )}
              {portfolioLinks.instagram && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Instagram className="h-4 w-4 mr-2" />
                  Instagram
                </Button>
              )}
              {portfolioLinks.twitter && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Twitter className="h-4 w-4 mr-2" />
                  Twitter
                </Button>
              )}
              {portfolioLinks.youtube && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <div className="h-4 w-4 mr-2 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">
                    Y
                  </div>
                  YouTube
                </Button>
              )}
              {portfolioLinks.tiktok && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <div className="h-4 w-4 mr-2 rounded-full bg-black flex items-center justify-center text-white text-xs font-bold">
                    T
                  </div>
                  TikTok
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
