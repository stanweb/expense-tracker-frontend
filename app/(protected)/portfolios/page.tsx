import { DashboardHeader } from "@/components/dashboard-header";
import { PortfoliosList } from "@/components/portfolio/portfolios-list";

export default function PortfoliosPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <PortfoliosList />
    </div>
  );
}