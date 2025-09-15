"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          toast({
            variant: "destructive",
            title: "Помилка підтвердження",
            description:
              "Сталася помилка при підтвердженні email. Спробуйте ще раз.",
          });
          setTimeout(() => router.push("/auth/login"), 3000);
          return;
        }

        if (data.session) {
          toast({
            variant: "success",
            title: "Email підтверджено!",
            description:
              "Ваш акаунт успішно активовано. Перенаправляємо до профілю...",
          });
          setTimeout(() => router.push("/dashboard"), 2000);
        } else {
          // No session, might be a confirmation link
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          if (userError) {
            toast({
              variant: "destructive",
              title: "Помилка підтвердження",
              description: "Не вдалося підтвердити email. Перевірте посилання.",
            });
            setTimeout(() => router.push("/auth/login"), 3000);
            return;
          }

          if (user) {
            toast({
              variant: "success",
              title: "Email підтверджено!",
              description:
                "Ваш акаунт успішно активовано. Тепер ви можете увійти.",
            });
            setTimeout(() => router.push("/auth/login"), 2000);
          }
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        toast({
          variant: "destructive",
          title: "Помилка",
          description: "Сталася неочікувана помилка. Спробуйте ще раз.",
        });
        setTimeout(() => router.push("/auth/login"), 3000);
      }
    };

    handleAuthCallback();
  }, [router, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="mb-6">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Підтвердження email
          </h1>
          <p className="text-gray-600 mb-6">
            Обробляємо ваш запит на підтвердження email...
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span>Перевіряємо підтвердження</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
