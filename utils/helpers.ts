import { icons, LucideIcon } from 'lucide-react';

export const getIcon = (iconName: string): LucideIcon => {
    const Icon = icons[iconName as keyof typeof icons];
    return Icon || icons.CreditCard;
};

export const formatDaysAgo = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    return `${diffDays} days ago`
}
