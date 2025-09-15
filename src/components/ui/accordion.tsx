"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionProps {
  children: React.ReactNode;
  className?: string;
}

interface AccordionItemProps {
  children: React.ReactNode;
  className?: string;
}

interface AccordionTriggerProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isOpen?: boolean;
}

interface AccordionContentProps {
  children: React.ReactNode;
  className?: string;
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-2", className)} {...props}>
      {children}
    </div>
  )
);
Accordion.displayName = "Accordion";

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={cn("border rounded-lg", className)} {...props}>
      {children}
    </div>
  )
);
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  HTMLDivElement,
  AccordionTriggerProps
>(({ children, className, onClick, isOpen, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex w-full items-center justify-between py-3 px-4 font-medium transition-all hover:bg-muted/50 rounded-lg cursor-pointer",
      isOpen && "[&>svg]:rotate-180",
      className
    )}
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick?.();
      }
    }}
    {...props}
  >
    <div className="flex items-center flex-1">{children}</div>
    <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 ml-2" />
  </div>
));
AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  AccordionContentProps
>(({ children, className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("overflow-hidden transition-all", className)}
    {...props}
  >
    <div className="pb-2 pt-0">{children}</div>
  </div>
));
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
