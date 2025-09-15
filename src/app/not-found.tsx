"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, HelpCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">🚫</span>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Page Not Found
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-gray-600">
              <p className="text-lg mb-2">404 Error</p>
              <p>
                The page you&apos;re looking for doesn&apos;t exist or has been
                moved.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>

              <Button asChild className="w-full">
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Go to Homepage
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link href="/contact">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Contact Support
                </Link>
              </Button>
            </div>

            <div className="text-sm text-gray-500 pt-4 border-t">
              <p>
                If you believe this is an error, please contact our support
                team.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
