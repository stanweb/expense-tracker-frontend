import { Badge } from '@/components/ui/badge'
import * as Icons from 'lucide-react'
import { UiTransaction } from "@/Interfaces/Interfaces";
import {LucideIcon} from "lucide-react";

const getIcon = (iconName: string): LucideIcon => {
    if(iconName != null && iconName.length > 1) return Icons[iconName as keyof typeof Icons] as LucideIcon
    return Icons.CreditCard
};


export const TransactionItem = ({ transaction }: { transaction: UiTransaction }) => {
    const Icon = getIcon(transaction.icon);
    console.log(transaction.icon)


    return (
        <div
            key={transaction.id}
            className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background transition-colors"
        >
            <div className="flex items-center gap-3 flex-1">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{transaction.name}</p>
                    <p className="text-xs text-foreground/60">{transaction.date}</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                        KES {transaction.amount}
                    </p>
                    <Badge variant="secondary" className="text-xs mt-1">
                        {transaction.category}
                    </Badge>
                </div>
                <Icons.ChevronRight className="h-4 w-4 text-foreground/30" />
            </div>
        </div>
    )
}
