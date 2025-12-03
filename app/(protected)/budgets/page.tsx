import { BudgetsList } from "@/components/budget/budgets-list";
import { DashboardHeader } from "@/components/dashboard-header";

export default function BudgetsPage() {
  return (
    <>
      <DashboardHeader />
      <div className="container mx-auto py-10 border-2 rounded-2xl mt-5 shadow-xl px-4 min-h-[50vh] ">
        <h1 className="text-2xl font-bold mb-5">Manage Budgets</h1>
        <BudgetsList />
      </div>
    </>
  );
}
