"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, RefreshCw, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">⚠️</span>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Something went wrong!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-gray-600">
              <p className="text-lg mb-2">Application Error</p>
              <p>
                An unexpected error occurred. Please try again or contact
                support if the problem persists.
              </p>
              {error.digest && (
                <p className="text-sm text-gray-500 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Button onClick={reset} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>

              <Button asChild variant="outline" className="w-full">
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
                If this error continues, please contact our support team with
                the Error ID above.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
