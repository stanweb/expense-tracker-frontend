import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Category } from '@/Interfaces/Interfaces';

interface SpendingChartFiltersProps {
    selectedYear: string;
    setSelectedYear: (year: string) => void;
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    categories: Category[];
    years: string[];
}

export function SpendingChartFilters({
    selectedYear,
    setSelectedYear,
    selectedCategory,
    setSelectedCategory,
    categories,
    years,
}: SpendingChartFiltersProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-2">
            <div className="w-full sm:w-auto">
                <Label htmlFor="year-filter">Year</Label>
                <Select onValueChange={setSelectedYear} value={selectedYear}>
                    <SelectTrigger className="w-full sm:w-[120px]">
                        <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                        {years.map((y) => (
                            <SelectItem key={y} value={y}>
                                {y}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="w-full sm:w-auto">
                <Label htmlFor="category-filter">Category</Label>
                <Select onValueChange={setSelectedCategory} value={selectedCategory}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                                {c.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
