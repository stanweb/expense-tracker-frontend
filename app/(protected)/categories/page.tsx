import { CategoriesList } from "@/components/categories-list";
import {DashboardHeader} from "@/components/dashboard-header";

export default function CategoriesPage() {
  return (
    <div className="">
        <DashboardHeader/>
        <div className={'bg-background'}>
            <CategoriesList />
        </div>

    </div>
  );
}
