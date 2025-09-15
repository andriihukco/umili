"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ChatTestimonials } from "@/components/ui/chat-testimonials";
import { SkillsDrilldown } from "@/components/ui/skills-drilldown";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

type UserType = "умілець" | "client";

export default function Home() {
  const { user, profile, isLoading } = useAppStore();
  const router = useRouter();
  const [userType, setUserType] = useState<UserType>("умілець");
  const [email, setEmail] = useState("");

  // Redirect authenticated users to their appropriate dashboards
  useEffect(() => {
    if (!isLoading && user && profile) {
      if (profile.role === "admin") {
        router.push("/admin/dashboard");
      } else if (profile.role === "client") {
        router.push("/client-jobs");
      } else if (profile.role === "freelancer") {
        router.push("/dashboard");
      }
    }
  }, [isLoading, user, profile, router]);

  const handleEmailSubmit = () => {
    if (email && email.includes("@")) {
      window.location.href = `/auth/register?role=${userType}&email=${encodeURIComponent(
        email
      )}`;
    }
  };

  // Show loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Show loading while redirecting authenticated users
  if (user && profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-gray-600 mt-4">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show landing page for guests
  return (
    <div className="min-h-screen">
      {/* Hero Section - Compact Above Fold */}
      <section className="relative py-20 bg-white min-h-screen flex items-center">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            {/* User Type Switcher */}
            <div className="mb-12">
              <div className="inline-flex bg-gray-100 rounded-full p-1">
                <button
                  onClick={() => setUserType("умілець")}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                    userType === "умілець"
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

            {/* Dynamic Content Based on User Type */}
            {userType === "умілець" ? (
              <>
                <h1 className="text-4xl md:text-6xl font-light mb-6 text-black leading-tight tracking-tight">
                  Знайдіть ідеальну роботу для своїх талантів
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 mb-12 font-light">
                  Приєднуйтесь до найкращих умільців України
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                  <Button size="lg" asChild className="text-lg px-8 py-6">
                    <Link href="/auth/register?role=умілець">
                      Створити профіль умільця
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="text-lg px-8 py-6"
                  >
                    <Link href="/catalog/tasks">Переглянути вакансії</Link>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-4xl md:text-6xl font-light mb-6 text-black leading-tight tracking-tight">
                  Знайдіть найкращих спеціалістів для свого проєкту
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 mb-12 font-light">
                  З&apos;єднайтесь з професійними умільцями
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                  <Button size="lg" asChild className="text-lg px-8 py-6">
                    <Link href="/auth/register?role=client">
                      Створити профіль клієнта
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="text-lg px-8 py-6"
                  >
                    <Link href="/catalog/freelancers">
                      Переглянути умільців
                    </Link>
                  </Button>
                </div>
              </>
            )}

            {/* Trust Indicators - Dynamic based on user type */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {userType === "умілець" ? (
                // Stats for умільці
                <>
                  <div className="p-6 text-center">
                    <div className="text-3xl font-light text-black mb-1">
                      ₴850+
                    </div>
                    <div className="text-sm text-gray-600 font-light">
                      Середня ставка/год
                    </div>
                  </div>
                  <div className="p-6 text-center">
                    <div className="text-3xl font-light text-black mb-1">
                      95%
                    </div>
                    <div className="text-sm text-gray-600 font-light">
                      Швидкість оплати
                    </div>
                  </div>
                  <div className="p-6 text-center">
                    <div className="text-3xl font-light text-black mb-1">
                      1,250+
                    </div>
                    <div className="text-sm text-gray-600 font-light">
                      Активних умільців
                    </div>
                  </div>
                  <div className="p-6 text-center">
                    <div className="text-3xl font-light text-black mb-1">
                      ₴2.5M+
                    </div>
                    <div className="text-sm text-gray-600 font-light">
                      Виплачено умільцям
                    </div>
                  </div>
                </>
              ) : (
                // Stats for clients
                <>
                  <div className="p-6 text-center">
                    <div className="text-3xl font-light text-black mb-1">
                      3,500+
                    </div>
                    <div className="text-sm text-gray-600 font-light">
                      Успішних проєктів
                    </div>
                  </div>
                  <div className="p-6 text-center">
                    <div className="text-3xl font-light text-black mb-1">
                      24ч
                    </div>
                    <div className="text-sm text-gray-600 font-light">
                      Середній час відгуку
                    </div>
                  </div>
                  <div className="p-6 text-center">
                    <div className="text-3xl font-light text-black mb-1">
                      850+
                    </div>
                    <div className="text-sm text-gray-600 font-light">
                      Задоволених клієнтів
                    </div>
                  </div>
                  <div className="p-6 text-center">
                    <div className="text-3xl font-light text-black mb-1">
                      ₴2.5M+
                    </div>
                    <div className="text-sm text-gray-600 font-light">
                      Обсяг транзакцій
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section - Solid Dark */}
      <section className="py-24 bg-black text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light mb-8">
              {userType === "умілець"
                ? "Набридли низькооплачувані проєкти?"
                : "Набридли неякісні виконавці?"}
            </h2>
            <p className="text-xl text-gray-300 font-light leading-relaxed">
              {userType === "умілець"
                ? "Більшість платформ пропонують роботу за копійки"
                : "Більшість платформ не перевіряють якість виконавців"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="text-center p-8">
              <div className="text-6xl mb-6">❌</div>
              <h3 className="text-xl font-light mb-4">
                {userType === "умілець" ? "Низькі ставки" : "Низька якість"}
              </h3>
              <p className="text-gray-300 font-light leading-relaxed">
                {userType === "умілець"
                  ? "Конкуренція з дешевими виконавцями, гонка за ціною"
                  : "Непрофесійні виконавці, погана комунікація, затримки"}
              </p>
            </div>

            <div className="text-center p-8">
              <div className="text-6xl mb-6">💰</div>
              <h3 className="text-xl font-light mb-4">
                {userType === "умілець"
                  ? "Проблеми з оплатою"
                  : "Ризик втрати коштів"}
              </h3>
              <p className="text-gray-300 font-light leading-relaxed">
                {userType === "умілець"
                  ? "Затримки виплат, недоплати, проблеми з клієнтами"
                  : "Відсутність гарантій, шахрайство, проблеми з виплатами"}
              </p>
            </div>

            <div className="text-center p-8">
              <div className="text-6xl mb-6">⏰</div>
              <h3 className="text-xl font-light mb-4">
                {userType === "умілець"
                  ? "Втрата часу"
                  : "Втрата часу та нервів"}
              </h3>
              <p className="text-gray-300 font-light leading-relaxed">
                {userType === "умілець"
                  ? "Довгий пошук роботи, невідповідність вимогам"
                  : "Довгий пошук, невідповідність вимогам, конфлікти"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section - White Slide */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light mb-8 text-black">
              Umili — платформа нового покоління
            </h2>
            <p className="text-xl text-gray-600 font-light leading-relaxed">
              {userType === "умілець"
                ? "Ми створили екосистему для професіоналів, які цінують якість"
                : "Ми створили екосистему для клієнтів, які шукають найкращих"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center p-8">
              <div className="text-6xl mb-6">✅</div>
              <h3 className="text-xl font-light mb-4 text-black">
                {userType === "умілець"
                  ? "Тільки якісні проєкти"
                  : "Тільки верифіковані професіонали"}
              </h3>
              <p className="text-gray-600 font-light leading-relaxed">
                {userType === "умілець"
                  ? "Перевірені клієнти з хорошими бюджетами та чіткими вимогами"
                  : "Всі виконавці проходять ретельну перевірку портфоліо та навичок"}
              </p>
            </div>

            <div className="text-center p-8">
              <div className="text-6xl mb-6">💼</div>
              <h3 className="text-xl font-light mb-4 text-black">
                Ескроу-платежі скоро
              </h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Безпечна система ескроу-платежів буде доступна найближчим часом
                для захисту ваших інтересів
              </p>
            </div>

            <div className="text-center p-8">
              <div className="text-6xl mb-6">👥</div>
              <h3 className="text-xl font-light mb-4 text-black">
                {userType === "умілець"
                  ? "Швидкий пошук роботи"
                  : "Швидкий та точний пошук"}
              </h3>
              <p className="text-gray-600 font-light leading-relaxed">
                {userType === "умілець"
                  ? "Розумна система підбору знаходить ідеальні проєкти за лічені хвилини"
                  : "Розумна система підбору знаходить ідеальних кандидатів за лічені хвилини"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section - Apple Style */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light mb-8 text-black">
              Чому Umili краща за конкурентів?
            </h2>
            <p className="text-xl text-gray-600 font-light">
              Порівняйте переваги нашої платформи з іншими біржами умільців
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Table Header - Desktop */}
            <div className="hidden md:grid grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                {/* Empty space for function column */}
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <svg
                    width="60"
                    height="20"
                    viewBox="0 0 296 92"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_1_91)">
                      <path
                        d="M270 10.0001V52.0001C270 57.523 274.477 62.0001 280 62.0001C285.523 62.0001 290 57.523 290 52.0001V10.0001C290 4.47728 285.523 0.00012207 280 0.00012207C274.477 0.00012207 270 4.47728 270 10.0001Z"
                        fill="#EE82EE"
                      />
                      <path
                        d="M240 10.0001V52.0001C240 74.0915 257.909 92.0001 280 92.0001H286C291.523 92.0001 296 87.523 296 82.0001C296 76.4773 291.523 72.0001 286 72.0001H280C268.954 72.0001 260 63.0458 260 52.0001V10.0001C260 4.47727 255.523 0.00012207 250 0.00012207C244.477 0.00012207 240 4.47727 240 10.0001Z"
                        fill="#008000"
                      />
                      <path
                        d="M210 10.0001V82.0001C210 87.523 214.477 92.0001 220 92.0001C225.523 92.0001 230 87.523 230 82.0001V10.0001C230 4.47727 225.523 0.00012207 220 0.00012207C214.477 0.00012207 210 4.47727 210 10.0001Z"
                        fill="#FFA500"
                      />
                      <path
                        d="M140 37.5732C140 33.8224 141.49 30.2253 144.143 27.5732L145.857 25.8573C153.668 18.0468 166.332 18.0468 174.143 25.8573C177.893 29.608 180 35.6957 180 40.9999V81.5732C180 87.096 184.477 91.5732 190 91.5732C195.523 91.5732 200 87.096 200 81.5732V40.9999C200 30.3913 195.786 19.2172 188.284 11.7157C172.663 -3.90524 147.337 -3.90524 131.716 11.7157L130 13.4306C123.597 19.8335 120 28.5181 120 37.5732C120 43.096 124.477 47.5732 130 47.5732C135.523 47.5732 140 43.096 140 37.5732Z"
                        fill="#040462"
                      />
                      <path
                        d="M140 37.5732C140 33.8224 141.49 30.2253 144.143 27.5732L145.857 25.8573C153.668 18.0468 166.332 18.0468 174.143 25.8573C177.893 29.608 180 35.6957 180 40.9999V81.5732C180 87.096 184.477 91.5732 190 91.5732C195.523 91.5732 200 87.096 200 81.5732V40.9999C200 30.3913 195.786 19.2172 188.284 11.7157C172.663 -3.90524 147.337 -3.90524 131.716 11.7157L130 13.4306C123.597 19.8335 120 28.5181 120 37.5732C120 43.096 124.477 47.5732 130 47.5732C135.523 47.5732 140 43.096 140 37.5732Z"
                        fill="url(#paint0_linear_1_91)"
                        style={{ mixBlendMode: "hard-light" }}
                      />
                      <path
                        d="M140 37.5732C140 33.8224 141.49 30.2253 144.143 27.5732L145.857 25.8573C153.668 18.0468 166.332 18.0468 174.143 25.8573C177.893 29.608 180 35.6957 180 40.9999V81.5732C180 87.096 184.477 91.5732 190 91.5732C195.523 91.5732 200 87.096 200 81.5732V40.9999C200 30.3913 195.786 19.2172 188.284 11.7157C172.663 -3.90524 147.337 -3.90524 131.716 11.7157L130 13.4306C123.597 19.8335 120 28.5181 120 37.5732C120 43.096 124.477 47.5732 130 47.5732C135.523 47.5732 140 43.096 140 37.5732Z"
                        fill="url(#paint1_linear_1_91)"
                        style={{ mixBlendMode: "hard-light" }}
                      />
                      <path
                        d="M120 37.5732C120 32.0503 124.477 27.5732 130 27.5732C135.523 27.5732 140 32.0503 140 37.5732C140 37.8913 140.057 38.5294 140.271 39.2792C140.482 40.015 140.78 40.6399 141.115 41.1054C141.424 41.5345 141.761 41.8305 142.179 42.0458C142.588 42.257 143.428 42.5732 145 42.5732C146.572 42.5732 147.412 42.257 147.821 42.0458C148.239 41.8305 148.576 41.5345 148.885 41.1054C149.22 40.6399 149.518 40.015 149.729 39.2792C149.943 38.5294 150 37.8913 150 37.5732C150 33.8224 148.51 30.2253 145.857 27.5732L144.143 25.8573C136.332 18.0468 123.668 18.0468 115.857 25.8573C112.107 29.608 110 35.6957 110 40.9999V81.5732C110 87.096 105.523 91.5732 100 91.5732C94.4772 91.5732 90 87.096 90 81.5732V40.9999C90 30.3913 94.2145 19.2172 101.716 11.7157C117.337 -3.90524 142.663 -3.90524 158.284 11.7157L160 13.4306C166.403 19.8335 170 28.5181 170 37.5732C170 41.6733 168.852 47.6009 165.115 52.7909C161.011 58.4909 154.259 62.5732 145 62.5732C135.741 62.5732 128.989 58.4909 124.885 52.7909C121.148 47.6009 120 41.6733 120 37.5732Z"
                        fill="#040462"
                      />
                      <path
                        d="M60 10.0001V51.5733C60 56.8776 57.8932 61.9652 54.1426 65.7159C46.3321 73.5264 33.6679 73.5264 25.8574 65.7159C22.1068 61.9652 20 56.8776 20 51.5733V10.0001C20 4.47724 15.5228 9.15527e-05 10 9.15527e-05C4.47715 9.15527e-05 0 4.47724 0 10.0001V51.5733C0 62.1819 4.21448 72.3561 11.7158 79.8575C27.3368 95.4785 52.6632 95.4785 68.2842 79.8575C75.7855 72.3561 80 62.1819 80 51.5733V10.0001C80 4.47724 75.5229 9.15527e-05 70 9.15527e-05C64.4771 9.15527e-05 60 4.47724 60 10.0001Z"
                        fill="#FF0000"
                      />
                    </g>
                    <defs>
                      <linearGradient
                        id="paint0_linear_1_91"
                        x1="248.5"
                        y1="32.5731"
                        x2="118.5"
                        y2="55"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#0000FF" />
                        <stop offset="1" stopColor="#040448" />
                      </linearGradient>
                      <linearGradient
                        id="paint1_linear_1_91"
                        x1="248.5"
                        y1="32.5731"
                        x2="118.5"
                        y2="55"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#0000FF" />
                        <stop offset="1" stopColor="#040448" />
                      </linearGradient>
                      <clipPath id="clip0_1_91">
                        <rect width="296" height="92.0001" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                <div className="text-sm text-gray-600">Наша платформа</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-400 mb-2">
                  Конкуренти
                </div>
                <div className="text-sm text-gray-500">Інші біржі</div>
              </div>
            </div>

            {/* Mobile Header */}
            <div className="md:hidden mb-8">
              <div className="grid grid-cols-2 gap-4 py-4 px-6">
                <div className="text-center flex flex-col justify-end">
                  <div className="flex justify-center items-center mb-2 h-8">
                    <svg
                      width="80"
                      height="28"
                      viewBox="0 0 296 92"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clipPath="url(#clip0_1_91)">
                        <path
                          d="M270 10.0001V52.0001C270 57.523 274.477 62.0001 280 62.0001C285.523 62.0001 290 57.523 290 52.0001V10.0001C290 4.47728 285.523 0.00012207 280 0.00012207C274.477 0.00012207 270 4.47728 270 10.0001Z"
                          fill="#EE82EE"
                        />
                        <path
                          d="M240 10.0001V52.0001C240 74.0915 257.909 92.0001 280 92.0001H286C291.523 92.0001 296 87.523 296 82.0001C296 76.4773 291.523 72.0001 286 72.0001H280C268.954 72.0001 260 63.0458 260 52.0001V10.0001C260 4.47727 255.523 0.00012207 250 0.00012207C244.477 0.00012207 240 4.47727 240 10.0001Z"
                          fill="#008000"
                        />
                        <path
                          d="M210 10.0001V82.0001C210 87.523 214.477 92.0001 220 92.0001C225.523 92.0001 230 87.523 230 82.0001V10.0001C230 4.47727 225.523 0.00012207 220 0.00012207C214.477 0.00012207 210 4.47727 210 10.0001Z"
                          fill="#FFA500"
                        />
                        <path
                          d="M140 37.5732C140 33.8224 141.49 30.2253 144.143 27.5732L145.857 25.8573C153.668 18.0468 166.332 18.0468 174.143 25.8573C177.893 29.608 180 35.6957 180 40.9999V81.5732C180 87.096 184.477 91.5732 190 91.5732C195.523 91.5732 200 87.096 200 81.5732V40.9999C200 30.3913 195.786 19.2172 188.284 11.7157C172.663 -3.90524 147.337 -3.90524 131.716 11.7157L130 13.4306C123.597 19.8335 120 28.5181 120 37.5732C120 43.096 124.477 47.5732 130 47.5732C135.523 47.5732 140 43.096 140 37.5732Z"
                          fill="#040462"
                        />
                        <path
                          d="M140 37.5732C140 33.8224 141.49 30.2253 144.143 27.5732L145.857 25.8573C153.668 18.0468 166.332 18.0468 174.143 25.8573C177.893 29.608 180 35.6957 180 40.9999V81.5732C180 87.096 184.477 91.5732 190 91.5732C195.523 91.5732 200 87.096 200 81.5732V40.9999C200 30.3913 195.786 19.2172 188.284 11.7157C172.663 -3.90524 147.337 -3.90524 131.716 11.7157L130 13.4306C123.597 19.8335 120 28.5181 120 37.5732C120 43.096 124.477 47.5732 130 47.5732C135.523 47.5732 140 43.096 140 37.5732Z"
                          fill="url(#paint0_linear_1_91)"
                          style={{ mixBlendMode: "hard-light" }}
                        />
                        <path
                          d="M140 37.5732C140 33.8224 141.49 30.2253 144.143 27.5732L145.857 25.8573C153.668 18.0468 166.332 18.0468 174.143 25.8573C177.893 29.608 180 35.6957 180 40.9999V81.5732C180 87.096 184.477 91.5732 190 91.5732C195.523 91.5732 200 87.096 200 81.5732V40.9999C200 30.3913 195.786 19.2172 188.284 11.7157C172.663 -3.90524 147.337 -3.90524 131.716 11.7157L130 13.4306C123.597 19.8335 120 28.5181 120 37.5732C120 43.096 124.477 47.5732 130 47.5732C135.523 47.5732 140 43.096 140 37.5732Z"
                          fill="url(#paint1_linear_1_91)"
                          style={{ mixBlendMode: "hard-light" }}
                        />
                        <path
                          d="M120 37.5732C120 32.0503 124.477 27.5732 130 27.5732C135.523 27.5732 140 32.0503 140 37.5732C140 37.8913 140.057 38.5294 140.271 39.2792C140.482 40.015 140.78 40.6399 141.115 41.1054C141.424 41.5345 141.761 41.8305 142.179 42.0458C142.588 42.257 143.428 42.5732 145 42.5732C146.572 42.5732 147.412 42.257 147.821 42.0458C148.239 41.8305 148.576 41.5345 148.885 41.1054C149.22 40.6399 149.518 40.015 149.729 39.2792C149.943 38.5294 150 37.8913 150 37.5732C150 33.8224 148.51 30.2253 145.857 27.5732L144.143 25.8573C136.332 18.0468 123.668 18.0468 115.857 25.8573C112.107 29.608 110 35.6957 110 40.9999V81.5732C110 87.096 105.523 91.5732 100 91.5732C94.4772 91.5732 90 87.096 90 81.5732V40.9999C90 30.3913 94.2145 19.2172 101.716 11.7157C117.337 -3.90524 142.663 -3.90524 158.284 11.7157L160 13.4306C166.403 19.8335 170 28.5181 170 37.5732C170 41.6733 168.852 47.6009 165.115 52.7909C161.011 58.4909 154.259 62.5732 145 62.5732C135.741 62.5732 128.989 58.4909 124.885 52.7909C121.148 47.6009 120 41.6733 120 37.5732Z"
                          fill="#040462"
                        />
                        <path
                          d="M60 10.0001V51.5733C60 56.8776 57.8932 61.9652 54.1426 65.7159C46.3321 73.5264 33.6679 73.5264 25.8574 65.7159C22.1068 61.9652 20 56.8776 20 51.5733V10.0001C20 4.47724 15.5228 9.15527e-05 10 9.15527e-05C4.47715 9.15527e-05 0 4.47724 0 10.0001V51.5733C0 62.1819 4.21448 72.3561 11.7158 79.8575C27.3368 95.4785 52.6632 95.4785 68.2842 79.8575C75.7855 72.3561 80 62.1819 80 51.5733V10.0001C80 4.47724 75.5229 9.15527e-05 70 9.15527e-05C64.4771 9.15527e-05 60 4.47724 60 10.0001Z"
                          fill="#FF0000"
                        />
                      </g>
                      <defs>
                        <linearGradient
                          id="paint0_linear_1_91"
                          x1="248.5"
                          y1="32.5731"
                          x2="118.5"
                          y2="55"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#0000FF" />
                          <stop offset="1" stopColor="#040448" />
                        </linearGradient>
                        <linearGradient
                          id="paint1_linear_1_91"
                          x1="248.5"
                          y1="32.5731"
                          x2="118.5"
                          y2="55"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#0000FF" />
                          <stop offset="1" stopColor="#040448" />
                        </linearGradient>
                        <clipPath id="clip0_1_91">
                          <rect width="296" height="92.0001" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                  <div className="text-sm text-gray-600">Наша платформа</div>
                </div>
                <div className="text-center flex flex-col justify-end">
                  <div className="text-lg font-semibold text-gray-400 mb-1 h-8 flex items-center justify-center">
                    Конкуренти
                  </div>
                  <div className="text-sm text-gray-500">Інші біржі</div>
                </div>
              </div>
            </div>

            {/* Table Rows */}
            <div className="space-y-1">
              {/* Desktop Layout */}
              <div className="hidden md:grid grid-cols-3 gap-8 py-6 px-6 rounded-2xl hover:bg-gray-50 transition-colors">
                <div className="text-lg font-medium text-black">
                  {userType === "умілець"
                    ? "Якість проєктів"
                    : "Якість виконавців"}
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-black">
                    {userType === "умілець"
                      ? "Преміум клієнти"
                      : "Верифіковані професіонали"}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {userType === "умілець"
                      ? "Перевірені бюджети"
                      : "Ретельна перевірка"}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-medium text-gray-400">
                    Без перевірки
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Випадкові проєкти
                  </div>
                </div>
              </div>

              {/* Mobile Layout */}
              <div className="md:hidden py-6 px-6 rounded-2xl hover:bg-gray-50 transition-colors">
                <div className="text-lg font-medium text-black mb-4 text-center">
                  {userType === "умілець"
                    ? "Якість проєктів"
                    : "Якість виконавців"}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-sm font-semibold text-black">
                      {userType === "умілець"
                        ? "Преміум клієнти"
                        : "Верифіковані професіонали"}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {userType === "умілець"
                        ? "Перевірені бюджети"
                        : "Ретельна перевірка"}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-400">
                      Без перевірки
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Випадкові проєкти
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:grid grid-cols-3 gap-8 py-6 px-6 rounded-2xl hover:bg-gray-50 transition-colors">
                <div className="text-lg font-medium text-black">
                  Безпека платежів
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-black">
                    Ескроу-система
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    100% гарантія
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-medium text-gray-400">
                    Ризик втрати
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Немає гарантій
                  </div>
                </div>
              </div>

              {/* Mobile Layout */}
              <div className="md:hidden py-6 px-6 rounded-2xl hover:bg-gray-50 transition-colors">
                <div className="text-lg font-medium text-black mb-4 text-center">
                  Безпека платежів
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-sm font-semibold text-black">
                      Ескроу-система
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      100% гарантія
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-400">
                      Ризик втрати
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Немає гарантій
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:grid grid-cols-3 gap-8 py-6 px-6 rounded-2xl hover:bg-gray-50 transition-colors">
                <div className="text-lg font-medium text-black">
                  Підтримка клієнтів
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-black">
                    24/7 українською
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Персональний менеджер
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-medium text-gray-400">
                    Обмежена підтримка
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Тільки email</div>
                </div>
              </div>

              {/* Mobile Layout */}
              <div className="md:hidden py-6 px-6 rounded-2xl hover:bg-gray-50 transition-colors">
                <div className="text-lg font-medium text-black mb-4 text-center">
                  Підтримка клієнтів
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-sm font-semibold text-black">
                      24/7 українською
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Персональний менеджер
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-400">
                      Обмежена підтримка
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Тільки email
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:grid grid-cols-3 gap-8 py-6 px-6 rounded-2xl hover:bg-gray-50 transition-colors">
                <div className="text-lg font-medium text-black">
                  Комісія платформи
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-black">5%</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Найнижча в Україні
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-medium text-gray-400">
                    10-20%
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Високі комісії
                  </div>
                </div>
              </div>

              {/* Mobile Layout */}
              <div className="md:hidden py-6 px-6 rounded-2xl hover:bg-gray-50 transition-colors">
                <div className="text-lg font-medium text-black mb-4 text-center">
                  Комісія платформи
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-sm font-semibold text-black">5%</div>
                    <div className="text-xs text-gray-600 mt-1">
                      Найнижча в Україні
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-400">
                      10-20%
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Високі комісії
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:grid grid-cols-3 gap-8 py-6 px-6 rounded-2xl hover:bg-gray-50 transition-colors">
                <div className="text-lg font-medium text-black">
                  Швидкість пошуку
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-black">
                    AI-підбір
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    За лічені хвилини
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-medium text-gray-400">
                    Ручний пошук
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Години пошуку
                  </div>
                </div>
              </div>

              {/* Mobile Layout */}
              <div className="md:hidden py-6 px-6 rounded-2xl hover:bg-gray-50 transition-colors">
                <div className="text-lg font-medium text-black mb-4 text-center">
                  Швидкість пошуку
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-sm font-semibold text-black">
                      AI-підбір
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      За лічені хвилини
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-400">
                      Ручний пошук
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Години пошуку
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section - Chat Style Testimonials */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light mb-8 text-black">
              {userType === "умілець"
                ? "Історії успіху умільців"
                : "Відгуки наших клієнтів"}
            </h2>
            <p className="text-xl text-gray-600 font-light">
              {userType === "умілець"
                ? "Реальні історії кар'єрного росту та фінансового успіху"
                : "Реальні історії успішних проєктів та задоволених клієнтів"}
            </p>
          </div>

          <ChatTestimonials userType={userType} />
        </div>
      </section>

      {/* Categories Section - Enhanced Bento Grid */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-light mb-8 text-black">
              {userType === "умілець"
                ? "Популярні напрямки роботи"
                : "Популярні категорії проєктів"}
            </h2>
            <p className="text-xl text-gray-600 font-light">
              {userType === "умілець"
                ? "Знайдіть проєкти у своїй сфері експертизи"
                : "Знайдіть спеціалістів для своїх проєктів"}
            </p>
          </div>

          <SkillsDrilldown userType={userType} />
        </div>
      </section>

      {/* Final CTA Section - Enhanced with Email Input */}
      <section className="py-32 bg-gradient-to-br from-black via-gray-900 to-black text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-6xl mb-8">🚀</div>
            <h2 className="text-5xl md:text-6xl font-light mb-8 leading-tight">
              {userType === "умілець"
                ? "Готові розпочати кар&apos;єру мрії?"
                : "Готові знайти ідеальну команду?"}
            </h2>
            <p className="text-2xl text-gray-300 mb-12 font-light leading-relaxed max-w-3xl mx-auto">
              {userType === "умілець"
                ? "Приєднуйтесь до найкращих спеціалістів України та почніть заробляти більше вже сьогодні. Створіть профіль за 2 хвилини та отримайте доступ до преміум проєктів."
                : "Приєднуйтесь до найкращих клієнтів України та знайдіть ідеальних виконавців для своїх проєктів. Створіть профіль за 2 хвилини та отримайте доступ до топових умільців."}
            </p>

            {/* Email Input Section */}
            <div className="max-w-md mx-auto mb-12">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="email"
                  placeholder="Введіть ваш email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 text-lg py-6 px-6 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20 focus:border-white/40"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleEmailSubmit();
                    }
                  }}
                />
                <Button
                  onClick={handleEmailSubmit}
                  disabled={!email || !email.includes("@")}
                  className="text-lg px-8 py-6 bg-white text-black hover:bg-gray-100 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {userType === "умілець"
                    ? "Створити профіль"
                    : "Створити профіль"}
                </Button>
              </div>
              <p className="text-sm text-gray-400 mt-3">
                Безкоштовно • Без спаму • Миттєва реєстрація
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
