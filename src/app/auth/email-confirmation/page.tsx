"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function EmailConfirmationPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    // Get email from URL params or localStorage
    const emailParam = searchParams.get("email");
    const storedEmail = localStorage.getItem("registeredEmail");
    const userEmail = emailParam || storedEmail || "";
    setEmail(userEmail);
  }, [searchParams]);

  const handleResendEmail = async () => {
    setIsResending(true);

    try {
      // Here you would call your resend email API
      // For now, just show a success message
      toast({
        title: "Email відправлено повторно",
        description: "Перевірте вашу пошту",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Помилка",
        description: "Не вдалося відправити email повторно",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleGoToLogin = () => {
    router.push("/auth/login");
  };

  const handleBackToRegister = () => {
    router.push("/auth/register");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-sm">
        {/* Icon */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Mail className="h-8 w-8 text-gray-600" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-semibold text-gray-900 font-['Geologica'] mb-2">
            Підтвердіть email
          </h1>

          {/* Description */}
          <p className="text-gray-600 font-['Geologica'] text-sm leading-relaxed">
            Ми відправили посилання для підтвердження на вашу електронну пошту
          </p>
        </div>

        {/* Email Display */}
        {email && (
          <div className="text-center mb-8">
            <p className="text-sm text-gray-500 font-['Geologica'] mb-1">
              Email відправлено на:
            </p>
            <p className="font-medium text-gray-900 font-['Geologica']">
              {email}
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-900 font-['Geologica'] mb-3">
            Що робити далі:
          </h3>
          <div className="space-y-2">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center mt-0.5">
                <span className="text-xs font-medium text-gray-600 font-['Geologica']">
                  1
                </span>
              </div>
              <p className="text-sm text-gray-600 font-['Geologica']">
                Перевірте вашу пошту (включаючи папку &quot;Спам&quot;)
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center mt-0.5">
                <span className="text-xs font-medium text-gray-600 font-['Geologica']">
                  2
                </span>
              </div>
              <p className="text-sm text-gray-600 font-['Geologica']">
                Натисніть на посилання в email
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center mt-0.5">
                <span className="text-xs font-medium text-gray-600 font-['Geologica']">
                  3
                </span>
              </div>
              <p className="text-sm text-gray-600 font-['Geologica']">
                Поверніться сюди та увійдіть в систему
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={handleGoToLogin}
            className="w-full h-12 font-['Geologica'] bg-gray-900 hover:bg-gray-800 text-white"
          >
            Я підтвердив email — Увійти
          </Button>

          <Button
            onClick={handleResendEmail}
            disabled={isResending}
            variant="outline"
            className="w-full h-12 font-['Geologica'] border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            {isResending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Відправляємо...
              </>
            ) : (
              "Відправити повторно"
            )}
          </Button>

          <Button
            onClick={handleBackToRegister}
            variant="ghost"
            className="w-full h-12 font-['Geologica'] text-gray-600 hover:bg-gray-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Повернутися до реєстрації
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500 font-['Geologica']">
            Не отримали email? Перевірте папку &quot;Спам&quot; або зверніться
            до служби підтримки
          </p>
        </div>
      </div>
    </div>
  );
}

export default function EmailConfirmationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmailConfirmationPageContent />
    </Suspense>
  );
}
