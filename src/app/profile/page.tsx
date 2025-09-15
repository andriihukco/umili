"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import { PortfolioManager } from "@/components/ui/portfolio-manager";
import { SkillsManager } from "@/components/ui/skills-manager";
import { ExperienceManager } from "@/components/ui/experience-manager";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mail,
  DollarSign,
  Calendar,
  Edit,
  Save,
  X,
  Link as LinkIcon,
  FileText,
  Globe,
  Github,
  Linkedin,
  Instagram,
  Twitter,
} from "lucide-react";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "freelancer" | "client" | "admin";
  avatar: string | null;
  bio: string | null;
  hourly_rate: number | null;
  created_at: string;
  updated_at: string;
  resume_url?: string | null;
  portfolio_links?: {
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
  experience_years?: number | null;
  location?: string | null;
  availability?: string | null;
}

export default function ProfilePage() {
  const { user, profile, setProfile } = useAppStore();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    bio: string;
    hourly_rate: string;
    avatar: string;
    resume_url: string;
    experience_years: string;
    location: string;
    availability: string;
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
    };
  }>({
    name: "",
    bio: "",
    hourly_rate: "",
    avatar: "",
    resume_url: "",
    experience_years: "",
    location: "",
    availability: "",
    portfolio_links: {
      website: "",
      github: "",
      linkedin: "",
      dribbble: "",
      behance: "",
      figma: "",
      instagram: "",
      twitter: "",
      youtube: "",
      tiktok: "",
    },
  });

  const fetchUserProfile = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return;
      }

      setUserProfile(data);
      setFormData({
        name: data.name || "",
        bio: data.bio || "",
        hourly_rate: data.hourly_rate?.toString() || "",
        avatar: data.avatar || "",
        resume_url: data.resume_url || "",
        experience_years: data.experience_years?.toString() || "",
        location: data.location || "",
        availability: data.availability || "",
        portfolio_links: data.portfolio_links || {
          website: "",
          github: "",
          linkedin: "",
          dribbble: "",
          behance: "",
          figma: "",
          instagram: "",
          twitter: "",
        },
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user, fetchUserProfile]);

  const handleSaveProfile = async () => {
    if (!formData.name.trim()) {
      toast.error("Ім'я є обов'язковим полем");
      return;
    }

    setIsSaving(true);

    try {
      const updateData = {
        name: formData.name.trim(),
        bio: formData.bio.trim() || null,
        hourly_rate: formData.hourly_rate
          ? parseFloat(formData.hourly_rate)
          : null,
        avatar: formData.avatar.trim() || null,
        resume_url: formData.resume_url.trim() || null,
        experience_years: formData.experience_years
          ? parseInt(formData.experience_years)
          : null,
        location: formData.location.trim() || null,
        availability: formData.availability.trim() || null,
        portfolio_links: formData.portfolio_links,
      };

      const { error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", user?.id);

      if (error) {
        console.error("Error updating profile:", error);
        toast.error("Помилка при оновленні профілю");
        return;
      }

      // Update the profile in the store
      if (profile) {
        setProfile({ ...profile, ...updateData });
      }

      toast.success("Профіль оновлено успішно");
      setIsEditing(false);
      fetchUserProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Помилка при оновленні профілю");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || "",
        bio: userProfile.bio || "",
        hourly_rate: userProfile.hourly_rate?.toString() || "",
        avatar: userProfile.avatar || "",
        resume_url: userProfile.resume_url || "",
        experience_years: userProfile.experience_years?.toString() || "",
        location: userProfile.location || "",
        availability: userProfile.availability || "",
        portfolio_links: userProfile.portfolio_links || {
          website: "",
          github: "",
          linkedin: "",
          dribbble: "",
          behance: "",
          figma: "",
          instagram: "",
          twitter: "",
          youtube: "",
          tiktok: "",
        },
      });
    }
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "freelancer":
        return "Фрілансер";
      case "client":
        return "Клієнт";
      case "admin":
        return "Адміністратор";
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "freelancer":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "client":
        return "bg-green-100 text-green-800 border-green-200";
      case "admin":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light text-gray-600">
            Будь ласка, увійдіть в систему
          </h1>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground">Завантаження профілю...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div>
        <div className="px-6 py-6">
          <PageHeader
            title="Мій профіль"
            description="Керуйте своїм профілем та налаштуваннями"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={userProfile?.avatar || ""} />
                      <AvatarFallback className="text-2xl">
                        {userProfile?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-xl">
                    {userProfile?.name || "Користувач"}
                  </CardTitle>
                  <CardDescription>
                    <Badge className={getRoleColor(userProfile?.role || "")}>
                      {getRoleLabel(userProfile?.role || "")}
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{userProfile?.email}</span>
                  </div>

                  {userProfile?.hourly_rate && (
                    <div className="flex items-center gap-3 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>{userProfile.hourly_rate} ₴/год</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      На платформі з {formatDate(userProfile?.created_at || "")}
                    </span>
                  </div>

                  {userProfile?.bio && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        {userProfile.bio}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Статистика</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Профіль
                    </span>
                    <span className="text-sm font-medium">
                      {userProfile?.bio ? "Заповнений" : "Неповний"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Роль</span>
                    <span className="text-sm font-medium">
                      {getRoleLabel(userProfile?.role || "")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="profile">Профіль</TabsTrigger>
                  {profile?.role === "freelancer" && (
                    <>
                      <TabsTrigger value="experience">Досвід</TabsTrigger>
                      <TabsTrigger value="skills">Навички</TabsTrigger>
                      <TabsTrigger value="portfolio">Портфоліо</TabsTrigger>
                      <TabsTrigger value="links">Посилання</TabsTrigger>
                    </>
                  )}
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Особиста інформація</CardTitle>
                          <CardDescription>
                            Редагуйте свою особисту інформацію та досягнення
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          {isEditing ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancelEdit}
                                disabled={isSaving}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Скасувати
                              </Button>
                              <Button
                                size="sm"
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                              >
                                <Save className="h-4 w-4 mr-2" />
                                {isSaving ? "Збереження..." : "Зберегти"}
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIsEditing(true)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Редагувати
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Ім&apos;я *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Біографія</Label>
                        <Textarea
                          id="bio"
                          value={formData.bio}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              bio: e.target.value,
                            }))
                          }
                          disabled={!isEditing}
                          placeholder="Розкажіть про себе, свої таланти та досягнення..."
                          rows={4}
                        />
                      </div>

                      {profile?.role === "freelancer" && (
                        <div className="space-y-2">
                          <Label htmlFor="hourly_rate">
                            Погодинна ставка (₴)
                          </Label>
                          <Input
                            id="hourly_rate"
                            type="number"
                            value={formData.hourly_rate}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                hourly_rate: e.target.value,
                              }))
                            }
                            disabled={!isEditing}
                            placeholder="500"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="avatar">URL аватара</Label>
                        <Input
                          id="avatar"
                          value={formData.avatar}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              avatar: e.target.value,
                            }))
                          }
                          disabled={!isEditing}
                          placeholder="https://example.com/avatar.jpg"
                        />
                      </div>

                      {profile?.role === "freelancer" && (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="experience_years">
                                Років досвіду
                              </Label>
                              <Input
                                id="experience_years"
                                type="number"
                                value={formData.experience_years}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    experience_years: e.target.value,
                                  }))
                                }
                                disabled={!isEditing}
                                placeholder="3"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="location">Місцезнаходження</Label>
                              <Input
                                id="location"
                                value={formData.location}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    location: e.target.value,
                                  }))
                                }
                                disabled={!isEditing}
                                placeholder="Київ, Україна"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="availability">Доступність</Label>
                            <Select
                              value={formData.availability}
                              onValueChange={(value) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  availability: value,
                                }))
                              }
                              disabled={!isEditing}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Оберіть доступність" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="available">
                                  Доступний для нових проєктів
                                </SelectItem>
                                <SelectItem value="busy">
                                  Зайнятий проєктами
                                </SelectItem>
                                <SelectItem value="part-time">
                                  Частково доступний
                                </SelectItem>
                                <SelectItem value="unavailable">
                                  Тимчасово недоступний
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="resume_url">
                              <FileText className="h-4 w-4 inline mr-2" />
                              Посилання на резюме
                            </Label>
                            <Input
                              id="resume_url"
                              value={formData.resume_url}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  resume_url: e.target.value,
                                }))
                              }
                              disabled={!isEditing}
                              placeholder="https://drive.google.com/file/..."
                            />
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Experience Tab - Only for freelancers */}
                {profile?.role === "freelancer" && (
                  <TabsContent value="experience">
                    <ExperienceManager isEditable={true} />
                  </TabsContent>
                )}

                {/* Skills Tab - Only for freelancers */}
                {profile?.role === "freelancer" && (
                  <TabsContent value="skills">
                    <SkillsManager isEditable={true} />
                  </TabsContent>
                )}

                {/* Portfolio Tab - Only for freelancers */}
                {profile?.role === "freelancer" && (
                  <TabsContent value="portfolio">
                    <PortfolioManager isEditable={true} />
                  </TabsContent>
                )}

                {/* Portfolio Links Tab - Only for freelancers */}
                {profile?.role === "freelancer" && (
                  <TabsContent value="links" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <LinkIcon className="h-5 w-5" />
                              Портфоліо та соціальні мережі
                            </CardTitle>
                            <CardDescription>
                              Додайте посилання на ваші роботи та профілі
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            {isEditing ? (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleCancelEdit}
                                  disabled={isSaving}
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Скасувати
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={handleSaveProfile}
                                  disabled={isSaving}
                                >
                                  <Save className="h-4 w-4 mr-2" />
                                  {isSaving ? "Збереження..." : "Зберегти"}
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsEditing(true)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Редагувати
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Website */}
                          <div className="space-y-2">
                            <Label
                              htmlFor="website"
                              className="flex items-center gap-2"
                            >
                              <Globe className="h-4 w-4" />
                              Веб-сайт
                            </Label>
                            <Input
                              id="website"
                              value={formData.portfolio_links.website}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  portfolio_links: {
                                    ...prev.portfolio_links,
                                    website: e.target.value,
                                  },
                                }))
                              }
                              disabled={!isEditing}
                              placeholder="https://yourwebsite.com"
                            />
                          </div>

                          {/* GitHub */}
                          <div className="space-y-2">
                            <Label
                              htmlFor="github"
                              className="flex items-center gap-2"
                            >
                              <Github className="h-4 w-4" />
                              GitHub
                            </Label>
                            <Input
                              id="github"
                              value={formData.portfolio_links.github}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  portfolio_links: {
                                    ...prev.portfolio_links,
                                    github: e.target.value,
                                  },
                                }))
                              }
                              disabled={!isEditing}
                              placeholder="https://github.com/username"
                            />
                          </div>

                          {/* LinkedIn */}
                          <div className="space-y-2">
                            <Label
                              htmlFor="linkedin"
                              className="flex items-center gap-2"
                            >
                              <Linkedin className="h-4 w-4" />
                              LinkedIn
                            </Label>
                            <Input
                              id="linkedin"
                              value={formData.portfolio_links.linkedin}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  portfolio_links: {
                                    ...prev.portfolio_links,
                                    linkedin: e.target.value,
                                  },
                                }))
                              }
                              disabled={!isEditing}
                              placeholder="https://linkedin.com/in/username"
                            />
                          </div>

                          {/* Dribbble */}
                          <div className="space-y-2">
                            <Label
                              htmlFor="dribbble"
                              className="flex items-center gap-2"
                            >
                              <div className="h-4 w-4 rounded-full bg-pink-500 flex items-center justify-center text-white text-xs font-bold">
                                D
                              </div>
                              Dribbble
                            </Label>
                            <Input
                              id="dribbble"
                              value={formData.portfolio_links.dribbble}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  portfolio_links: {
                                    ...prev.portfolio_links,
                                    dribbble: e.target.value,
                                  },
                                }))
                              }
                              disabled={!isEditing}
                              placeholder="https://dribbble.com/username"
                            />
                          </div>

                          {/* Behance */}
                          <div className="space-y-2">
                            <Label
                              htmlFor="behance"
                              className="flex items-center gap-2"
                            >
                              <div className="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                                B
                              </div>
                              Behance
                            </Label>
                            <Input
                              id="behance"
                              value={formData.portfolio_links.behance}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  portfolio_links: {
                                    ...prev.portfolio_links,
                                    behance: e.target.value,
                                  },
                                }))
                              }
                              disabled={!isEditing}
                              placeholder="https://behance.net/username"
                            />
                          </div>

                          {/* Figma */}
                          <div className="space-y-2">
                            <Label
                              htmlFor="figma"
                              className="flex items-center gap-2"
                            >
                              <div className="h-4 w-4 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                F
                              </div>
                              Figma
                            </Label>
                            <Input
                              id="figma"
                              value={formData.portfolio_links.figma}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  portfolio_links: {
                                    ...prev.portfolio_links,
                                    figma: e.target.value,
                                  },
                                }))
                              }
                              disabled={!isEditing}
                              placeholder="https://figma.com/@username"
                            />
                          </div>

                          {/* Instagram */}
                          <div className="space-y-2">
                            <Label
                              htmlFor="instagram"
                              className="flex items-center gap-2"
                            >
                              <Instagram className="h-4 w-4" />
                              Instagram
                            </Label>
                            <Input
                              id="instagram"
                              value={formData.portfolio_links.instagram}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  portfolio_links: {
                                    ...prev.portfolio_links,
                                    instagram: e.target.value,
                                  },
                                }))
                              }
                              disabled={!isEditing}
                              placeholder="https://instagram.com/username"
                            />
                          </div>

                          {/* Twitter */}
                          <div className="space-y-2">
                            <Label
                              htmlFor="twitter"
                              className="flex items-center gap-2"
                            >
                              <Twitter className="h-4 w-4" />
                              Twitter
                            </Label>
                            <Input
                              id="twitter"
                              value={formData.portfolio_links.twitter}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  portfolio_links: {
                                    ...prev.portfolio_links,
                                    twitter: e.target.value,
                                  },
                                }))
                              }
                              disabled={!isEditing}
                              placeholder="https://twitter.com/username"
                            />
                          </div>

                          {/* YouTube */}
                          <div className="space-y-2">
                            <Label
                              htmlFor="youtube"
                              className="flex items-center gap-2"
                            >
                              <div className="h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">
                                Y
                              </div>
                              YouTube
                            </Label>
                            <Input
                              id="youtube"
                              value={formData.portfolio_links.youtube}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  portfolio_links: {
                                    ...prev.portfolio_links,
                                    youtube: e.target.value,
                                  },
                                }))
                              }
                              disabled={!isEditing}
                              placeholder="https://youtube.com/@username"
                            />
                          </div>

                          {/* TikTok */}
                          <div className="space-y-2">
                            <Label
                              htmlFor="tiktok"
                              className="flex items-center gap-2"
                            >
                              <div className="h-4 w-4 rounded-full bg-black flex items-center justify-center text-white text-xs font-bold">
                                T
                              </div>
                              TikTok
                            </Label>
                            <Input
                              id="tiktok"
                              value={formData.portfolio_links.tiktok}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  portfolio_links: {
                                    ...prev.portfolio_links,
                                    tiktok: e.target.value,
                                  },
                                }))
                              }
                              disabled={!isEditing}
                              placeholder="https://tiktok.com/@username"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
