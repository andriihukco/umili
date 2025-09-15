"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import {
  Plus,
  Edit,
  Trash2,
  Star,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  project_url: string | null;
  skills_used: string[] | null;
  category: string | null;
  budget_range: string | null;
  duration: string | null;
  client_feedback: string | null;
  rating: number | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

interface PortfolioManagerProps {
  userId?: string;
  isEditable?: boolean;
}

export function PortfolioManager({
  userId,
  isEditable = true,
}: PortfolioManagerProps) {
  const { user } = useAppStore();
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [skills, setSkills] = useState<
    { id: string; name: string; category: string }[]
  >([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    project_url: "",
    skills_used: [] as string[],
    category: "",
    budget_range: "",
    duration: "",
    client_feedback: "",
    rating: "",
    is_featured: false,
  });

  const targetUserId = userId || user?.id;

  const fetchPortfolioItems = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("portfolio")
        .select("*")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching portfolio:", error);
        return;
      }

      setPortfolioItems(data || []);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
    } finally {
      setIsLoading(false);
    }
  }, [targetUserId]);

  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .eq("is_active", true)
        .order("name");

      if (error) {
        console.error("Error fetching categories:", error);
        return;
      }

      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

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
      fetchPortfolioItems();
      fetchCategories();
      fetchSkills();
    }
  }, [targetUserId, fetchPortfolioItems, fetchCategories, fetchSkills]);

  const handleAddItem = () => {
    setEditingItem(null);
    setFormData({
      title: "",
      description: "",
      image_url: "",
      project_url: "",
      skills_used: [],
      category: "",
      budget_range: "",
      duration: "",
      client_feedback: "",
      rating: "",
      is_featured: false,
    });
    setIsDialogOpen(true);
  };

  const handleEditItem = (item: PortfolioItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      image_url: item.image_url || "",
      project_url: item.project_url || "",
      skills_used: item.skills_used || [],
      category: item.category || "",
      budget_range: item.budget_range || "",
      duration: item.duration || "",
      client_feedback: item.client_feedback || "",
      rating: item.rating?.toString() || "",
      is_featured: item.is_featured,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Ви впевнені, що хочете видалити цей проєкт з портфоліо?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("portfolio")
        .delete()
        .eq("id", itemId);

      if (error) {
        console.error("Error deleting portfolio item:", error);
        toast.error("Помилка при видаленні проєкту");
        return;
      }

      toast.success("Проєкт видалено з портфоліо");
      fetchPortfolioItems();
    } catch (error) {
      console.error("Error deleting portfolio item:", error);
      toast.error("Помилка при видаленні проєкту");
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Будь ласка, заповніть назву та опис проєкту");
      return;
    }

    try {
      const portfolioData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        image_url: formData.image_url.trim() || null,
        project_url: formData.project_url.trim() || null,
        skills_used:
          formData.skills_used.length > 0 ? formData.skills_used : null,
        category: formData.category || null,
        budget_range: formData.budget_range.trim() || null,
        duration: formData.duration.trim() || null,
        client_feedback: formData.client_feedback.trim() || null,
        rating: formData.rating ? parseFloat(formData.rating) : null,
        is_featured: formData.is_featured,
        user_id: targetUserId,
      };

      if (editingItem) {
        const { error } = await supabase
          .from("portfolio")
          .update(portfolioData)
          .eq("id", editingItem.id);

        if (error) {
          console.error("Error updating portfolio item:", error);
          toast.error("Помилка при оновленні проєкту");
          return;
        }

        toast.success("Проєкт оновлено");
      } else {
        const { error } = await supabase
          .from("portfolio")
          .insert(portfolioData);

        if (error) {
          console.error("Error creating portfolio item:", error);
          toast.error("Помилка при створенні проєкту");
          return;
        }

        toast.success("Проєкт додано до портфоліо");
      }

      setIsDialogOpen(false);
      fetchPortfolioItems();
    } catch (error) {
      console.error("Error saving portfolio item:", error);
      toast.error("Помилка при збереженні проєкту");
    }
  };

  const addSkill = (skillName: string) => {
    if (!formData.skills_used.includes(skillName)) {
      setFormData((prev) => ({
        ...prev,
        skills_used: [...prev.skills_used, skillName],
      }));
    }
  };

  const removeSkill = (skillName: string) => {
    setFormData((prev) => ({
      ...prev,
      skills_used: prev.skills_used.filter((skill) => skill !== skillName),
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground">Завантаження портфоліо...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Портфоліо</h2>
          <p className="text-muted-foreground">
            Покажіть свої найкращі роботи та досягнення
          </p>
        </div>
        {isEditable && (
          <Button onClick={handleAddItem}>
            <Plus className="h-4 w-4 mr-2" />
            Додати проєкт
          </Button>
        )}
      </div>

      {/* Portfolio Grid */}
      {portfolioItems.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Портфоліо порожнє</h3>
              <p className="text-muted-foreground mb-6">
                Додайте свої проєкти, щоб показати потенційним клієнтам якість
                вашої роботи
              </p>
              {isEditable && (
                <Button onClick={handleAddItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Додати перший проєкт
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioItems.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">
                      {item.title}
                    </CardTitle>
                    {item.category && (
                      <Badge variant="outline" className="mt-2">
                        {item.category}
                      </Badge>
                    )}
                  </div>
                  {item.is_featured && (
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Image */}
                  {item.image_url && (
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                      <Image
                        src={item.image_url}
                        alt={item.title}
                        width={400}
                        height={225}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {item.description}
                  </p>

                  {/* Skills */}
                  {item.skills_used && item.skills_used.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Навички:</p>
                      <div className="flex flex-wrap gap-1">
                        {item.skills_used.slice(0, 3).map((skill, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {item.skills_used.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{item.skills_used.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Project Details */}
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {item.budget_range && (
                      <div>Бюджет: {item.budget_range}</div>
                    )}
                    {item.duration && <div>Тривалість: {item.duration}</div>}
                    {item.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span>{item.rating}/5</span>
                      </div>
                    )}
                  </div>

                  {/* Client Feedback */}
                  {item.client_feedback && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-1">
                        Відгук клієнта:
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        &quot;{item.client_feedback}&quot;
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    {item.project_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={item.project_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Переглянути
                        </a>
                      </Button>
                    )}
                    {isEditable && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditItem(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Додано: {formatDate(item.created_at)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Редагувати проєкт" : "Додати проєкт"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Оновіть інформацію про проєкт"
                : "Додайте новий проєкт до свого портфоліо"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Назва проєкту *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Наприклад: Лендінг-сторінка для інтернет-магазину"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Опис проєкту *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Детально опишіть проєкт, технології, які використовували, результати..."
                rows={4}
              />
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label htmlFor="image_url">URL зображення</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    image_url: e.target.value,
                  }))
                }
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Project URL */}
            <div className="space-y-2">
              <Label htmlFor="project_url">URL проєкту</Label>
              <Input
                id="project_url"
                value={formData.project_url}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    project_url: e.target.value,
                  }))
                }
                placeholder="https://example.com"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Категорія</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Оберіть категорію" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <Label>Навички</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.skills_used.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:text-red-600"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <Select onValueChange={addSkill}>
                <SelectTrigger>
                  <SelectValue placeholder="Додати навичку" />
                </SelectTrigger>
                <SelectContent>
                  {skills
                    .filter(
                      (skill) => !formData.skills_used.includes(skill.name)
                    )
                    .map((skill) => (
                      <SelectItem key={skill.id} value={skill.name}>
                        {skill.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Budget Range */}
            <div className="space-y-2">
              <Label htmlFor="budget_range">Бюджет</Label>
              <Input
                id="budget_range"
                value={formData.budget_range}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    budget_range: e.target.value,
                  }))
                }
                placeholder="Наприклад: 10,000 - 15,000 ₴"
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Тривалість</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, duration: e.target.value }))
                }
                placeholder="Наприклад: 2 тижні"
              />
            </div>

            {/* Client Feedback */}
            <div className="space-y-2">
              <Label htmlFor="client_feedback">Відгук клієнта</Label>
              <Textarea
                id="client_feedback"
                value={formData.client_feedback}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    client_feedback: e.target.value,
                  }))
                }
                placeholder="Що сказав клієнт про вашу роботу..."
                rows={3}
              />
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label htmlFor="rating">Оцінка клієнта (1-5)</Label>
              <Input
                id="rating"
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, rating: e.target.value }))
                }
                placeholder="4.5"
              />
            </div>

            {/* Featured */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_featured"
                checked={formData.is_featured}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    is_featured: e.target.checked,
                  }))
                }
                className="rounded"
              />
              <Label htmlFor="is_featured">
                Показати як рекомендований проєкт
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Скасувати
            </Button>
            <Button onClick={handleSubmit}>
              {editingItem ? "Оновити" : "Додати"} проєкт
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
