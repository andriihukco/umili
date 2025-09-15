import { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  actions?: ReactNode;
  showBackButton?: boolean;
  backHref?: string;
  backLabel?: string;
}

export function PageHeader({
  title,
  description,
  children,
  actions,
  showBackButton,
  backHref,
  backLabel = "Назад",
}: PageHeaderProps) {
  return (
    <div className="px-6 py-6">
      {showBackButton && backHref && (
        <div className="mb-4">
          <Button variant="ghost" asChild>
            <Link href={backHref} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Link>
          </Button>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {(children || actions) && (
          <div className="flex items-center gap-2">
            {children}
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
