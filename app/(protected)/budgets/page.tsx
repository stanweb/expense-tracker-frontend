import { BudgetsList } from "@/components/budget/budgets-list";
import { DashboardHeader } from "@/components/dashboard-header";

export default function BudgetsPage() {
  return (
    <>
      <DashboardHeader />
      <div className="bg-background ">
        <BudgetsList />
      </div>
    </>
  );
}
