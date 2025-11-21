import { CategoriesList } from "@/components/categories-list";
import {DashboardHeader} from "@/components/dashboard-header";

export default function CategoriesPage() {
  return (
    <div className="container mx-auto py-10">
        <DashboardHeader/>
        <div className={'border-2 rounded-3xl shadow-2xl py-2 px-4'}>
            <h1 className="text-2xl font-bold mb-5">Manage Categories</h1>
            <CategoriesList />
        </div>

    </div>
  );
}
