"use client";

import { ReactNode } from "react";

interface ContentLayoutProps {
  children: ReactNode;
  filters?: ReactNode;
  className?: string;
  showMobileFilters?: boolean;
  onMobileFiltersToggle?: () => void;
  filteredCount?: number;
  onClearFilters?: () => void;
}

export function ContentLayout({
  children,
  filters,
  className = "",
  showMobileFilters = false,
  onMobileFiltersToggle,
  filteredCount = 0,
  onClearFilters,
}: ContentLayoutProps) {
  return (
    <div className={`px-4 sm:px-6 lg:px-8 py-6 sm:py-8 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-10">
          {/* Filters Sidebar - Sticky on desktop, modal on mobile */}
          {filters && (
            <>
              {/* Desktop Filters - Sticky */}
              <div className="hidden lg:block lg:w-1/3 lg:min-w-[280px] lg:order-2">
                <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto space-y-4">
                  {filters}
                </div>
              </div>

              {/* Mobile Filters Modal */}
              {showMobileFilters && (
                <div className="fixed inset-0 z-50 lg:hidden">
                  <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={onMobileFiltersToggle}
                  />
                  <div className="absolute inset-0 bg-background flex flex-col">
                    {/* Fixed Header */}
                    <div className="flex items-center justify-between p-4 border-b bg-background">
                      <h2 className="text-lg font-semibold">Фільтри</h2>
                      <button
                        onClick={onMobileFiltersToggle}
                        className="p-2 hover:bg-muted rounded-md transition-colors"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-4">{filters}</div>

                    {/* Fixed Footer */}
                    <div className="border-t p-4 bg-background space-y-3">
                      <button
                        onClick={() => {
                          if (onClearFilters) {
                            onClearFilters();
                          }
                        }}
                        className="w-full border border-input hover:bg-muted px-4 py-3 rounded-md font-medium transition-colors"
                      >
                        Скинути всі фільтри
                      </button>
                      <button
                        onClick={onMobileFiltersToggle}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-3 rounded-md font-medium transition-colors"
                      >
                        Показати {filteredCount} результатів
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Main Content - 2/3 width on desktop, full width on mobile */}
          <div className="flex-1 lg:w-2/3 lg:order-1">{children}</div>
        </div>
      </div>
    </div>
  );
}

interface FilterSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function FilterSection({
  title,
  children,
  className = "",
}: FilterSectionProps) {
  return (
    <div className={`bg-background rounded-lg p-3 sm:p-4 lg:p-6 ${className}`}>
      {title && (
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
          {title}
        </h3>
      )}
      <div className="space-y-3 sm:space-y-4">{children}</div>
    </div>
  );
}

interface ContentListProps {
  children: ReactNode;
  emptyState?: ReactNode;
  className?: string;
}

export function ContentList({
  children,
  emptyState,
  className = "",
}: ContentListProps) {
  return (
    <div className={`space-y-0 ${className}`}>
      {children}
      {!children && emptyState}
    </div>
  );
}
