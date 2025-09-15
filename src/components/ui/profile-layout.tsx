"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface ProfileLayoutProps {
  // Back navigation (optional - if not provided, uses browser history)
  backHref?: string;
  backLabel?: string;

  // Sidebar content (1/3 width)
  sidebar: React.ReactNode;

  // Main content tabs (2/3 width)
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: React.ReactNode;
}

export function ProfileLayout({
  backHref,
  backLabel,
  sidebar,
  tabs,
  activeTab,
  onTabChange,
  children,
}: ProfileLayoutProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="p-0 h-auto flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel || "Назад"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar (1/3) */}
          <div className="lg:col-span-1">{sidebar}</div>

          {/* Right Main Content (2/3) */}
          <div className="lg:col-span-2">
            {/* Tabs Navigation */}
            <div className="border-b border-border mb-6">
              <div className="flex overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 border-b-2 ${
                      activeTab === tab.id
                        ? "text-foreground border-primary"
                        : "text-muted-foreground border-transparent hover:text-foreground hover:border-muted-foreground"
                    }`}
                  >
                    {tab.label}
                    {tab.count !== undefined && (
                      <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded-full">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
