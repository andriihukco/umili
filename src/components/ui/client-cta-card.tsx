"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

interface ClientCTACardProps {
  onCardClick: () => void;
}

export function ClientCTACard({
  onCardClick: _onCardClick,
}: ClientCTACardProps) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      // Navigate to register page with email and client role predefined
      const params = new URLSearchParams({
        email: email.trim(),
        role: "client",
      });
      window.location.href = `/auth/register?${params.toString()}`;
    }
  };

  return (
    <Card className="bg-white border border-gray-200 hover:border-gray-300 transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="space-y-3">
          {/* Main Title with Emoji */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
              💼
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900 leading-tight">
                Зареєструйтеся як замовник
              </CardTitle>
              <p className="text-sm font-medium text-gray-600 mt-1">
                Створіть акаунт для публікації проєктів
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Description */}
          <div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Введіть вашу електронну пошту, щоб створити акаунт замовника та
              отримати доступ до публікації проєктів та пошуку умільців
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
                📝
              </div>
              <span>Публікація проєктів</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs">
                🔍
              </div>
              <span>Пошук та найм умільців</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs">
                💬
              </div>
              <span>Пряма комунікація</span>
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
