import { icons, LucideIcon } from 'lucide-react';
import * as Icons from "lucide-react";

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




// // Type-safe keys from Lucide icons
// export type IconName = keyof typeof Icons;
//
// // Function to render icons dynamically with optional size and className
// export const renderIcon = (name: IconName, size: number = 20, className: string = ""): JSX.Element => {
//     const IconComponent: LucideIcon = Icons[name];
//     return <IconComponent className={`w-${size} h-${size} ${className}`} />;
// };
