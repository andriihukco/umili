"use client";

import { FreelancerOnly } from "@/components/route-guard";
import { PortfolioManager } from "@/components/ui/portfolio-manager";
import { PageHeader } from "@/components/ui/page-header";

export default function PortfolioPage() {
  return (
    <FreelancerOnly>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div>
          <PageHeader
            title="Моє портфоліо"
            description="Покажіть свої найкращі роботи та привабте клієнтів"
          />
        </div>

        {/* Main Content */}
        <div className="px-6 py-6">
          <div className="max-w-6xl mx-auto">
            <PortfolioManager isEditable={true} />
          </div>
        </div>
      </div>
    </FreelancerOnly>
  );
}
