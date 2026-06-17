import { Badge } from '@/components/ui/badge'
import * as Icons from 'lucide-react'
import { UiTransaction } from "@/Interfaces/Interfaces";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';

interface TransactionItemProps {
    transaction: UiTransaction;
    onEdit: (transaction: UiTransaction) => void;
    onDelete: (transaction: UiTransaction) => void;
    compact?: boolean;
}

const formatFullDate = (dateString: string | undefined): string => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

export const TransactionItem = ({ transaction, onEdit, onDelete, compact = false }: TransactionItemProps) => {
    const Icon: LucideIcon = transaction.icon as LucideIcon;
    const dateLabel = compact && transaction.rawDate ? formatFullDate(transaction.rawDate) : transaction.date;

    return (
        <div
            className={cn(
                'group flex items-center justify-between transition-colors',
                compact
                    ? 'py-2.5 px-1 hover:bg-muted/40 rounded-md'
                    : 'p-3 rounded-lg bg-background/50 hover:bg-background'
            )}
        >
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={cn(
                    'rounded-lg bg-primary/10 flex items-center justify-center shrink-0',
                    compact ? 'h-9 w-9' : 'h-10 w-10'
                )}>
                    <Icon className={cn('text-primary', compact ? 'h-4 w-4' : 'h-5 w-5')} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{transaction.name}</p>
                    <p className="text-xs text-foreground/60">{dateLabel}</p>
                </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                        KES {transaction.amount}
                    </p>
                    {transaction.category && (
                        <Badge variant="secondary" className="text-xs mt-1">
                            {transaction.category}
                        </Badge>
                    )}
                </div>
                <div className={cn(
                    'flex items-center gap-1',
                    compact && 'opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity'
                )}>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(transaction)} aria-label="Edit transaction">
                        <Icons.Edit className="h-4 w-4 text-foreground/30" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(transaction)} aria-label="Delete transaction">
                        <Icons.Trash className="h-4 w-4 text-red-500/70" />
                    </Button>
                </div>
                {!compact && <Icons.ChevronRight className="h-4 w-4 text-foreground/30" />}
            </div>
        </div>
    )
}
