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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import {
  Plus,
  Edit,
  Trash2,
  Building2,
  Calendar,
  MapPin,
  ExternalLink,
  Award,
  GraduationCap,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

interface WorkExperience {
  id: string;
  company_name: string;
  position: string;
  location: string | null;
  employment_type: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  achievements: string[] | null;
  skills_used: string[] | null;
  company_website: string | null;
  company_logo: string | null;
  created_at: string;
  updated_at: string;
}

interface Education {
  id: string;
  institution_name: string;
  degree: string;
  field_of_study: string | null;
  location: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  gpa: number | null;
  description: string | null;
  achievements: string[] | null;
  created_at: string;
  updated_at: string;
}

interface Certification {
  id: string;
  name: string;
  issuing_organization: string;
  issue_date: string;
  expiry_date: string | null;
  credential_id: string | null;
  credential_url: string | null;
  skills_verified: string[] | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface ExperienceManagerProps {
  userId?: string;
  isEditable?: boolean;
}

export function ExperienceManager({
  userId,
  isEditable = true,
}: ExperienceManagerProps) {
  const { user } = useAppStore();
  const [activeTab, setActiveTab] = useState<
    "work" | "education" | "certifications"
  >("work");
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkExperience | null>(null);
  const [skills, setSkills] = useState<
    { id: string; name: string; category: string }[]
  >([]);

  const targetUserId = userId || user?.id;

  const [workFormData, setWorkFormData] = useState({
    company_name: "",
    position: "",
    location: "",
    employment_type: "full-time",
    start_date: "",
    end_date: "",
    is_current: false,
    description: "",
    achievements: [] as string[],
    skills_used: [] as string[],
    company_website: "",
    company_logo: "",
  });

  const [educationFormData, setEducationFormData] = useState({
    institution_name: "",
    degree: "",
    field_of_study: "",
    location: "",
    start_date: "",
    end_date: "",
    is_current: false,
    gpa: "",
    description: "",
    achievements: [] as string[],
  });

  const [certificationFormData, setCertificationFormData] = useState({
    name: "",
    issuing_organization: "",
    issue_date: "",
    expiry_date: "",
    credential_id: "",
    credential_url: "",
    skills_verified: [] as string[],
    description: "",
  });

  const fetchWorkExperience = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("work_experience")
        .select("*")
        .eq("user_id", targetUserId)
        .order("start_date", { ascending: false });

      if (error) {
        console.error("Error fetching work experience:", error);
        return;
      }

      setWorkExperience(data || []);
    } catch (error) {
      console.error("Error fetching work experience:", error);
    }
  }, [targetUserId]);

  const fetchEducation = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("education")
        .select("*")
        .eq("user_id", targetUserId)
        .order("start_date", { ascending: false });

      if (error) {
        console.error("Error fetching education:", error);
        return;
      }

      setEducation(data || []);
    } catch (error) {
      console.error("Error fetching education:", error);
    }
  }, [targetUserId]);

  const fetchCertifications = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("certifications")
        .select("*")
        .eq("user_id", targetUserId)
        .order("issue_date", { ascending: false });

      if (error) {
        console.error("Error fetching certifications:", error);
        return;
      }

      setCertifications(data || []);
    } catch (error) {
      console.error("Error fetching certifications:", error);
    }
  }, [targetUserId]);

  const fetchSkills = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("skills")
        .select("id, name, category")
        .eq("is_active", true)
        .order("name");

      if (error) {
        console.error("Error fetching skills:", error);
        return;
      }

      setSkills(data || []);
    } catch (error) {
      console.error("Error fetching skills:", error);
    }
  }, []);

  useEffect(() => {
    if (targetUserId) {
      Promise.all([
        fetchWorkExperience(),
        fetchEducation(),
        fetchCertifications(),
        fetchSkills(),
      ]).finally(() => setIsLoading(false));
    }
  }, [
    targetUserId,
    fetchWorkExperience,
    fetchEducation,
    fetchCertifications,
    fetchSkills,
  ]);

  const handleAddWorkExperience = () => {
    setEditingItem(null);
    setWorkFormData({
      company_name: "",
      position: "",
      location: "",
      employment_type: "full-time",
      start_date: "",
      end_date: "",
      is_current: false,
      description: "",
      achievements: [],
      skills_used: [],
      company_website: "",
      company_logo: "",
    });
    setIsDialogOpen(true);
  };

  const handleEditWorkExperience = (item: WorkExperience) => {
    setEditingItem(item);
    setWorkFormData({
      company_name: item.company_name,
      position: item.position,
      location: item.location || "",
      employment_type: item.employment_type,
      start_date: item.start_date,
      end_date: item.end_date || "",
      is_current: item.is_current,
      description: item.description || "",
      achievements: item.achievements || [],
      skills_used: item.skills_used || [],
      company_website: item.company_website || "",
      company_logo: item.company_logo || "",
    });
    setIsDialogOpen(true);
  };

  const handleDeleteWorkExperience = async (itemId: string) => {
    if (!confirm("Ви впевнені, що хочете видалити цей досвід роботи?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("work_experience")
        .delete()
        .eq("id", itemId);

      if (error) {
        console.error("Error deleting work experience:", error);
        toast.error("Помилка при видаленні досвіду роботи");
        return;
      }

      toast.success("Досвід роботи видалено");
      fetchWorkExperience();
    } catch (error) {
      console.error("Error deleting work experience:", error);
      toast.error("Помилка при видаленні досвіду роботи");
    }
  };

  const handleSubmitWorkExperience = async () => {
    if (
      !workFormData.company_name.trim() ||
      !workFormData.position.trim() ||
      !workFormData.start_date
    ) {
      toast.error("Будь ласка, заповніть обов'язкові поля");
      return;
    }

    try {
      const experienceData = {
        company_name: workFormData.company_name.trim(),
        position: workFormData.position.trim(),
        location: workFormData.location.trim() || null,
        employment_type: workFormData.employment_type,
        start_date: workFormData.start_date,
        end_date: workFormData.is_current
          ? null
          : workFormData.end_date || null,
        is_current: workFormData.is_current,
        description: workFormData.description.trim() || null,
        achievements:
          workFormData.achievements.length > 0
            ? workFormData.achievements
            : null,
        skills_used:
          workFormData.skills_used.length > 0 ? workFormData.skills_used : null,
        company_website: workFormData.company_website.trim() || null,
        company_logo: workFormData.company_logo.trim() || null,
        user_id: targetUserId,
      };

      if (editingItem) {
        const { error } = await supabase
          .from("work_experience")
          .update(experienceData)
          .eq("id", editingItem.id);

        if (error) {
          console.error("Error updating work experience:", error);
          toast.error("Помилка при оновленні досвіду роботи");
          return;
        }

        toast.success("Досвід роботи оновлено");
      } else {
        const { error } = await supabase
          .from("work_experience")
          .insert(experienceData);

        if (error) {
          console.error("Error creating work experience:", error);
          toast.error("Помилка при створенні досвіду роботи");
          return;
        }

        toast.success("Досвід роботи додано");
      }

      setIsDialogOpen(false);
      fetchWorkExperience();
    } catch (error) {
      console.error("Error saving work experience:", error);
      toast.error("Помилка при збереженні досвіду роботи");
    }
  };

  const addAchievement = (achievement: string) => {
    if (
      achievement.trim() &&
      !workFormData.achievements.includes(achievement.trim())
    ) {
      setWorkFormData((prev) => ({
        ...prev,
        achievements: [...prev.achievements, achievement.trim()],
      }));
    }
  };

  const removeAchievement = (achievement: string) => {
    setWorkFormData((prev) => ({
      ...prev,
      achievements: prev.achievements.filter((a) => a !== achievement),
    }));
  };

  const addSkill = (skillName: string) => {
    if (!workFormData.skills_used.includes(skillName)) {
      setWorkFormData((prev) => ({
        ...prev,
        skills_used: [...prev.skills_used, skillName],
      }));
    }
  };

  const removeSkill = (skillName: string) => {
    setWorkFormData((prev) => ({
      ...prev,
      skills_used: prev.skills_used.filter((skill) => skill !== skillName),
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "long",
    });
  };

  const getEmploymentTypeLabel = (type: string) => {
    switch (type) {
      case "full-time":
        return "Повний робочий день";
      case "part-time":
        return "Неповний робочий день";
      case "contract":
        return "Контракт";
      case "freelance":
        return "Фріланс";
      case "internship":
        return "Стажування";
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground">Завантаження досвіду...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Досвід роботи та освіта</h2>
          <p className="text-muted-foreground">
            Покажіть свій професійний досвід та освітні досягнення
          </p>
        </div>
        {isEditable && (
          <div className="flex gap-2">
            <Button
              variant={activeTab === "work" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("work")}
            >
              <Building2 className="h-4 w-4 mr-2" />
              Робота
            </Button>
            <Button
              variant={activeTab === "education" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("education")}
            >
              <GraduationCap className="h-4 w-4 mr-2" />
              Освіта
            </Button>
            <Button
              variant={activeTab === "certifications" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("certifications")}
            >
              <FileText className="h-4 w-4 mr-2" />
              Сертифікати
            </Button>
          </div>
        )}
      </div>

      {/* Work Experience Tab */}
      {activeTab === "work" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Досвід роботи</h3>
            {isEditable && (
              <Button onClick={handleAddWorkExperience}>
                <Plus className="h-4 w-4 mr-2" />
                Додати досвід
              </Button>
            )}
          </div>

          {workExperience.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    Досвід роботи не додано
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Додайте свій професійний досвід, щоб показати клієнтам свою
                    кваліфікацію
                  </p>
                  {isEditable && (
                    <Button onClick={handleAddWorkExperience}>
                      <Plus className="h-4 w-4 mr-2" />
                      Додати перший досвід
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {workExperience.map((experience) => (
                <Card
                  key={experience.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {experience.position}
                        </CardTitle>
                        <CardDescription className="text-base font-medium">
                          {experience.company_name}
                        </CardDescription>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {formatDate(experience.start_date)} -{" "}
                              {experience.is_current
                                ? "Поточний час"
                                : experience.end_date
                                ? formatDate(experience.end_date)
                                : "Не вказано"}
                            </span>
                          </div>
                          {experience.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{experience.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {getEmploymentTypeLabel(experience.employment_type)}
                        </Badge>
                        {experience.is_current && (
                          <Badge variant="default">Поточна робота</Badge>
                        )}
                        {isEditable && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleEditWorkExperience(experience)
                              }
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDeleteWorkExperience(experience.id)
                              }
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {experience.description && (
                      <p className="text-sm text-muted-foreground">
                        {experience.description}
                      </p>
                    )}

                    {experience.achievements &&
                      experience.achievements.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Досягнення:</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {experience.achievements.map(
                              (achievement, index) => (
                                <li key={index}>{achievement}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                    {experience.skills_used &&
                      experience.skills_used.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">
                            Використані навички:
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {experience.skills_used.map((skill, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                    {experience.company_website && (
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={experience.company_website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Сайт компанії
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Work Experience Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem
                ? "Редагувати досвід роботи"
                : "Додати досвід роботи"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Оновіть інформацію про досвід роботи"
                : "Додайте новий досвід роботи до свого профілю"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="company_name">Назва компанії *</Label>
              <Input
                id="company_name"
                value={workFormData.company_name}
                onChange={(e) =>
                  setWorkFormData((prev) => ({
                    ...prev,
                    company_name: e.target.value,
                  }))
                }
                placeholder="Наприклад: Google, Microsoft, Freelance"
              />
            </div>

            {/* Position */}
            <div className="space-y-2">
              <Label htmlFor="position">Посада *</Label>
              <Input
                id="position"
                value={workFormData.position}
                onChange={(e) =>
                  setWorkFormData((prev) => ({
                    ...prev,
                    position: e.target.value,
                  }))
                }
                placeholder="Наприклад: Senior Frontend Developer"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Місцезнаходження</Label>
                <Input
                  id="location"
                  value={workFormData.location}
                  onChange={(e) =>
                    setWorkFormData((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  placeholder="Київ, Україна"
                />
              </div>

              {/* Employment Type */}
              <div className="space-y-2">
                <Label htmlFor="employment_type">Тип зайнятості</Label>
                <Select
                  value={workFormData.employment_type}
                  onValueChange={(value) =>
                    setWorkFormData((prev) => ({
                      ...prev,
                      employment_type: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">
                      Повний робочий день
                    </SelectItem>
                    <SelectItem value="part-time">
                      Неповний робочий день
                    </SelectItem>
                    <SelectItem value="contract">Контракт</SelectItem>
                    <SelectItem value="freelance">Фріланс</SelectItem>
                    <SelectItem value="internship">Стажування</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="start_date">Дата початку *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={workFormData.start_date}
                  onChange={(e) =>
                    setWorkFormData((prev) => ({
                      ...prev,
                      start_date: e.target.value,
                    }))
                  }
                />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label htmlFor="end_date">Дата закінчення</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={workFormData.end_date}
                  onChange={(e) =>
                    setWorkFormData((prev) => ({
                      ...prev,
                      end_date: e.target.value,
                    }))
                  }
                  disabled={workFormData.is_current}
                />
              </div>
            </div>

            {/* Current Job */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_current"
                checked={workFormData.is_current}
                onCheckedChange={(checked) =>
                  setWorkFormData((prev) => ({
                    ...prev,
                    is_current: !!checked,
                  }))
                }
              />
              <Label htmlFor="is_current">Поточна робота</Label>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Опис роботи</Label>
              <Textarea
                id="description"
                value={workFormData.description}
                onChange={(e) =>
                  setWorkFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Опишіть свої обов'язки та досягнення на цій посаді..."
                rows={3}
              />
            </div>

            {/* Company Website */}
            <div className="space-y-2">
              <Label htmlFor="company_website">Сайт компанії</Label>
              <Input
                id="company_website"
                value={workFormData.company_website}
                onChange={(e) =>
                  setWorkFormData((prev) => ({
                    ...prev,
                    company_website: e.target.value,
                  }))
                }
                placeholder="https://company.com"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Скасувати
            </Button>
            <Button onClick={handleSubmitWorkExperience}>
              {editingItem ? "Оновити" : "Додати"} досвід
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
