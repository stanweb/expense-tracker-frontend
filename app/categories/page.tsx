import { CategoriesList } from "@/components/categories-list";
import {DashboardHeader} from "@/components/dashboard-header";

export default function CategoriesPage() {
  return (
    <div className="">
        <DashboardHeader/>
        <div className={'border-2 rounded-3xl shadow-2xl mt-3 py-2 px-4 container mx-auto'}>
            <h1 className="text-2xl font-bold mb-5">Manage Categories</h1>
            <CategoriesList />
        </div>

    </div>
  );
}
