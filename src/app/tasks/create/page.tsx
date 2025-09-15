"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import {
  Check,
  Circle,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  AppleSkillsSelector,
  SkillCategory,
} from "@/components/ui/apple-skills-selector";
import { useSidebar } from "@/contexts/sidebar-context";
import { getProjectTypes, mapProjectTypeToDb } from "@/lib/project-types";

export default function CreateTaskPage() {
  const router = useRouter();
  const { user, profile } = useAppStore();
  const { sidebarCollapsed } = useSidebar();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
    category: "",
    deadline: "",
    skills: [] as string[],
    project_type: "",
    estimated_duration: "",
  });

  const categories = [
    "Веб-розробка",
    "Дизайн",
    "Маркетинг",
    "Копірайтинг",
    "Переклади",
    "Консультації",
    "Фотографія",
    "Відеомонтаж",
    "Програмування",
    "Тестування",
    "SEO",
    "SMM",
    "Інше",
  ];

  // Skill categories for task creation
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

  const projectTypes = getProjectTypes();

  const validateField = (name: string, value: string) => {
    const newErrors: Record<string, string> = {};

    switch (name) {
      case "title":
        if (!value.trim()) {
          newErrors.title = "Введіть назву завдання";
        } else if (value.trim().length < 10) {
          newErrors.title = `Назва занадто коротка. Мінімум 10 символів (зараз: ${
            value.trim().length
          })`;
        } else if (value.trim().length > 200) {
          newErrors.title = `Назва занадто довга. Максимум 200 символів (зараз: ${
            value.trim().length
          })`;
        }
        break;
      case "description":
        if (!value.trim()) {
          newErrors.description = "Введіть опис завдання";
        } else if (value.trim().length < 50) {
          newErrors.description = `Опис занадто короткий. Мінімум 50 символів (зараз: ${
            value.trim().length
          })`;
        } else if (value.trim().length > 5000) {
          newErrors.description = `Опис занадто довгий. Максимум 5000 символів (зараз: ${
            value.trim().length
          })`;
        }
        break;
      case "budget":
        if (!value.trim()) {
          newErrors.budget = "Введіть бюджет завдання";
        } else {
          const budget = parseFloat(value);
          if (isNaN(budget)) {
            newErrors.budget = "Бюджет повинен бути числом (наприклад: 10000)";
          } else if (budget <= 0) {
            newErrors.budget = "Бюджет повинен бути більше 0";
          } else if (budget < 100) {
            newErrors.budget = "Мінімальний бюджет: 100 ₴";
          } else if (budget > 1000000) {
            newErrors.budget = "Максимальний бюджет: 1,000,000 ₴";
          }
        }
        break;
      case "deadline":
        if (value) {
          const deadlineDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (deadlineDate < today) {
            newErrors.deadline = "Дата не може бути в минулому";
          } else {
            const oneYearFromNow = new Date();
            oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
            if (deadlineDate > oneYearFromNow) {
              newErrors.deadline = "Дата не може бути більше ніж через рік";
            }
          }
        }
        break;
    }

    // Update errors for this field
    setErrors((prev) => {
      const updated = { ...prev };
      if (newErrors[name]) {
        updated[name] = newErrors[name];
      } else {
        delete updated[name];
      }
      return updated;
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate field in real-time
    validateField(name, value);
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate category field
    if (name === "category") {
      if (!value) {
        setErrors((prev) => ({
          ...prev,
          category: "Оберіть категорію зі списку",
        }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.category;
          return newErrors;
        });
      }
    } else {
      // Clear error for other fields when user makes selection
      if (errors[name]) {
        clearError(name);
      }
    }
  };

  const handleSkillsChange = (skills: string[]) => {
    setFormData((prev) => ({
      ...prev,
      skills: skills,
    }));

    // Validate skills field
    if (skills.length > 20) {
      setErrors((prev) => ({
        ...prev,
        skills: `Занадто багато навичок. Максимум 20 (зараз: ${skills.length})`,
      }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.skills;
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Clear previous errors
    setErrors({});
    setGeneralError("");

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = "Введіть назву завдання";
    } else if (formData.title.trim().length < 10) {
      newErrors.title = `Назва занадто коротка. Мінімум 10 символів (зараз: ${
        formData.title.trim().length
      })`;
    } else if (formData.title.trim().length > 200) {
      newErrors.title = `Назва занадто довга. Максимум 200 символів (зараз: ${
        formData.title.trim().length
      })`;
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = "Введіть опис завдання";
    } else if (formData.description.trim().length < 50) {
      newErrors.description = `Опис занадто короткий. Мінімум 50 символів (зараз: ${
        formData.description.trim().length
      })`;
    } else if (formData.description.trim().length > 5000) {
      newErrors.description = `Опис занадто довгий. Максимум 5000 символів (зараз: ${
        formData.description.trim().length
      })`;
    }

    // Budget validation
    if (!formData.budget.trim()) {
      newErrors.budget = "Введіть бюджет завдання";
    } else {
      const budget = parseFloat(formData.budget);
      if (isNaN(budget)) {
        newErrors.budget = "Бюджет повинен бути числом (наприклад: 10000)";
      } else if (budget <= 0) {
        newErrors.budget = "Бюджет повинен бути більше 0";
      } else if (budget < 100) {
        newErrors.budget = "Мінімальний бюджет: 100 ₴";
      } else if (budget > 1000000) {
        newErrors.budget = "Максимальний бюджет: 1,000,000 ₴";
      }
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = "Оберіть категорію зі списку";
    }

    // Deadline validation (if provided)
    if (formData.deadline) {
      const deadlineDate = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (deadlineDate < today) {
        newErrors.deadline = "Дата не може бути в минулому";
      } else {
        // Check if deadline is too far in the future (more than 1 year)
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        if (deadlineDate > oneYearFromNow) {
          newErrors.deadline = "Дата не може бути більше ніж через рік";
        }
      }
    }

    // Skills validation (optional but if provided, check length)
    if (formData.skills.length > 20) {
      newErrors.skills = `Занадто багато навичок. Максимум 20 (зараз: ${formData.skills.length})`;
    }

    setErrors(newErrors);

    // If there are errors, scroll to the first one
    if (Object.keys(newErrors).length > 0) {
      setTimeout(() => {
        scrollToFirstError();
      }, 100);
    }

    return Object.keys(newErrors).length === 0;
  };

  const clearError = (field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const clearGeneralError = () => {
    setGeneralError("");
  };

  const scrollToFirstError = () => {
    const errorFields = Object.keys(errors);
    if (errorFields.length > 0) {
      const firstErrorField = errorFields[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        // Focus the element after scrolling
        setTimeout(() => {
          element.focus();
        }, 500);
      }
    }
  };

  const getInteractiveSuggestions = () => {
    const suggestions = [
      {
        id: "basic_info",
        text: "Основна інформація: назва, опис та категорія",
        completed:
          formData.title.trim().length > 10 &&
          formData.description.trim().length > 50 &&
          formData.category.length > 0,
      },
      {
        id: "budget_timeline",
        text: "Бюджет та терміни: сума та тривалість проєкту",
        completed:
          formData.budget &&
          parseFloat(formData.budget) > 0 &&
          formData.estimated_duration.length > 0,
      },
      {
        id: "skills_requirements",
        text: "Навички та вимоги: необхідні навички та таланти (опціонально)",
        completed: true, // Skills are optional
      },
      {
        id: "project_details",
        text: "Деталі проекту: тип проекту (опціонально)",
        completed: true, // Project type is optional
      },
      {
        id: "review",
        text: "Перевірка: перегляньте всі поля перед публікацією",
        completed:
          formData.title.trim().length > 10 &&
          formData.description.trim().length > 50 &&
          formData.budget &&
          parseFloat(formData.budget) > 0 &&
          formData.category.length > 0,
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
    const isValid = suggestions.every((s) => s.completed);
    console.log("Form validation:", { suggestions, isValid });
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submission started");

    if (!user) {
      setGeneralError("Будь ласка, увійдіть в систему");
      return;
    }

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setGeneralError("");

    try {
      const budget = parseFloat(formData.budget);

      // Validate form data before submission
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        budget: budget,
        client_id: user.id,
        created_by: user.id,
        status: "open" as const,
        category: formData.category || null,
        skills_required: formData.skills.length > 0 ? formData.skills : null,
        project_type: formData.project_type
          ? mapProjectTypeToDb(formData.project_type)
          : null,
        estimated_duration: formData.estimated_duration || null,
        deadline: formData.deadline || null,
      };

      console.log("Submitting task data:", taskData);

      // Additional validation before sending to Supabase
      if (!taskData.title || taskData.title.length < 10) {
        setGeneralError("Назва проєкту повинна містити мінімум 10 символів");
        return;
      }

      if (!taskData.description || taskData.description.length < 50) {
        setGeneralError("Опис проєкту повинен містити мінімум 50 символів");
        return;
      }

      if (!taskData.budget || taskData.budget < 100) {
        setGeneralError("Бюджет повинен бути мінімум 100 ₴");
        return;
      }

      if (!taskData.category) {
        setGeneralError("Оберіть категорію завдання");
        return;
      }

      if (!taskData.client_id) {
        setGeneralError("Помилка авторизації. Перезавантажте сторінку");
        return;
      }

      // Validate Supabase configuration before making the call
      if (!isSupabaseConfigured()) {
        console.error("Supabase not configured properly");
        setGeneralError(
          "Помилка конфігурації системи. Зверніться до підтримки."
        );
        return;
      }

      console.log("Attempting to insert task with data:", taskData);

      let data, error;
      try {
        const result = await supabase
          .from("tasks")
          .insert(taskData)
          .select()
          .single();

        data = result.data;
        error = result.error;
      } catch (catchError) {
        console.error(
          "Unexpected error during database operation:",
          catchError
        );
        setGeneralError(
          "Неочікувана помилка. Спробуйте ще раз або зверніться до підтримки."
        );
        return;
      }

      if (error) {
        console.error("Supabase error:", error);
        console.error("Error type:", typeof error);
        console.error("Error constructor:", error.constructor.name);
        console.error("Error keys:", Object.keys(error));
        console.error("Error stringified:", JSON.stringify(error, null, 2));
        console.error("Error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          data: taskData,
        });

        // More specific error messages based on error codes
        let errorMessage = "Помилка при створенні завдання. Спробуйте ще раз.";

        // Check if error has meaningful content
        if (!error.code && !error.message && !error.details && !error.hint) {
          // Empty error object - likely a network or connection issue
          console.error("Empty error object detected - possible network issue");
          errorMessage =
            "Проблема з підключенням до сервера. Перевірте інтернет-з'єднання та спробуйте ще раз.";
        } else {
          switch (error.code) {
            case "23505": // Unique constraint violation
              errorMessage =
                "Завдання з такою назвою вже існує. Спробуйте іншу назву.";
              break;
            case "23503": // Foreign key constraint violation
              errorMessage =
                "Помилка з даними користувача. Перезавантажте сторінку та спробуйте ще раз.";
              break;
            case "23502": // Not null constraint violation
              errorMessage = "Будь ласка, заповніть всі обов'язкові поля.";
              break;
            case "23514": // Check constraint violation
              errorMessage =
                "Дані не відповідають вимогам системи. Перевірте формат введених даних.";
              break;
            case "PGRST116": // Row level security
              errorMessage =
                "Недостатньо прав для створення завдання. Перевірте свій профіль.";
              break;
            default:
              if (error.message && error.message.includes("duplicate key")) {
                errorMessage =
                  "Завдання з такою назвою вже існує. Спробуйте іншу назву.";
              } else if (
                error.message &&
                error.message.includes("foreign key")
              ) {
                errorMessage =
                  "Помилка з даними користувача. Перезавантажте сторінку та спробуйте ще раз.";
              } else if (error.message && error.message.includes("not null")) {
                errorMessage = "Будь ласка, заповніть всі обов'язкові поля.";
              } else if (
                error.message &&
                error.message.includes("check constraint")
              ) {
                errorMessage =
                  "Дані не відповідають вимогам системи. Перевірте формат введених даних.";
              } else if (error.message) {
                // Show the actual error message if available
                errorMessage = `Помилка: ${error.message}`;
              }
          }
        }

        setGeneralError(errorMessage);
        return;
      }

      // Verify data was successfully inserted
      if (!data || !data.id) {
        console.error("No data returned from insert operation:", {
          data,
          error,
        });
        setGeneralError("Завдання не було створено. Спробуйте ще раз.");
        return;
      }

      console.log("Task created successfully:", data);

      // Success - redirect to task page
      router.push(`/tasks/${data.id}`);
    } catch (error) {
      console.error("Unexpected error creating task:", error);

      let errorMessage = "Помилка при створенні завдання. Спробуйте ще раз.";

      if (error instanceof Error) {
        if (
          error.message.includes("Network") ||
          error.message.includes("fetch")
        ) {
          errorMessage =
            "Проблема з мережею. Перевірте підключення до інтернету.";
        } else if (error.message.includes("timeout")) {
          errorMessage = "Час очікування вичерпано. Спробуйте ще раз.";
        } else if (error.message.includes("JSON")) {
          errorMessage = "Помилка обробки даних. Спробуйте ще раз.";
        }
      }

      setGeneralError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <CardTitle>Доступ обмежено</CardTitle>
            <CardDescription>
              Для створення завдання необхідно увійти в систему
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 justify-center">
              <Button asChild>
                <Link href="/auth/login">Увійти</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/auth/register">Реєстрація</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user is a freelancer trying to create a task
  if (profile && profile.role === "freelancer") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-lg mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-red-600">Доступ обмежено</CardTitle>
            <CardDescription>
              Фрілансери не можуть створювати завдання. Для створення завдання
              потрібен профіль клієнта.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                Як створити завдання?
              </h3>
              <p className="text-sm text-blue-800">
                Вам потрібно переключитися на профіль клієнта або
                зареєструватися як клієнт.
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button asChild>
                <Link href="/profile">Змінити профіль</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/catalog/tasks">Переглянути завдання</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <div className="py-12 px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 font-['Geologica']">
            Створити проєкт
          </h1>
          <p className="text-muted-foreground font-['Geologica']">
            Опишіть ваш проєкт детально, щоб привабити найкращих умільців
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100"></div>

      {/* General Error Banner */}
      {generalError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 my-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-red-700 font-['Geologica']">
                {generalError}
              </p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  onClick={clearGeneralError}
                  className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                >
                  <span className="sr-only">Закрити</span>
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <form id="create-task-form" onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className="py-12 px-6">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-2 font-['Geologica']">
                Основна інформація
              </h2>
              <p className="text-muted-foreground font-['Geologica']">
                Заповніть основні деталі вашого завдання
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="font-['Geologica']">
                  Назва проєкту <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Наприклад: Створення лендінг-сторінки для інтернет-магазину"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className={
                    errors.title
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }
                />
                {errors.title && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-['Geologica']">{errors.title}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="font-['Geologica']">
                  Опис проєкту <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Детально опишіть, що потрібно зробити, які технології використовувати, терміни виконання тощо..."
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={6}
                  required
                  className={
                    errors.description
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }
                />
                {errors.description && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-['Geologica']">
                      {errors.description}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="font-['Geologica'] text-base font-medium">
                    Категорія <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex flex-wrap gap-3">
                    {categories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => handleSelectChange("category", category)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 font-['Geologica'] ${
                          formData.category === category
                            ? "bg-gray-600 text-white shadow-sm"
                            : errors.category
                            ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-300"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                  {errors.category && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-['Geologica']">
                        {errors.category}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="font-['Geologica'] text-base font-medium">
                    Тип проекту
                  </Label>
                  <div className="flex flex-wrap gap-3">
                    {projectTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleSelectChange("project_type", type)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 font-['Geologica'] ${
                          formData.project_type === type
                            ? "bg-gray-600 text-white shadow-sm"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100"></div>

        {/* Budget and Timeline */}
        <div className="py-12 px-6">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-2 font-['Geologica']">
                Бюджет та терміни проєкту
              </h2>
              <p className="text-muted-foreground font-['Geologica']">
                {formData.project_type === "Погодинна співпраця"
                  ? "Вкажіть погодинну ставку та терміни співпраці"
                  : "Вкажіть бюджет та терміни виконання проєкту"}
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="budget" className="font-['Geologica']">
                  {formData.project_type === "Погодинна співпраця"
                    ? "Погодинна ставка (₴/год)"
                    : "Бюджет (₴)"}{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="budget"
                  name="budget"
                  type="number"
                  placeholder={
                    formData.project_type === "Погодинна співпраця"
                      ? "500"
                      : "10000"
                  }
                  value={formData.budget}
                  onChange={handleInputChange}
                  min="1"
                  step="1"
                  required
                  className={
                    errors.budget
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }
                />
                {errors.budget && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-['Geologica']">{errors.budget}</span>
                  </div>
                )}
                <p className="text-sm text-muted-foreground font-['Geologica']">
                  {formData.project_type === "Погодинна співпраця"
                    ? "Вкажіть погодинну ставку в гривнях. Фрілансери будуть виставляти рахунки за фактично відпрацьований час."
                    : "Вкажіть суму в гривнях. Це допоможе фрілансерам зрозуміти масштаб завдання."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deadline" className="font-['Geologica']">
                    {formData.project_type === "Погодинна співпраця"
                      ? "Дата початку співпраці"
                      : "Термін виконання"}
                  </Label>
                  <Input
                    id="deadline"
                    name="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    className={
                      errors.deadline
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : ""
                    }
                  />
                  {errors.deadline && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-['Geologica']">
                        {errors.deadline}
                      </span>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground font-['Geologica']">
                    {formData.project_type === "Погодинна співпраця"
                      ? "Вкажіть дату, коли потрібно розпочати співпрацю"
                      : "Вкажіть дату, до якої потрібно завершити проект"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="estimated_duration"
                    className="font-['Geologica']"
                  >
                    {formData.project_type === "Погодинна співпраця"
                      ? "Орієнтовна кількість годин"
                      : "Орієнтовна тривалість"}
                  </Label>
                  <Select
                    value={formData.estimated_duration}
                    onValueChange={(value) =>
                      handleSelectChange("estimated_duration", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          formData.project_type === "Погодинна співпраця"
                            ? "Оберіть кількість годин"
                            : "Оберіть тривалість"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.project_type === "Погодинна співпраця" ? (
                        <>
                          <SelectItem value="1-5 годин">1-5 годин</SelectItem>
                          <SelectItem value="5-10 годин">5-10 годин</SelectItem>
                          <SelectItem value="10-20 годин">
                            10-20 годин
                          </SelectItem>
                          <SelectItem value="20-40 годин">
                            20-40 годин
                          </SelectItem>
                          <SelectItem value="40+ годин">40+ годин</SelectItem>
                          <SelectItem value="Постійна співпраця">
                            Постійна співпраця
                          </SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="1-3 дні">1-3 дні</SelectItem>
                          <SelectItem value="1 тиждень">1 тиждень</SelectItem>
                          <SelectItem value="2-3 тижні">2-3 тижні</SelectItem>
                          <SelectItem value="1 місяць">1 місяць</SelectItem>
                          <SelectItem value="2-3 місяці">2-3 місяці</SelectItem>
                          <SelectItem value="Більше 3 місяців">
                            Більше 3 місяців
                          </SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100"></div>

        {/* Skills and Requirements */}
        <div className="py-12 px-6">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-2 font-['Geologica']">
                Навички та таланти
              </h2>
              <p className="text-muted-foreground font-['Geologica']">
                Вкажіть необхідні навички та рівень досвіду
              </p>
            </div>
            <div className="space-y-4">
              <AppleSkillsSelector
                categories={skillCategories}
                selectedItems={formData.skills}
                onSelectionChange={handleSkillsChange}
                maxSelections={10}
                allowCustom={true}
                customPlaceholder="Додати власну навичку"
              />
              {errors.skills && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-['Geologica']">{errors.skills}</span>
                </div>
              )}
            </div>
          </div>
        </div>

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
                    Прогрес створення завдання
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
                  Чек-лист для створення завдання
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
              <Button
                type="submit"
                form="create-task-form"
                className="w-full sm:w-auto sm:mx-auto h-12 px-8 font-['Geologica'] bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                disabled={isSubmitting || !isFormValid()}
              >
                {isSubmitting ? "Публікація..." : "Опублікувати завдання"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
