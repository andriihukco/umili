"use client";

import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { getContactWarningMessage } from "@/lib/contact-detection";

interface BlurredContactProps {
  children: React.ReactNode;
  contactType: string;
  className?: string;
}

export function BlurredContact({
  children,
  contactType,
  className,
}: BlurredContactProps) {
  const { toast } = useToast();

  const handleClick = () => {
    const warningMessage = getContactWarningMessage([contactType]);
    toast({
      title: "⚠️ Попередження про контактні дані",
      description: warningMessage,
      duration: 8000,
    });
  };

  return (
    <span className={cn("inline-block", className)}>
      <span
        className="blur-sm select-none bg-muted px-2 py-1 rounded text-muted-foreground cursor-pointer hover:bg-muted/80 transition-colors"
        onClick={handleClick}
      >
        {children}
      </span>
    </span>
  );
}
