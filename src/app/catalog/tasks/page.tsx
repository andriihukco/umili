"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import { PageHeader } from "@/components/ui/page-header";
import {
  ContentLayout,
  FilterSection,
  ContentList,
} from "@/components/ui/content-layout";
import { ClientRatingDisplay } from "@/components/ui/client-rating-display";
import { mapProjectTypeToDisplay } from "@/lib/project-types";
import { TaskCardSkeleton } from "@/components/ui/task-card-skeleton";
import { FilterSkeleton } from "@/components/ui/filter-skeleton";
import { RegistrationCTACard } from "@/components/ui/registration-cta-card";
import { RegistrationModal } from "@/components/ui/registration-modal";
import {
  Search,
  Filter,
  Plus,
  Send,
  X,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";

interface Task {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: string;
  created_at: string;
  client_id: string;
  freelancer_id: string | null;
  created_by: string;
  category: string | null;
  skills_required: string[] | null;
  experience_level: string | null;
  project_type: string | null;
  estimated_duration: string | null;
  deadline: string | null;
  additional_requirements: string | null;
  client: {
    id: string;
    name: string;
    avatar: string | null;
    bio?: string | null;
  };
}

interface Skill {
  id: string;
  name: string;
  category: string;
  description: string | null;
}

interface FilterState {
  searchTerm: string;
  status: string;
  budgetRange: string;
  minPrice: number;
  maxPrice: number;
  experienceLevel: string;
  projectType: string;
  skillsRequired: string[];
  skillCategories: string[];
  specificSkills: string[];
  deadlineRange: string;
  clientRating: string;
  sortBy: string;
}

// TaskCard Component
interface TaskCardProps {
  task: Task;
  formatDate: (dateString: string) => string;
  onCardClick: () => void;
}

function TaskCard({ task, formatDate, onCardClick }: TaskCardProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Check if description is more than 2 lines
  const shouldShowExpandButton =
    task.description && task.description.length > 150;

  // Check if deadline is urgent (within 7 days)
  const isDeadlineUrgent =
    task.deadline &&
    (() => {
      const now = new Date();
      const deadline = new Date(task.deadline);
      const daysDiff = Math.ceil(
        (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysDiff <= 7;
    })();

  return (
    <Card
      className={`hover:shadow-lg transition-all duration-200 border-border cursor-pointer ${
        isDeadlineUrgent ? "border-orange-200 bg-orange-50/30" : ""
      }`}
      onClick={onCardClick}
    >
      {/* Deadline Alert Banner */}
      {isDeadlineUrgent && (
        <div className="bg-orange-100 border-b border-orange-200 px-4 py-2">
          <div className="flex items-center gap-2 text-orange-800 text-sm font-medium">
            <AlertTriangle className="h-4 w-4" />
            <span>Терміновий дедлайн: {formatDate(task.deadline!)}</span>
          </div>
        </div>
      )}

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header Section - Compact */}
          <div>
            {/* Title */}
            <CardTitle className="text-base font-bold text-foreground leading-tight mb-2">
              {task.title}
            </CardTitle>

            {/* Budget and Task Type Row */}
            <div className="flex items-center gap-3 mb-2">
              <div className="text-lg font-bold text-primary">
                ₴{task.budget.toLocaleString()}
              </div>
              {task.project_type && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  {mapProjectTypeToDisplay(task.project_type) ||
                    task.project_type}
                </Badge>
              )}
            </div>
          </div>

          {/* Skills Section - Compact */}
          {task.skills_required && task.skills_required.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.skills_required.slice(0, 3).map((skill, skillIndex) => (
                <Badge
                  key={skillIndex}
                  variant="secondary"
                  className="text-xs px-1.5 py-0.5 font-medium"
                >
                  {skill}
                </Badge>
              ))}
              {task.skills_required.length > 3 && (
                <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                  +{task.skills_required.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Description Section - Compact */}
          <div>
            <p
              className={`text-xs text-muted-foreground leading-relaxed ${
                !isDescriptionExpanded && shouldShowExpandButton
                  ? "line-clamp-2"
                  : ""
              }`}
            >
              {task.description}
            </p>
            {shouldShowExpandButton && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDescriptionExpanded(!isDescriptionExpanded);
                }}
                className="text-primary hover:text-primary/80 text-xs font-medium mt-1 transition-colors"
              >
                {isDescriptionExpanded ? "Менше" : "Більше"}
              </button>
            )}
          </div>

          {/* Client Info - Compact */}
          <div
            className="hover:text-primary cursor-pointer transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `/clients/${task.client_id}`;
            }}
          >
            <div className="text-xs font-medium text-foreground">
              {task.client?.name || "Невідомий клієнт"}
            </div>
            <ClientRatingDisplay
              clientId={task.client_id}
              size="sm"
              showCount={false}
            />
          </div>

          {/* Footer Info - Compact */}
          <div className="pt-2 border-t border-border/30">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <div className="flex items-center gap-3">
                <span>{formatDate(task.created_at)}</span>
                {task.estimated_duration && (
                  <span className="font-medium">{task.estimated_duration}</span>
                )}
              </div>
              {task.deadline && (
                <span className="font-medium text-orange-600">
                  Дедлайн: {formatDate(task.deadline)}
                </span>
              )}
            </div>
            {task.category && (
              <div className="text-xs text-muted-foreground">
                Категорія: <span className="font-medium">{task.category}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSkillsLoading, setIsSkillsLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    status: "all",
    budgetRange: "all",
    minPrice: 0,
    maxPrice: 100000,
    experienceLevel: "all",
    projectType: "all",
    skillsRequired: [],
    skillCategories: [],
    specificSkills: [],
    deadlineRange: "all",
    clientRating: "all",
    sortBy: "newest",
  });
  const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [applicationMessage, setApplicationMessage] = useState("");
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const { user, profile } = useAppStore();

  useEffect(() => {
    fetchTasks();
    fetchSkills();
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching tasks...");

      // Check if Supabase is configured
      if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ) {
        console.error("Supabase environment variables are not configured");
        console.error(
          "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file"
        );
        setTasks([]);
        return;
      }

      const { data, error } = await supabase
        .from("tasks")
        .select(
          `
          *,
          client:users!tasks_client_id_fkey(*)
        `
        )
        .neq("status", "draft")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching tasks:", error);
        console.error("Error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        setTasks([]);
        return;
      }

      console.log("Tasks fetched successfully:", data?.length || 0, "tasks");
      console.log("Tasks fetched:", data?.length || 0);
      setTasks(data || []);
      setFilteredTasks(data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSkills = async () => {
    try {
      setIsSkillsLoading(true);
      console.log("Fetching skills...");

      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .order("category", { ascending: true })
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching skills:", error);
        console.error("Skills error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        setSkills([]);
        return;
      }

      console.log("Skills fetched successfully:", data?.length || 0, "skills");
      setSkills(data || []);
    } catch (error) {
      console.error("Error fetching skills:", error);
      setSkills([]);
    } finally {
      setIsSkillsLoading(false);
    }
  };

  const filterAndSortTasks = useCallback(() => {
    let filtered = [...tasks];

    // Search filter
    if (filters.searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          task.description
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase()) ||
          task.category
            ?.toLowerCase()
            .includes(filters.searchTerm.toLowerCase()) ||
          task.skills_required?.some((skill) =>
            skill.toLowerCase().includes(filters.searchTerm.toLowerCase())
          )
      );
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter((task) => task.status === filters.status);
    }

    // Budget filter
    if (filters.budgetRange !== "all") {
      switch (filters.budgetRange) {
        case "budget":
          filtered = filtered.filter((task) => task.budget < 5000);
          break;
        case "mid":
          filtered = filtered.filter(
            (task) => task.budget >= 5000 && task.budget < 20000
          );
          break;
        case "premium":
          filtered = filtered.filter((task) => task.budget >= 20000);
          break;
      }
    }

    // Price range filter - only apply if user has set custom values
    if (filters.minPrice > 0 || filters.maxPrice < 100000) {
      filtered = filtered.filter(
        (task) =>
          task.budget >= filters.minPrice && task.budget <= filters.maxPrice
      );
    }

    // Experience level filter
    if (filters.experienceLevel !== "all") {
      filtered = filtered.filter(
        (task) => task.experience_level === filters.experienceLevel
      );
    }

    // Project type filter
    if (filters.projectType !== "all") {
      filtered = filtered.filter(
        (task) => task.project_type === filters.projectType
      );
    }

    // Skills required filter
    if (filters.skillsRequired.length > 0) {
      filtered = filtered.filter((task) =>
        task.skills_required?.some((skill) =>
          filters.skillsRequired.includes(skill)
        )
      );
    }

    // Skill category filter
    if (filters.skillCategories.length > 0) {
      filtered = filtered.filter((task) =>
        task.skills_required?.some((skill) =>
          skills.some(
            (s) =>
              s.name === skill && filters.skillCategories.includes(s.category)
          )
        )
      );
    }

    // Specific skills filter
    if (filters.specificSkills.length > 0) {
      filtered = filtered.filter((task) =>
        task.skills_required?.some((skill) =>
          filters.specificSkills.includes(skill)
        )
      );
    }

    // Deadline range filter
    if (filters.deadlineRange !== "all") {
      const now = new Date();
      filtered = filtered.filter((task) => {
        if (!task.deadline) return false;
        const deadline = new Date(task.deadline);
        const daysDiff = Math.ceil(
          (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        switch (filters.deadlineRange) {
          case "urgent":
            return daysDiff <= 7;
          case "soon":
            return daysDiff > 7 && daysDiff <= 30;
          case "flexible":
            return daysDiff > 30;
          default:
            return true;
        }
      });
    }

    // Client rating filter - this will be applied after fetching client ratings
    // For now, we'll skip this filter as it requires async data fetching
    // This could be implemented with a separate API call or by joining ratings data

    // Sort
    switch (filters.sortBy) {
      case "newest":
        filtered.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case "oldest":
        filtered.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        break;
      case "budget-high":
        filtered.sort((a, b) => b.budget - a.budget);
        break;
      case "budget-low":
        filtered.sort((a, b) => a.budget - b.budget);
        break;
      case "deadline":
        filtered.sort((a, b) => {
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return (
            new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          );
        });
        break;
    }

    setFilteredTasks(filtered);
  }, [tasks, filters, skills]);

  useEffect(() => {
    filterAndSortTasks();
  }, [filterAndSortTasks]);

  const updateFilter = (
    key: keyof FilterState,
    value: string | string[] | number
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]:
        key === "minPrice" || key === "maxPrice"
          ? parseInt(value as string)
          : value,
    }));
  };

  const toggleSkill = (skill: string) => {
    setFilters((prev) => ({
      ...prev,
      skillsRequired: prev.skillsRequired.includes(skill)
        ? prev.skillsRequired.filter((s) => s !== skill)
        : [...prev.skillsRequired, skill],
    }));
  };

  const toggleSkillCategory = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      skillCategories: prev.skillCategories.includes(category)
        ? prev.skillCategories.filter((c) => c !== category)
        : [...prev.skillCategories, category],
    }));
  };

  const toggleSpecificSkill = (skill: string) => {
    setFilters((prev) => ({
      ...prev,
      specificSkills: prev.specificSkills.includes(skill)
        ? prev.specificSkills.filter((s) => s !== skill)
        : [...prev.specificSkills, skill],
    }));
  };

  const toggleAccordionItem = (category: string) => {
    setOpenAccordionItems((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: "",
      status: "all",
      budgetRange: "all",
      minPrice: 0,
      maxPrice: 100000,
      experienceLevel: "all",
      projectType: "all",
      skillsRequired: [],
      skillCategories: [],
      specificSkills: [],
      deadlineRange: "all",
      clientRating: "all",
      sortBy: "newest",
    });
  };

  const getSkillCategories = () => {
    const categories = [...new Set(skills.map((skill) => skill.category))];
    return categories.sort();
  };

  const getSkillsByCategory = (category: string) => {
    return skills.filter((skill) => skill.category === category);
  };

  const getAvailableProjectTypes = () => {
    const types = tasks.map((task) => task.project_type).filter(Boolean);
    return [...new Set(types)].sort();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.status !== "all") count++;
    if (filters.budgetRange !== "all") count++;
    if (filters.minPrice > 0 || filters.maxPrice < 100000) count++;
    if (filters.experienceLevel !== "all") count++;
    if (filters.projectType !== "all") count++;
    if (filters.skillsRequired.length > 0) count++;
    if (filters.skillCategories.length > 0) count++;
    if (filters.specificSkills.length > 0) count++;
    if (filters.deadlineRange !== "all") count++;
    if (filters.clientRating !== "all") count++;
    return count;
  };

  const handleSubmitApplication = async () => {
    if (!user || !selectedTask || !applicationMessage.trim()) {
      alert("Будь ласка, заповніть повідомлення");
      return;
    }

    setIsSubmittingApplication(true);

    try {
      const { error } = await supabase.from("applications").insert({
        task_id: selectedTask.id,
        freelancer_id: user.id,
        message: applicationMessage.trim(),
      });

      if (error) {
        console.error("Error submitting application:", error);
        console.error("Error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });

        // Show more specific error message
        let errorMessage = "Помилка при подачі заявки";
        if (error.code === "23505") {
          errorMessage = "Ви вже подавали заявку на це завдання";
        } else if (error.code === "23503") {
          errorMessage = "Помилка з посиланнями на завдання або користувача";
        } else if (error.message) {
          errorMessage = `Помилка: ${error.message}`;
        }

        alert(errorMessage);
        return;
      }

      alert("Заявка успішно подана!");
      setApplicationDialogOpen(false);
      setSelectedTask(null);
      setApplicationMessage("");
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Помилка при подачі заявки");
    } finally {
      setIsSubmittingApplication(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div>
        <PageHeader
          title="Каталог проєктів"
          description="Знайдіть ідеальний проєкт для своїх талантів"
          actions={
            user &&
            profile?.role === "client" && (
              <Button asChild>
                <Link href="/tasks/create" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Створити проєкт
                </Link>
              </Button>
            )
          }
        />
      </div>

      {/* Mobile Filter Toggle */}
      <div className="lg:hidden px-3 sm:px-4">
        {isSkillsLoading ? (
          <div className="h-10 w-full bg-muted animate-pulse rounded-md"></div>
        ) : (
          <Button
            variant="outline"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full flex items-center gap-2 text-xs sm:text-sm"
          >
            <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
            Фільтри{" "}
            {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
          </Button>
        )}
      </div>

      {/* Main Content Layout */}
      <ContentLayout
        showMobileFilters={showMobileFilters}
        onMobileFiltersToggle={() => setShowMobileFilters(!showMobileFilters)}
        filteredCount={filteredTasks.length}
        onClearFilters={clearFilters}
        filters={
          isSkillsLoading ? (
            <FilterSkeleton />
          ) : (
            <FilterSection title="">
              {/* Active Filters */}
              {getActiveFiltersCount() > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Активні фільтри
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Очистити все
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {filters.skillCategories.map((category) => (
                      <Badge
                        key={category}
                        variant="secondary"
                        className="text-xs"
                      >
                        {category}
                        <X
                          className="ml-1 h-3 w-3 cursor-pointer"
                          onClick={() => toggleSkillCategory(category)}
                        />
                      </Badge>
                    ))}
                    {filters.specificSkills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="text-xs"
                      >
                        {skill}
                        <X
                          className="ml-1 h-3 w-3 cursor-pointer"
                          onClick={() => toggleSpecificSkill(skill)}
                        />
                      </Badge>
                    ))}
                    {filters.skillsRequired.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="text-xs"
                      >
                        {skill}
                        <X
                          className="ml-1 h-3 w-3 cursor-pointer"
                          onClick={() => toggleSkill(skill)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Sort */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Сортування</Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => updateFilter("sortBy", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Сортування" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Новіші</SelectItem>
                    <SelectItem value="oldest">Старіші</SelectItem>
                    <SelectItem value="budget-high">Бюджет ↓</SelectItem>
                    <SelectItem value="budget-low">Бюджет ↑</SelectItem>
                    <SelectItem value="deadline">За дедлайном</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Пошук проєктів..."
                  value={filters.searchTerm}
                  onChange={(e) => updateFilter("searchTerm", e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Budget Range - Chips */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Бюджет</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "Всі" },
                    { value: "budget", label: "До 5,000₴" },
                    { value: "mid", label: "5,000-20,000₴" },
                    { value: "premium", label: "Від 20,000₴" },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={
                        filters.budgetRange === option.value
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => updateFilter("budgetRange", option.value)}
                      className="text-xs"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Price Range Inputs */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Діапазон цін</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="Від ₴"
                      value={filters.minPrice > 0 ? filters.minPrice : ""}
                      onChange={(e) => {
                        const value = e.target.value
                          ? parseInt(e.target.value)
                          : 0;
                        updateFilter("minPrice", value.toString());
                      }}
                      className="text-sm"
                      min={0}
                      max={100000}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="До ₴"
                      value={filters.maxPrice < 100000 ? filters.maxPrice : ""}
                      onChange={(e) => {
                        const value = e.target.value
                          ? parseInt(e.target.value)
                          : 100000;
                        updateFilter("maxPrice", value.toString());
                      }}
                      className="text-sm"
                      min={0}
                      max={100000}
                    />
                  </div>
                </div>
              </div>

              {/* Experience Level - Chips */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Рівень досвіду</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "Всі" },
                    { value: "beginner", label: "Початківець" },
                    { value: "intermediate", label: "Середній" },
                    { value: "advanced", label: "Просунутий" },
                    { value: "expert", label: "Експерт" },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={
                        filters.experienceLevel === option.value
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        updateFilter("experienceLevel", option.value)
                      }
                      className="text-xs"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Project Type */}
              {getAvailableProjectTypes().length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Тип проєкту</Label>
                  <Select
                    value={filters.projectType}
                    onValueChange={(value) =>
                      updateFilter("projectType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Тип проєкту" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Всі типи</SelectItem>
                      {getAvailableProjectTypes().map((type) => (
                        <SelectItem key={type} value={type!}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Deadline Range - Chips */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Дедлайн</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "Всі" },
                    { value: "urgent", label: "Терміново (≤7 днів)" },
                    { value: "soon", label: "Скоро (≤30 днів)" },
                    { value: "flexible", label: "Гнучко (>30 днів)" },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={
                        filters.deadlineRange === option.value
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        updateFilter("deadlineRange", option.value)
                      }
                      className="text-xs"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Client Rating - Chips */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Рейтинг клієнта</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "Всі" },
                    { value: "high", label: "Високий (4.5+)" },
                    { value: "good", label: "Хороший (4.0+)" },
                    { value: "average", label: "Середній (3.0+)" },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={
                        filters.clientRating === option.value
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => updateFilter("clientRating", option.value)}
                      className="text-xs"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Skills Accordion */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Навички</Label>
                <Accordion>
                  {getSkillCategories().map((category) => (
                    <AccordionItem key={category} className="border-border">
                      <div className="flex items-center space-x-3 w-full py-3 px-4">
                        <Checkbox
                          id={`category-${category}`}
                          checked={filters.skillCategories.includes(category)}
                          onCheckedChange={() => toggleSkillCategory(category)}
                          className="flex-shrink-0"
                        />
                        <Label
                          htmlFor={`category-${category}`}
                          className="text-sm font-medium cursor-pointer flex-1"
                        >
                          {category}
                        </Label>
                        <button
                          onClick={() => toggleAccordionItem(category)}
                          className="flex-shrink-0 p-1 hover:bg-muted/50 rounded transition-colors"
                        >
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${
                              openAccordionItems.includes(category)
                                ? "rotate-180"
                                : ""
                            }`}
                          />
                        </button>
                      </div>
                      {openAccordionItems.includes(category) && (
                        <AccordionContent>
                          <div className="space-y-2 px-4 pb-2">
                            {getSkillsByCategory(category).map((skill) => (
                              <div
                                key={skill.id}
                                className="flex items-center space-x-3 hover:bg-muted/30 rounded-md p-2 -m-2 transition-colors"
                              >
                                <Checkbox
                                  id={`skill-${skill.id}`}
                                  checked={filters.specificSkills.includes(
                                    skill.name
                                  )}
                                  onCheckedChange={() =>
                                    toggleSpecificSkill(skill.name)
                                  }
                                  className="flex-shrink-0"
                                />
                                <Label
                                  htmlFor={`skill-${skill.id}`}
                                  className="text-sm cursor-pointer flex-1"
                                >
                                  {skill.name}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      )}
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </FilterSection>
          )
        }
      >
        <ContentList
          emptyState={
            <div className="text-center py-12">
              <div className="max-w-md mx-auto space-y-6">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Проєкти не знайдено</h3>
                  <p className="text-muted-foreground">
                    {tasks.length === 0
                      ? "Перевірте підключення до бази даних або спробуйте змінити фільтри."
                      : "Спробуйте змінити фільтри або очистити пошук"}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Очистити фільтри
                  </Button>
                  <Button asChild>
                    <Link href="/auth/register">Стати замовником</Link>
                  </Button>
                </div>
              </div>
            </div>
          }
        >
          {isLoading ? (
            // Show skeleton cards while loading
            Array.from({ length: 6 }).map((_, index) => (
              <TaskCardSkeleton key={index} />
            ))
          ) : filteredTasks.length > 0 ? (
            <>
              {filteredTasks
                .slice(0, user ? filteredTasks.length : 10)
                .map((task) => (
                  <div key={task.id} className="mb-4 last:mb-0">
                    <TaskCard
                      task={task}
                      formatDate={formatDate}
                      onCardClick={() => {
                        if (user) {
                          window.location.href = `/tasks/${task.id}`;
                        } else {
                          setRegistrationModalOpen(true);
                        }
                      }}
                    />
                  </div>
                ))}
              {/* Registration CTA Card - Show when no more cards to display */}
              {filteredTasks.length >= 10 && (
                <RegistrationCTACard
                  onCardClick={() => (window.location.href = "/auth/register")}
                />
              )}
            </>
          ) : (
            // Show empty state when no tasks match filters
            <div className="text-center py-12">
              <div className="max-w-md mx-auto space-y-6">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Проєкти не знайдено</h3>
                  <p className="text-muted-foreground">
                    Спробуйте змінити фільтри або очистити пошук
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Очистити фільтри
                  </Button>
                  <Button asChild>
                    <Link href="/auth/register">Стати замовником</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </ContentList>
      </ContentLayout>

      {/* Registration Modal */}
      <RegistrationModal
        open={registrationModalOpen}
        onOpenChange={setRegistrationModalOpen}
        type="task"
      />

      {/* Application Dialog */}
      <Dialog
        open={applicationDialogOpen}
        onOpenChange={setApplicationDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Подати заявку на проєкт</DialogTitle>
            <DialogDescription>
              Напишіть повідомлення замовнику, чому ви підходите для цього
              проєкту
            </DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded-lg">
                <h4 className="font-semibold">{selectedTask.title}</h4>
                <p className="text-sm text-muted-foreground">
                  Бюджет: {selectedTask.budget.toLocaleString()} ₴
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="application-message">
                  Ваше повідомлення <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="application-message"
                  placeholder="Опишіть ваш досвід, навички та чому ви підходите для цього проєкту..."
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApplicationDialogOpen(false)}
            >
              Скасувати
            </Button>
            <Button
              onClick={handleSubmitApplication}
              disabled={isSubmittingApplication || !applicationMessage.trim()}
            >
              {isSubmittingApplication ? (
                "Подача заявки..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Подати заявку
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
