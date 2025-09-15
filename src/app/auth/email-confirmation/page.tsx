"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, CheckCircle, ArrowLeft, RefreshCw, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function EmailConfirmationPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [countdown, setCountdown] = useState(5);
  const [isResending, setIsResending] = useState(false);
  const [autoRedirect, setAutoRedirect] = useState(true);

  useEffect(() => {
    // Get email from URL params or localStorage
    const emailParam = searchParams.get("email");
    const storedEmail = localStorage.getItem("registeredEmail");
    const userEmail = emailParam || storedEmail || "";
    setEmail(userEmail);

    // Start countdown timer for auto-redirect
    setCountdown(5);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (autoRedirect) {
            router.push("/auth/login");
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [searchParams, router, autoRedirect]);

  const handleResendEmail = async () => {
    setIsResending(true);

    try {
      // Here you would call your resend email API
      // For now, just show a success message
      toast({
        title: "Email відправлено повторно!",
        description: "Перевірте вашу пошту.",
      });

      // Reset countdown for resend
      setCountdown(30);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      toast({
        variant: "destructive",
        title: "Помилка",
        description: "Не вдалося відправити email повторно.",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleGoToLogin = () => {
    setAutoRedirect(false);
    router.push("/auth/login");
  };

  const handleBackToRegister = () => {
    setAutoRedirect(false);
    router.push("/auth/register");
  };

  // const handleCancelAutoRedirect = () => {
  //   setAutoRedirect(false);
  // };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Mail className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold font-['Geologica']">
            Підтвердіть ваш email
          </CardTitle>
          <CardDescription className="text-gray-600 font-['Geologica']">
            Ми відправили посилання для підтвердження на вашу електронну пошту
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {email && (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2 font-['Geologica']">
                Email відправлено на:
              </p>
              <p className="font-medium text-green-600 font-['Geologica']">
                {email}
              </p>
            </div>
          )}

          {/* Auto-redirect notification */}
          {autoRedirect && countdown > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-green-900 font-['Geologica']">
                    Автоматичне перенаправлення через {countdown} секунд
                  </p>
                  <p className="text-green-800 font-['Geologica']">
                    Натисніть будь-яку кнопку нижче, щоб скасувати
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1 font-['Geologica']">
                  Що робити далі:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-blue-800 font-['Geologica']">
                  <li>
                    Перевірте вашу пошту (включаючи папку &quot;Спам&quot;)
                  </li>
                  <li>Натисніть на посилання в email</li>
                  <li>Поверніться сюди та увійдіть в систему</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleResendEmail}
              disabled={isResending}
              variant="outline"
              className="w-full font-['Geologica']"
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
              onClick={handleGoToLogin}
              className="w-full font-['Geologica'] bg-green-600 hover:bg-green-700"
            >
              Я підтвердив email - Увійти
            </Button>

            <Button
              onClick={handleBackToRegister}
              variant="ghost"
              className="w-full font-['Geologica']"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Повернутися до реєстрації
            </Button>
          </div>

          <div className="text-center text-xs text-gray-500 font-['Geologica']">
            <p>Не отримали email? Перевірте папку &quot;Спам&quot; або</p>
            <p>зверніться до служби підтримки</p>
          </div>
        </CardContent>
      </Card>
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
