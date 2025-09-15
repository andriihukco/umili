"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { AlertTriangle, User, Briefcase, LogOut, Shield } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

export default function SettingsPage() {
  const { user, profile, setProfile } = useAppStore();
  const [isSwitching, setIsSwitching] = useState(false);

  const handleAccountSwitch = async () => {
    if (!user || !profile) return;

    setIsSwitching(true);
    try {
      // Only switch between freelancer and client roles
      let newRole: "freelancer" | "client";
      if (profile.role === "freelancer") {
        newRole = "client";
      } else {
        newRole = "freelancer";
      }

      const { error } = await supabase
        .from("users")
        .update({ role: newRole })
        .eq("id", user.id);

      if (error) throw error;

      setProfile({ ...profile, role: newRole });
    } catch (error) {
      console.error("Error switching account:", error);
    } finally {
      setIsSwitching(false);
    }
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light text-gray-600">
            Будь ласка, увійдіть в систему
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div>
        <PageHeader
          title="Налаштування"
          description="Керуйте своїм профілем та налаштуваннями акаунту"
        />
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-black flex items-center gap-3 mb-2">
              {profile.role === "freelancer" ? (
                <>
                  <Briefcase className="w-5 h-5" />
                  Профіль фрілансера
                </>
              ) : profile.role === "client" ? (
                <>
                  <User className="w-5 h-5" />
                  Профіль клієнта
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Профіль адміністратора
                </>
              )}
            </h2>
            <p className="text-gray-600 font-light">
              Поточний тип акаунту:{" "}
              {profile.role === "freelancer"
                ? "Фрілансер"
                : profile.role === "client"
                ? "Клієнт"
                : "Адміністратор"}
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Ім&apos;я
              </label>
              <p className="text-lg text-black font-light">
                {profile.name || "Не вказано"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <p className="text-lg text-black font-light">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Тип акаунту
              </label>
              <p className="text-lg text-black font-light">
                {profile.role === "freelancer"
                  ? "Фрілансер"
                  : profile.role === "client"
                  ? "Клієнт"
                  : "Адміністратор"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100"></div>

      {/* Account Switching */}
      <div className="py-12 px-6 bg-red-50">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-red-700 flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5" />
              Небезпечна зона
            </h2>
            <p className="text-gray-600 font-light">
              Перемикання типу акаунту між фрілансером, клієнтом та
              адміністратором
            </p>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg border border-red-200">
              <h3 className="font-medium text-red-800 mb-2">Увага!</h3>
              <p className="text-sm text-red-700 font-light leading-relaxed">
                {profile.role === "admin"
                  ? "Адміністратори не можуть змінювати свою роль через інтерфейс."
                  : "Перемикання типу акаунту змінить ваш доступ до функцій платформи. Якщо ви зараз фрілансер, ви станете клієнтом і навпаки. Це вплине на доступні вам розділи та можливості."}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {profile.role !== "admin" && (
                <Button
                  onClick={handleAccountSwitch}
                  disabled={isSwitching}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isSwitching
                    ? "Перемикаємо..."
                    : `Стати ${
                        profile.role === "freelancer"
                          ? "клієнтом"
                          : "фрілансером"
                      }`}
                </Button>
              )}

              <div className="text-sm text-gray-600 font-light">
                Поточний тип:{" "}
                <span className="font-medium">
                  {profile.role === "freelancer"
                    ? "Фрілансер"
                    : profile.role === "client"
                    ? "Клієнт"
                    : "Адміністратор"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100"></div>

      {/* Other Settings */}
      <div className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-2">
              Інші налаштування
            </h2>
            <p className="text-gray-600 font-light">
              Додаткові опції для вашого акаунту
            </p>
          </div>
          <div className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              <LogOut className="w-4 h-4 mr-2" />
              Вийти з акаунту
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
