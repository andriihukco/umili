"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

interface RegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "task" | "freelancer";
}

export function RegistrationModal({
  open,
  onOpenChange,
  type,
}: RegistrationModalProps) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      // Navigate to register page with email and role predefined
      const role = type === "task" ? "freelancer" : "client";
      const params = new URLSearchParams({
        email: email.trim(),
        role: role,
      });
      window.location.href = `/auth/register?${params.toString()}`;
    }
  };

  const getTitle = () => {
    return type === "task"
      ? "Зареєструйтеся для доступу до завдань"
      : "Зареєструйтеся для доступу до фрілансерів";
  };

  const getSubtitle = () => {
    return type === "task"
      ? "Створіть акаунт виконавця"
      : "Створіть акаунт замовника";
  };

  const getDescription = () => {
    return type === "task"
      ? "Введіть вашу електронну пошту, щоб створити акаунт виконавця та отримати повний доступ до всіх завдань"
      : "Введіть вашу електронну пошту, щоб створити акаунт замовника та отримати повний доступ до каталогу фрілансерів";
  };

  const getBenefits = () => {
    if (type === "task") {
      return [
        { icon: "✅", text: "Повний доступ до всіх завдань" },
        { icon: "💼", text: "Подача заявок на завдання" },
        { icon: "⭐", text: "Каталог фрілансерів" },
      ];
    } else {
      return [
        { icon: "👥", text: "Повний доступ до каталогу фрілансерів" },
        { icon: "📝", text: "Створення завдань" },
        { icon: "💬", text: "Спілкування з виконавцями" },
      ];
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 rounded-lg overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <div className="bg-white rounded-lg">
          {/* Header Section */}
          <div className="p-6 pb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">
                {getTitle()}
              </h2>
              <p className="text-sm font-medium text-gray-600 mt-1">
                {getSubtitle()}
              </p>
            </div>
          </div>

          {/* Content Section */}
          <div className="px-6 pb-6">
            <div className="space-y-4">
              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed">
                {getDescription()}
              </p>

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
                    className="bg-gray-900 hover:bg-gray-800 text-white w-10 h-10 rounded-full p-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    disabled={!email.trim()}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </form>

              {/* Benefits */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                {getBenefits().map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs">
                      {benefit.icon}
                    </div>
                    <span>{benefit.text}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <p className="text-xs text-gray-500">
                  Безкоштовно • Займає 2 хвилини
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
