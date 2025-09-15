"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import {
  AppleSkillsSelector,
  SkillCategory,
} from "@/components/ui/apple-skills-selector";
import { Check, Circle, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { useSidebar } from "@/contexts/sidebar-context";
import { useAuth } from "@/hooks/use-auth";
// import { useToast } from "@/hooks/use-toast"; // Not used in this component

type UserType = "freelancer" | "client";

// Skill categories for freelancers
const skillCategories: SkillCategory[] = [
  {
    id: "frontend",
    name: "Frontend Development",
    items: [
      "React",
      "Vue.js",
      "Angular",
      "JavaScript",
      "TypeScript",
      "HTML/CSS",
      "SASS/SCSS",
      "Tailwind CSS",
      "Bootstrap",
      "Next.js",
      "Nuxt.js",
      "Gatsby",
    ],
  },
  {
    id: "backend",
    name: "Backend Development",
    items: [
      "Node.js",
      "Python",
      "PHP",
      "Java",
      "C#",
      "Go",
      "Ruby",
      "Express.js",
      "Django",
      "Laravel",
      "Spring Boot",
      "ASP.NET",
    ],
  },
  {
    id: "design",
    name: "Design",
    items: [
      "Figma",
      "Adobe XD",
      "Sketch",
      "Photoshop",
      "Illustrator",
      "InDesign",
      "UI Design",
      "UX Design",
      "Web Design",
      "Mobile Design",
      "Brand Design",
      "Print Design",
    ],
  },
  {
    id: "mobile",
    name: "Mobile Development",
    items: [
      "React Native",
      "Flutter",
      "Swift",
      "Kotlin",
      "iOS Development",
      "Android Development",
      "Xamarin",
      "Ionic",
      "Cordova",
    ],
  },
  {
    id: "marketing",
    name: "Marketing & SEO",
    items: [
      "SEO",
      "Google Analytics",
      "Facebook Ads",
      "Google Ads",
      "Content Marketing",
      "Social Media Marketing",
      "Email Marketing",
      "PPC",
      "SEM",
      "Marketing Strategy",
      "Branding",
    ],
  },
  {
    id: "data",
    name: "Data & Analytics",
    items: [
      "Data Analysis",
      "Machine Learning",
      "Python Data Science",
      "R",
      "SQL",
      "Tableau",
      "Power BI",
      "Excel",
      "Statistics",
      "Business Intelligence",
    ],
  },
  {
    id: "writing",
    name: "Writing & Content",
    items: [
      "Copywriting",
      "Content Writing",
      "Technical Writing",
      "Blog Writing",
      "SEO Writing",
      "Translation",
      "Proofreading",
      "Editing",
      "Creative Writing",
    ],
  },
  {
    id: "other",
    name: "Інші навички",
    items: [
      "WordPress",
      "Shopify",
      "Magento",
      "WooCommerce",
      "DevOps",
      "AWS",
      "Docker",
      "Git",
      "Project Management",
      "Consulting",
    ],
  },
];

// Project type categories for clients
const projectTypeCategories: SkillCategory[] = [
  {
    id: "development",
    name: "Розробка",
    items: [
      "Веб-сайт",
      "Мобільний додаток",
      "E-commerce платформа",
      "CRM система",
      "API розробка",
      "Інтеграція систем",
      "Технічна підтримка",
      "Рефакторинг коду",
    ],
  },
  {
    id: "design",
    name: "Дизайн",
    items: [
      "UI/UX дизайн",
      "Логотип та брендинг",
      "Веб-дизайн",
      "Мобільний дизайн",
      "Графічний дизайн",
      "Інфографіка",
      "Презентації",
      "Полиграфія",
    ],
  },
  {
    id: "marketing",
    name: "Маркетинг",
    items: [
      "SMM",
      "Контент-маркетинг",
      "SEO оптимізація",
      "Реклама в Google/Facebook",
      "Email-маркетинг",
      "Вірусний маркетинг",
      "Influencer маркетинг",
      "Аналітика та звіти",
    ],
  },
  {
    id: "content",
    name: "Контент",
    items: [
      "Копірайтинг",
      "Контент-план",
      "Блог-пости",
      "Статті",
      "Переклади",
      "Редагування",
      "Відео-контент",
      "Подкасти",
    ],
  },
  {
    id: "media",
    name: "Медіа",
    items: [
      "Фотографія",
      "Відеомонтаж",
      "Анімація",
      "Моушн-дизайн",
      "Звукозапис",
      "Стримінг",
      "Віртуальна реальність",
    ],
  },
  {
    id: "business",
    name: "Бізнес",
    items: [
      "Консультації",
      "Бізнес-планування",
      "Фінансовий аналіз",
      "Маркетингові дослідження",
      "HR послуги",
      "Юридичні послуги",
      "Бухгалтерія",
    ],
  },
];

function RegisterPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { sidebarCollapsed } = useSidebar();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  // const { toast } = useToast(); // Not used in this component

  const [userType, setUserType] = useState<UserType>("freelancer");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showChecklist, setShowChecklist] = useState(false);

  // Basic form data
  const [basicData, setBasicData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Client-specific data
  const [clientData, setClientData] = useState({
    company: "",
    position: "",
    industry: "",
    companySize: "",
    website: "",
    phone: "",
    bio: "",
    projectTypes: [] as string[],
    budgetRange: "",
    timeline: "",
  });

  // Talent-specific data
  const [talentData, setTalentData] = useState({
    title: "",
    bio: "",
    skills: [] as string[],
    hourlyRate: "",
    experience: "",
    location: "",
    availability: "",
    portfolio: "",
    languages: [] as string[],
    education: "",
    certifications: [] as string[],
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      // Redirect based on user role
      if (user.role === "admin") {
        router.push("/admin/dashboard");
      } else if (user.role === "client") {
        router.push("/client-jobs");
      } else if (user.role === "freelancer") {
        router.push("/freelancer-jobs");
      } else {
        router.push("/");
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    const type = searchParams.get("type") as UserType;
    const role = searchParams.get("role") as UserType;
    const email = searchParams.get("email");

    // Handle both 'type' and 'role' parameters for backward compatibility
    const userTypeParam = role || type;
    if (
      userTypeParam &&
      (userTypeParam === "freelancer" || userTypeParam === "client")
    ) {
      setUserType(userTypeParam);
    }

    if (email) {
      setBasicData((prev) => ({ ...prev, email }));
    }
  }, [searchParams]);

  // Show loading while checking auth status
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500 mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render register form if already authenticated
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500 mx-auto mb-4" />
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validation
    if (basicData.password !== basicData.confirmPassword) {
      setError("Паролі не співпадають");
      setIsLoading(false);
      return;
    }

    if (basicData.password.length < 6) {
      setError("Пароль повинен містити мінімум 6 символів");
      setIsLoading(false);
      return;
    }

    try {
      // Determine the correct site URL for email redirects
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

      const { data, error } = await supabase.auth.signUp({
        email: basicData.email,
        password: basicData.password,
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback`,
          data: {
            name: basicData.name,
            role: userType,
            // Store additional profile data in metadata for later use
            profileData: {
              ...(userType === "client"
                ? {
                    bio: clientData.bio || null,
                    skills:
                      clientData.projectTypes.length > 0
                        ? clientData.projectTypes
                        : null,
                    company: clientData.company || null,
                    position: clientData.position || null,
                    industry: clientData.industry || null,
                    companySize: clientData.companySize || null,
                    website: clientData.website || null,
                    phone: clientData.phone || null,
                    budgetRange: clientData.budgetRange || null,
                    timeline: clientData.timeline || null,
                  }
                : {
                    bio: talentData.bio || null,
                    skills:
                      talentData.skills.length > 0 ? talentData.skills : null,
                    hourly_rate: talentData.hourlyRate
                      ? parseFloat(talentData.hourlyRate)
                      : null,
                    title: talentData.title || null,
                    experience: talentData.experience || null,
                    location: talentData.location || null,
                    availability: talentData.availability || null,
                    portfolio: talentData.portfolio || null,
                    languages:
                      talentData.languages.length > 0
                        ? talentData.languages
                        : null,
                    education: talentData.education || null,
                    certifications:
                      talentData.certifications.length > 0
                        ? talentData.certifications
                        : null,
                  }),
            },
          },
        },
      });

      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Store email for confirmation screen
        localStorage.setItem("registeredEmail", basicData.email);
        localStorage.setItem(
          "registrationData",
          JSON.stringify({
            name: basicData.name,
            userType,
            profileData: userType === "client" ? clientData : talentData,
          })
        );

        // Always redirect to confirmation screen - no profile creation here
        router.push(
          `/auth/email-confirmation?email=${encodeURIComponent(
            basicData.email
          )}`
        );
      }
    } catch (error) {
      console.error("Registration error:", error);
      // Always redirect to confirmation screen even on error
      localStorage.setItem("registeredEmail", basicData.email);
      router.push(
        `/auth/email-confirmation?email=${encodeURIComponent(basicData.email)}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBasicInputChange = (field: string, value: string) => {
    setBasicData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClientInputChange = (field: string, value: string | string[]) => {
    setClientData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTalentInputChange = (field: string, value: string | string[]) => {
    setTalentData((prev) => ({ ...prev, [field]: value }));
  };

  const getInteractiveSuggestions = () => {
    const suggestions = [
      {
        id: "basic_info",
        text: "Основна інформація: ім'я, email та пароль",
        completed:
          basicData.name.trim().length > 2 &&
          basicData.email.includes("@") &&
          basicData.password.length >= 6 &&
          basicData.confirmPassword === basicData.password,
      },
      {
        id: "profile_info",
        text:
          userType === "freelancer"
            ? "Професійна інформація: заголовок, досвід та портфоліо"
            : "Інформація про компанію: назва, посада та галузь",
        completed:
          userType === "freelancer"
            ? talentData.title.trim().length > 0 &&
              talentData.experience.length > 0 &&
              talentData.bio.trim().length > 20
            : clientData.company.trim().length > 0 &&
              clientData.position.trim().length > 0 &&
              clientData.industry.length > 0,
      },
      {
        id: "skills_selection",
        text:
          userType === "freelancer"
            ? "Навички та експертиза: оберіть свої навички"
            : "Типи проєктів: оберіть цікаві вам проєкти",
        completed:
          userType === "freelancer"
            ? talentData.skills.length > 0
            : clientData.projectTypes.length > 0,
      },
      {
        id: "additional_details",
        text:
          userType === "freelancer"
            ? "Додаткові деталі: ставка, локація та доступність"
            : "Додаткові деталі: розмір компанії та веб-сайт",
        completed:
          userType === "freelancer"
            ? talentData.hourlyRate.length > 0 &&
              talentData.location.trim().length > 0
            : clientData.companySize.length > 0,
      },
    ];

    return suggestions;
  };

  const getProgressPercentage = () => {
    const suggestions = getInteractiveSuggestions();
    const completedCount = suggestions.filter((s) => s.completed).length;
    return Math.round((completedCount / suggestions.length) * 100);
  };

  const isFormValid = () => {
    const suggestions = getInteractiveSuggestions();
    return suggestions.every((s) => s.completed);
  };

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <div className="py-12 px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Реєстрація</h1>
          <p className="text-muted-foreground">
            Створіть новий акаунт для початку роботи
          </p>
        </div>

        {/* Role Switcher */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setUserType("freelancer")}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                userType === "freelancer"
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              Я шукаю роботу
            </button>
            <button
              onClick={() => setUserType("client")}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                userType === "client"
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              Я шукаю талант
            </button>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100"></div>

      <form id="register-form" onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className="py-12 px-6">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-2">
                Основна інформація
              </h2>
              <p className="text-muted-foreground">
                Вкажіть основні дані для створення акаунту
              </p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Ім&apos;я *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Ваше ім'я"
                    value={basicData.name}
                    onChange={(e) =>
                      handleBasicInputChange("name", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={basicData.email}
                    onChange={(e) =>
                      handleBasicInputChange("email", e.target.value)
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Пароль *</Label>
                  <PasswordInput
                    id="password"
                    placeholder="••••••••"
                    value={basicData.password}
                    onChange={(e) =>
                      handleBasicInputChange("password", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Підтвердіть пароль *</Label>
                  <PasswordInput
                    id="confirmPassword"
                    placeholder="••••••••"
                    value={basicData.confirmPassword}
                    onChange={(e) =>
                      handleBasicInputChange("confirmPassword", e.target.value)
                    }
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100"></div>

        {/* Client-specific Information */}
        {userType === "client" && (
          <div className="py-12 px-6">
            <div className="max-w-2xl mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-2">
                  Інформація про компанію
                </h2>
                <p className="text-muted-foreground">
                  Розкажіть про свою компанію та проєкти
                </p>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Назва компанії</Label>
                    <Input
                      id="company"
                      type="text"
                      placeholder="Назва вашої компанії"
                      value={clientData.company}
                      onChange={(e) =>
                        handleClientInputChange("company", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Ваша посада</Label>
                    <Input
                      id="position"
                      type="text"
                      placeholder="CEO, Marketing Manager, etc."
                      value={clientData.position}
                      onChange={(e) =>
                        handleClientInputChange("position", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Галузь</Label>
                    <Select
                      value={clientData.industry}
                      onValueChange={(value) =>
                        handleClientInputChange("industry", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Оберіть галузь" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tech">Технології</SelectItem>
                        <SelectItem value="marketing">Маркетинг</SelectItem>
                        <SelectItem value="finance">Фінанси</SelectItem>
                        <SelectItem value="healthcare">
                          Охорона здоров&apos;я
                        </SelectItem>
                        <SelectItem value="education">Освіта</SelectItem>
                        <SelectItem value="retail">
                          Роздрібна торгівля
                        </SelectItem>
                        <SelectItem value="other">Інше</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companySize">Розмір компанії</Label>
                    <Select
                      value={clientData.companySize}
                      onValueChange={(value) =>
                        handleClientInputChange("companySize", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Оберіть розмір" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">
                          1-10 співробітників
                        </SelectItem>
                        <SelectItem value="11-50">
                          11-50 співробітників
                        </SelectItem>
                        <SelectItem value="51-200">
                          51-200 співробітників
                        </SelectItem>
                        <SelectItem value="201-500">
                          201-500 співробітників
                        </SelectItem>
                        <SelectItem value="500+">
                          500+ співробітників
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Веб-сайт</Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://yourcompany.com"
                      value={clientData.website}
                      onChange={(e) =>
                        handleClientInputChange("website", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Телефон</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+380 123 456 789"
                      value={clientData.phone}
                      onChange={(e) =>
                        handleClientInputChange("phone", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientBio">Про компанію</Label>
                  <Textarea
                    id="clientBio"
                    placeholder="Розкажіть про свою компанію, цілі та проєкти..."
                    value={clientData.bio}
                    onChange={(e) =>
                      handleClientInputChange("bio", e.target.value)
                    }
                    rows={4}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-100"></div>

        {/* Talent-specific Information */}
        {userType === "freelancer" && (
          <div className="py-12 px-6">
            <div className="max-w-2xl mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-2">
                  Професійна інформація
                </h2>
                <p className="text-muted-foreground">
                  Розкажіть про свої навички та досвід
                </p>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Професійний заголовок</Label>
                    <Input
                      id="title"
                      type="text"
                      placeholder="Frontend Developer, UI/UX Designer, etc."
                      value={talentData.title}
                      onChange={(e) =>
                        handleTalentInputChange("title", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Ставка за годину (₴)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      placeholder="500"
                      value={talentData.hourlyRate}
                      onChange={(e) =>
                        handleTalentInputChange("hourlyRate", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experience">Досвід роботи</Label>
                    <Select
                      value={talentData.experience}
                      onValueChange={(value) =>
                        handleTalentInputChange("experience", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Оберіть досвід" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-1">0-1 рік</SelectItem>
                        <SelectItem value="1-3">1-3 роки</SelectItem>
                        <SelectItem value="3-5">3-5 років</SelectItem>
                        <SelectItem value="5-10">5-10 років</SelectItem>
                        <SelectItem value="10+">10+ років</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Місцезнаходження</Label>
                    <Input
                      id="location"
                      type="text"
                      placeholder="Київ, Україна"
                      value={talentData.location}
                      onChange={(e) =>
                        handleTalentInputChange("location", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="talentBio">Про себе</Label>
                  <Textarea
                    id="talentBio"
                    placeholder="Розкажіть про свій досвід, навички та досягнення..."
                    value={talentData.bio}
                    onChange={(e) =>
                      handleTalentInputChange("bio", e.target.value)
                    }
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portfolio">Портфоліо/Посилання</Label>
                  <Input
                    id="portfolio"
                    type="url"
                    placeholder="https://yourportfolio.com"
                    value={talentData.portfolio}
                    onChange={(e) =>
                      handleTalentInputChange("portfolio", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-100"></div>

        {/* Skills Section */}
        {userType === "freelancer" ? (
          <div className="py-12 px-6">
            <div className="max-w-2xl mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-2">
                  Навички та експертиза
                </h2>
                <p className="text-muted-foreground">
                  Оберіть всі навички, якими ви володієте
                </p>
              </div>
              <AppleSkillsSelector
                categories={skillCategories}
                selectedItems={talentData.skills}
                onSelectionChange={(skills) =>
                  handleTalentInputChange("skills", skills)
                }
                maxSelections={15}
                allowCustom={true}
                customPlaceholder="Додати власну навичку"
              />
            </div>
          </div>
        ) : (
          <div className="py-12 px-6">
            <div className="max-w-2xl mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-2">Типи проєктів</h2>
                <p className="text-muted-foreground">
                  Оберіть всі типи проєктів, які вас цікавлять
                </p>
              </div>
              <AppleSkillsSelector
                categories={projectTypeCategories}
                selectedItems={clientData.projectTypes}
                onSelectionChange={(types) =>
                  handleClientInputChange("projectTypes", types)
                }
                maxSelections={10}
                allowCustom={true}
                customPlaceholder="Додати власний тип проєкту"
              />
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-100"></div>
      </form>

      {/* Fixed Bottom Section */}
      <div
        className={`fixed bottom-0 bg-white border-t border-gray-200 shadow-lg transition-all duration-300 ease-in-out ${
          sidebarCollapsed
            ? "left-16 right-0 lg:left-16"
            : "left-0 right-0 lg:left-64"
        }`}
      >
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowChecklist(!showChecklist)}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              >
                {showChecklist ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </button>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-medium text-gray-700 font-['Geologica']">
                    Прогрес реєстрації
                  </span>
                  <span className="text-sm font-semibold text-gray-900 font-['Geologica']">
                    {getProgressPercentage()}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gray-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage()}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Expandable Checklist */}
            {showChecklist && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 font-['Geologica']">
                  Чек-лист для реєстрації
                </h3>
                <div className="space-y-2">
                  {getInteractiveSuggestions().map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="flex items-center gap-3 text-sm transition-all duration-200"
                    >
                      <div className="flex-shrink-0">
                        {suggestion.completed ? (
                          <Check className="h-4 w-4 text-gray-600" />
                        ) : (
                          <Circle className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <span
                        className={`font-['Geologica'] ${
                          suggestion.completed
                            ? "text-gray-900"
                            : "text-gray-500"
                        }`}
                      >
                        {suggestion.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {error && (
                <div className="text-sm text-destructive text-center bg-destructive/10 p-3 rounded-lg">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                form="register-form"
                className="w-full sm:w-auto sm:mx-auto h-12 px-8 font-['Geologica'] bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                disabled={isLoading || !isFormValid()}
              >
                {isLoading ? "Реєстрація..." : "Зареєструватись"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterPageContent />
    </Suspense>
  );
}
