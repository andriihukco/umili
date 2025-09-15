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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import { Plus, Trash2, Star, Clock, Award } from "lucide-react";
import { toast } from "sonner";

interface Skill {
  id: string;
  name: string;
  category: string;
  description: string | null;
}

interface UserSkill {
  id: string;
  skill_id: string;
  proficiency_level: "beginner" | "intermediate" | "advanced" | "expert";
  years_experience: number;
  skills: Skill;
}

interface SkillsManagerProps {
  userId?: string;
  isEditable?: boolean;
}

export function SkillsManager({
  userId,
  isEditable = true,
}: SkillsManagerProps) {
  const { user } = useAppStore();
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [proficiencyLevel, setProficiencyLevel] = useState<
    "beginner" | "intermediate" | "advanced" | "expert"
  >("intermediate");
  const [yearsExperience, setYearsExperience] = useState<number>(0);

  const targetUserId = userId || user?.id;

  const fetchUserSkills = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("user_skills")
        .select(
          `
          *,
          skills:skill_id(*)
        `
        )
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching user skills:", error);
        return;
      }

      setUserSkills(data || []);
    } catch (error) {
      console.error("Error fetching user skills:", error);
    } finally {
      setIsLoading(false);
    }
  }, [targetUserId]);

  const fetchAvailableSkills = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) {
        console.error("Error fetching skills:", error);
        return;
      }

      setAvailableSkills(data || []);
    } catch (error) {
      console.error("Error fetching skills:", error);
    }
  }, []);

  useEffect(() => {
    if (targetUserId) {
      fetchUserSkills();
      fetchAvailableSkills();
    }
  }, [targetUserId, fetchUserSkills, fetchAvailableSkills]);

  const handleAddSkill = async () => {
    if (!selectedSkill) {
      toast.error("Будь ласка, оберіть навичку");
      return;
    }

    // Check if skill already exists
    const existingSkill = userSkills.find(
      (skill) => skill.skill_id === selectedSkill
    );
    if (existingSkill) {
      toast.error("Ця навичка вже додана до вашого профілю");
      return;
    }

    try {
      const { error } = await supabase.from("user_skills").insert({
        user_id: targetUserId,
        skill_id: selectedSkill,
        proficiency_level: proficiencyLevel,
        years_experience: yearsExperience,
      });

      if (error) {
        console.error("Error adding skill:", error);
        toast.error("Помилка при додаванні навички");
        return;
      }

      toast.success("Навичку додано до профілю");
      setSelectedSkill("");
      setProficiencyLevel("intermediate");
      setYearsExperience(0);
      fetchUserSkills();
    } catch (error) {
      console.error("Error adding skill:", error);
      toast.error("Помилка при додаванні навички");
    }
  };

  const handleRemoveSkill = async (skillId: string) => {
    if (!confirm("Ви впевнені, що хочете видалити цю навичку з профілю?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("user_skills")
        .delete()
        .eq("id", skillId);

      if (error) {
        console.error("Error removing skill:", error);
        toast.error("Помилка при видаленні навички");
        return;
      }

      toast.success("Навичку видалено з профілю");
      fetchUserSkills();
    } catch (error) {
      console.error("Error removing skill:", error);
      toast.error("Помилка при видаленні навички");
    }
  };

  const getProficiencyIcon = (level: string) => {
    switch (level) {
      case "beginner":
        return <Star className="h-4 w-4 text-green-500" />;
      case "intermediate":
        return <Star className="h-4 w-4 text-yellow-500" />;
      case "advanced":
        return <Star className="h-4 w-4 text-orange-500" />;
      case "expert":
        return <Star className="h-4 w-4 text-red-500" />;
      default:
        return <Star className="h-4 w-4 text-gray-500" />;
    }
  };

  const getProficiencyLabel = (level: string) => {
    switch (level) {
      case "beginner":
        return "Початківець";
      case "intermediate":
        return "Середній рівень";
      case "advanced":
        return "Досвідчений";
      case "expert":
        return "Експерт";
      default:
        return level;
    }
  };

  const getProficiencyColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800 border-green-200";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "advanced":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "expert":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSkillsByCategory = () => {
    const skillsByCategory: { [key: string]: UserSkill[] } = {};

    userSkills.forEach((skill) => {
      const category = skill.skills.category;
      if (!skillsByCategory[category]) {
        skillsByCategory[category] = [];
      }
      skillsByCategory[category].push(skill);
    });

    return skillsByCategory;
  };

  const getAvailableSkillsForCategory = (category: string) => {
    return availableSkills.filter(
      (skill) =>
        skill.category === category &&
        !userSkills.some((userSkill) => userSkill.skill_id === skill.id)
    );
  };

  const getCategories = () => {
    const categories = new Set(availableSkills.map((skill) => skill.category));
    return Array.from(categories).sort();
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground">Завантаження навичок...</div>
      </div>
    );
  }

  const skillsByCategory = getSkillsByCategory();
  const categories = getCategories();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Навички</h2>
          <p className="text-muted-foreground">
            Покажіть свої професійні навички та рівень досвіду
          </p>
        </div>
        {isEditable && (
          <div className="text-sm text-muted-foreground">
            {userSkills.length} навичок додано
          </div>
        )}
      </div>

      {/* Add Skill Form */}
      {isEditable && (
        <Card>
          <CardHeader>
            <CardTitle>Додати навичку</CardTitle>
            <CardDescription>
              Додайте нову навичку до свого профілю
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="skill">Навичка</Label>
                <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                  <SelectTrigger>
                    <SelectValue placeholder="Оберіть навичку" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <div key={category}>
                        <div className="px-2 py-1 text-sm font-medium text-muted-foreground">
                          {category}
                        </div>
                        {getAvailableSkillsForCategory(category).map(
                          (skill) => (
                            <SelectItem key={skill.id} value={skill.id}>
                              {skill.name}
                            </SelectItem>
                          )
                        )}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="proficiency">Рівень</Label>
                <Select
                  value={proficiencyLevel}
                  onValueChange={(
                    value: "beginner" | "intermediate" | "advanced" | "expert"
                  ) => setProficiencyLevel(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Початківець</SelectItem>
                    <SelectItem value="intermediate">
                      Середній рівень
                    </SelectItem>
                    <SelectItem value="advanced">Досвідчений</SelectItem>
                    <SelectItem value="expert">Експерт</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Років досвіду</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  max="50"
                  value={yearsExperience}
                  onChange={(e) =>
                    setYearsExperience(parseInt(e.target.value) || 0)
                  }
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <Button onClick={handleAddSkill} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Додати
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skills by Category */}
      {userSkills.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Навички не додані</h3>
              <p className="text-muted-foreground mb-6">
                Додайте свої професійні навички, щоб клієнти могли знайти вас
              </p>
              {isEditable && (
                <p className="text-sm text-muted-foreground">
                  Використовуйте форму вище для додавання навичок
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => {
            const categorySkills = skillsByCategory[category];
            if (!categorySkills || categorySkills.length === 0) return null;

            return (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    {category}
                  </CardTitle>
                  <CardDescription>
                    {categorySkills.length} навичок у цій категорії
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categorySkills.map((skill) => (
                      <div
                        key={skill.id}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{skill.skills.name}</h4>
                            {skill.skills.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {skill.skills.description}
                              </p>
                            )}
                          </div>
                          {isEditable && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveSkill(skill.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {getProficiencyIcon(skill.proficiency_level)}
                            <Badge
                              className={getProficiencyColor(
                                skill.proficiency_level
                              )}
                            >
                              {getProficiencyLabel(skill.proficiency_level)}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{skill.years_experience} років досвіду</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Skills Summary */}
      {userSkills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Підсумок навичок</CardTitle>
            <CardDescription>Загальна статистика ваших навичок</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{userSkills.length}</div>
                <div className="text-sm text-muted-foreground">
                  Всього навичок
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {
                    userSkills.filter(
                      (skill) => skill.proficiency_level === "expert"
                    ).length
                  }
                </div>
                <div className="text-sm text-muted-foreground">
                  Експертний рівень
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {Math.round(
                    userSkills.reduce(
                      (sum, skill) => sum + skill.years_experience,
                      0
                    ) / userSkills.length
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  Середній досвід (роки)
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{categories.length}</div>
                <div className="text-sm text-muted-foreground">Категорій</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
