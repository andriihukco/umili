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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import { PageHeader } from "@/components/ui/page-header";
import {
  ContentLayout,
  FilterSection,
  ContentList,
} from "@/components/ui/content-layout";
import { FreelancerRatingDisplay } from "@/components/ui/freelancer-rating-display";
import { FreelancerCardSkeleton } from "@/components/ui/freelancer-card-skeleton";
import { FilterSkeleton } from "@/components/ui/filter-skeleton";
import { RegistrationCTACard } from "@/components/ui/registration-cta-card";
import { RegistrationModal } from "@/components/ui/registration-modal";
import { Search, Filter, X } from "lucide-react";
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
  portfolio: {
    id: string;
    title: string;
    description: string;
    image_url: string | null;
    category: string | null;
    rating: number | null;
  }[];
  user_skills: {
    skill_id: string;
    proficiency_level: string;
    years_experience: number;
    skills: {
      name: string;
      category: string;
    };
  }[];
}

interface Skill {
  id: string;
  name: string;
  category: string;
  description: string | null;
}

interface FilterState {
  searchTerm: string;
  experienceLevel: string;
  hourlyRateRange: string;
  skillCategories: string[];
  specificSkills: string[];
  availability: string;
  freelancerRating: string;
  sortBy: string;
}

// FreelancerCard Component
interface FreelancerCardProps {
  freelancer: Freelancer;
  portfolioCount: number;
  experience: { label: string; variant: "secondary" | "default" | "outline" };
  formatDate: (dateString: string) => string;
  onCardClick: () => void;
}

