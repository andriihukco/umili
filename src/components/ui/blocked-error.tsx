"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface BlockedErrorProps {
  type: "user" | "task";
  reason: string;
  blockedAt: string;
  backHref: string;
  backLabel?: string;
}

export function BlockedError({
  type,
  reason,
  blockedAt,
  backHref,
  backLabel = "Go Back",
}: BlockedErrorProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-destructive/10 rounded-full">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-2 text-destructive">
            {type === "user" ? "Account Blocked" : "Task Blocked"}
          </h1>

          <p className="text-muted-foreground mb-6">
            This {type} has been blocked and is no longer accessible.
          </p>

          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-medium text-destructive mb-2">Block Reason:</h3>
            <p className="text-sm text-destructive mb-2">{reason}</p>
            <p className="text-xs text-destructive/80">
              Blocked on: {formatDate(blockedAt)}
            </p>
          </div>

          <Button asChild className="w-full">
            <Link
              href={backHref}
              className="flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
