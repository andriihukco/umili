"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

interface RegistrationCTACardProps {
  onCardClick: () => void;
}

export function RegistrationCTACard({ onCardClick }: RegistrationCTACardProps) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      // Navigate to register page with email and freelancer role predefined
      const params = new URLSearchParams({
        email: email.trim(),
        role: "freelancer",
      });
      window.location.href = `/auth/register?${params.toString()}`;
    }
  };

  return (
    <Card className="bg-white border border-gray-200 hover:border-gray-300 transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="space-y-3">
          {/* Main Title */}
          <div>
            <CardTitle className="text-xl font-bold text-gray-900 leading-tight">
              Зареєструйтеся для доступу
            </CardTitle>
            <p className="text-sm font-medium text-gray-600 mt-1">
              Створіть акаунт виконавця
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Description */}
          <div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Введіть вашу електронну пошту, щоб створити акаунт виконавця та
              отримати повний доступ до платформи
            </p>
          </div>

          {/* Email Input Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                required
              />
              <Button
                type="submit"
                size="sm"
                className="bg-gray-900 hover:bg-gray-800 text-white px-3"
                disabled={!email.trim()}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {/* Benefits */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs">
                ✅
              </div>
              <span>Повний доступ до всіх завдань</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs">
                💼
              </div>
              <span>Подача заявок на завдання</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs">
                ⭐
              </div>
              <span>Каталог фрілансерів</span>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-xs text-gray-500">
              Безкоштовно • Займає 2 хвилини
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