function FreelancerCard({
  freelancer,
  portfolioCount,
  experience,
  formatDate,
  onCardClick,
}: FreelancerCardProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Check if description is more than 2 lines
  const shouldShowExpandButton = freelancer.bio && freelancer.bio.length > 100;

  return (
    <Card
      className="hover:shadow-lg transition-all duration-200 border-border cursor-pointer"
      onClick={onCardClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header Section - Compact */}
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarImage
                src={freelancer.avatar || ""}
                alt={freelancer.name}
              />
              <AvatarFallback className="text-sm font-semibold">
                {freelancer.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              {/* Name and Rating */}
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-base font-bold text-foreground">
                  {freelancer.name}
                </CardTitle>
                <FreelancerRatingDisplay
                  freelancerId={freelancer.id}
                  size="sm"
                  showCount={false}
                />
              </div>

              {/* Key Info Row */}
              <div className="flex items-center gap-3 mb-2">
                {freelancer.hourly_rate && (
                  <div className="text-sm font-bold text-primary">
                    ₴{freelancer.hourly_rate}/год
                  </div>
                )}
                <Badge
                  variant={experience.variant}
                  className="text-xs font-medium px-2 py-0.5"
                >
                  {experience.label}
                </Badge>
                <span className="text-xs text-muted-foreground">Україна</span>
              </div>
            </div>
          </div>

          {/* Skills Section - Compact */}
          {freelancer.user_skills && freelancer.user_skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {freelancer.user_skills.slice(0, 3).map((skill, skillIndex) => (
                <Badge
                  key={skillIndex}
                  variant="secondary"
                  className="text-xs px-1.5 py-0.5 font-medium"
                >
                  {skill.skills.name}
                </Badge>
              ))}
              {freelancer.user_skills.length > 3 && (
                <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                  +{freelancer.user_skills.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Bio Section - Compact */}
          {freelancer.bio && (
            <div>
              <p
                className={`text-xs text-muted-foreground leading-relaxed ${
                  !isDescriptionExpanded && shouldShowExpandButton
                    ? "line-clamp-2"
                    : ""
                }`}
              >
                {freelancer.bio}
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
          )}

          {/* Footer Info - Compact */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/30">
            <span className="font-medium">{portfolioCount} проєктів</span>
            <span>{formatDate(freelancer.created_at)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FreelancersPage() {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [filteredFreelancers, setFilteredFreelancers] = useState<Freelancer[]>(
    []
  );
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSkillsLoading, setIsSkillsLoading] = useState(true);

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([]);
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    experienceLevel: "all",
    hourlyRateRange: "all",
    skillCategories: [],
    specificSkills: [],
    availability: "all",
    freelancerRating: "all",
    sortBy: "newest",
  });
  const { user } = useAppStore();

  const fetchFreelancers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select(
          `
          *,
          portfolio:portfolio(*),
          user_skills:user_skills(
            *,
            skills:skills(*)
          )
        `
        )
        .eq("role", "freelancer")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching freelancers:", error);
        setFreelancers([]);
        setFilteredFreelancers([]);
      } else {
        console.log("Freelancers fetched successfully:", data?.length || 0);
        setFreelancers(data || []);
        setFilteredFreelancers(data || []);
      }
    } catch (error) {
      console.error("Error fetching freelancers:", error);
      setFreelancers([]);
      setFilteredFreelancers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSkills = async () => {
    try {
      setIsSkillsLoading(true);
      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .eq("is_active", true)
        .order("category, name");

      if (error) {
        console.error("Error fetching skills:", error);
        return;
      }

      setSkills(data || []);
    } catch (error) {
      console.error("Error fetching skills:", error);
    } finally {
      setIsSkillsLoading(false);
    }
  };

  const filterAndSortFreelancers = useCallback(() => {
    let filtered = [...freelancers];

    // Search filter
    if (filters.searchTerm) {
      filtered = filtered.filter(
        (freelancer) =>
          freelancer.name
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase()) ||
          freelancer.email
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase()) ||
          freelancer.bio
            ?.toLowerCase()
            .includes(filters.searchTerm.toLowerCase()) ||
          freelancer.user_skills?.some((skill) =>
            skill.skills.name
              .toLowerCase()
              .includes(filters.searchTerm.toLowerCase())
          )
      );
    }

    // Experience filter (based on portfolio items count)
    if (filters.experienceLevel !== "all") {
      switch (filters.experienceLevel) {
        case "beginner":
          filtered = filtered.filter(
            (freelancer) => (freelancer.portfolio?.length || 0) < 3
          );
          break;
        case "intermediate":
          filtered = filtered.filter((freelancer) => {
            const portfolioCount = freelancer.portfolio?.length || 0;
            return portfolioCount >= 3 && portfolioCount < 10;
          });
          break;
        case "expert":
          filtered = filtered.filter(
            (freelancer) => (freelancer.portfolio?.length || 0) >= 10
          );
          break;
      }
    }

    // Hourly rate filter
    if (filters.hourlyRateRange !== "all") {
      switch (filters.hourlyRateRange) {
        case "budget":
          filtered = filtered.filter(
            (freelancer) =>
              freelancer.hourly_rate && freelancer.hourly_rate <= 500
          );
          break;
        case "mid":
          filtered = filtered.filter(
            (freelancer) =>
              freelancer.hourly_rate &&
              freelancer.hourly_rate > 500 &&
              freelancer.hourly_rate <= 1000
          );
          break;
        case "premium":
          filtered = filtered.filter(
            (freelancer) =>
              freelancer.hourly_rate && freelancer.hourly_rate > 1000
          );
          break;
      }
    }

    // Skill category filter
    if (filters.skillCategories.length > 0) {
      filtered = filtered.filter((freelancer) =>
        freelancer.user_skills?.some((skill) =>
          filters.skillCategories.includes(skill.skills.category)
        )
      );
    }

    // Specific skills filter
    if (filters.specificSkills.length > 0) {
      filtered = filtered.filter((freelancer) =>
        freelancer.user_skills?.some((skill) =>
          filters.specificSkills.includes(skill.skills.name)
        )
      );
    }

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
      case "portfolio":
        filtered.sort(
          (a, b) => (b.portfolio?.length || 0) - (a.portfolio?.length || 0)
        );
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "rate-low":
        filtered.sort((a, b) => (a.hourly_rate || 0) - (b.hourly_rate || 0));
        break;
      case "rate-high":
        filtered.sort((a, b) => (b.hourly_rate || 0) - (a.hourly_rate || 0));
        break;
    }

    setFilteredFreelancers(filtered);
  }, [freelancers, filters]);

  useEffect(() => {
    console.log("FreelancersPage useEffect called");
    fetchFreelancers();
    fetchSkills();
  }, []);

  useEffect(() => {
    filterAndSortFreelancers();
  }, [filterAndSortFreelancers]);

  const updateFilter = (key: keyof FilterState, value: string | string[]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
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
      experienceLevel: "all",
      hourlyRateRange: "all",
      skillCategories: [],
      specificSkills: [],
      availability: "all",
      freelancerRating: "all",
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

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.experienceLevel !== "all") count++;
    if (filters.hourlyRateRange !== "all") count++;
    if (filters.skillCategories.length > 0) count++;
    if (filters.specificSkills.length > 0) count++;
    if (filters.availability !== "all") count++;
    if (filters.freelancerRating !== "all") count++;
    return count;
  };

  const getExperienceLevel = (portfolioCount: number) => {
    if (portfolioCount < 3)
      return { label: "Початківець", variant: "secondary" as const };
    if (portfolioCount < 10)
      return { label: "Середній", variant: "default" as const };
    return { label: "Експерт", variant: "outline" as const };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "long",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div>
        <PageHeader
          title="Каталог умільців"
          description="Знайдіть найкращих талановитих умільців для вашого проєкту"
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

      {/* Main Content */}
      <ContentLayout
        showMobileFilters={showMobileFilters}
        onMobileFiltersToggle={() => setShowMobileFilters(!showMobileFilters)}
        filteredCount={filteredFreelancers.length}
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
                    <SelectItem value="portfolio">За портфоліо</SelectItem>
                    <SelectItem value="name">За іменем</SelectItem>
                    <SelectItem value="rate-low">Ставка ↑</SelectItem>
                    <SelectItem value="rate-high">Ставка ↓</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Пошук умільців..."
                  value={filters.searchTerm}
                  onChange={(e) => updateFilter("searchTerm", e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Experience Level - Chips */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Рівень досвіду</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "Всі" },
                    { value: "beginner", label: "Початківець" },
                    { value: "intermediate", label: "Середній" },
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

              {/* Hourly Rate Range - Chips */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Ставка за годину</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "Всі" },
                    { value: "budget", label: "До 500₴" },
                    { value: "mid", label: "500-1000₴" },
                    { value: "premium", label: "Від 1000₴" },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={
                        filters.hourlyRateRange === option.value
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        updateFilter("hourlyRateRange", option.value)
                      }
                      className="text-xs"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Freelancer Rating - Chips */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Рейтинг умільця</Label>
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
                        filters.freelancerRating === option.value
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        updateFilter("freelancerRating", option.value)
                      }
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
                      <AccordionTrigger
                        onClick={() => toggleAccordionItem(category)}
                        isOpen={openAccordionItems.includes(category)}
                        className="w-full hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-3 w-full">
                          <Checkbox
                            id={`category-${category}`}
                            checked={filters.skillCategories.includes(category)}
                            onCheckedChange={() =>
                              toggleSkillCategory(category)
                            }
                            onClick={(e) => e.stopPropagation()}
                            className="flex-shrink-0"
                          />
                          <Label
                            htmlFor={`category-${category}`}
                            className="text-sm font-medium cursor-pointer flex-1"
                          >
                            {category}
                          </Label>
                        </div>
                      </AccordionTrigger>
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
                  <h3 className="text-lg font-semibold">Умільці не знайдено</h3>
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
                    <Link href="/auth/register">Стати умільцем</Link>
                  </Button>
                </div>
              </div>
            </div>
          }
        >
          {isLoading ? (
            // Show skeleton cards while loading
            Array.from({ length: 6 }).map((_, index) => (
              <FreelancerCardSkeleton key={index} />
            ))
          ) : filteredFreelancers.length > 0 ? (
            <>
              {/* Show actual freelancer cards */}
              {filteredFreelancers
                .slice(0, user ? filteredFreelancers.length : 10)
                .map((freelancer) => {
                  const portfolioCount = freelancer.portfolio?.length || 0;
                  const experience = getExperienceLevel(portfolioCount);

                  return (
                    <div key={freelancer.id} className="mb-4 last:mb-0">
                      <FreelancerCard
                        freelancer={freelancer}
                        portfolioCount={portfolioCount}
                        experience={experience}
                        formatDate={formatDate}
                        onCardClick={() => {
                          if (user) {
                            window.location.href = `/freelancers/${freelancer.id}`;
                          } else {
                            setRegistrationModalOpen(true);
                          }
                        }}
                      />
                    </div>
                  );
                })}
              {/* Registration CTA Card - Show when no more cards to display */}
              {filteredFreelancers.length >= 10 && (
                <RegistrationCTACard
                  onCardClick={() => (window.location.href = "/auth/register")}
                />
              )}
            </>
          ) : (
            // Show empty state when no freelancers match filters
            <div className="text-center py-12">
              <div className="max-w-md mx-auto space-y-6">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Умільці не знайдено</h3>
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
                    <Link href="/auth/register">Стати умільцем</Link>
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
        type="freelancer"
      />
    </div>
  );
}
