import { cn } from "@/lib/utils"
import { ArrowUpRight, ArrowDownRight, Percent } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { InvestmentTransactionType } from "@/Interfaces/Interfaces"

interface InvestmentTypeBadgeProps {
    type: InvestmentTransactionType
    className?: string
}

const TYPE_LABEL: Record<InvestmentTransactionType, string> = {
    BUY: "Buy",
    SELL: "Sell",
    INTEREST: "Interest",
}

export function InvestmentTypeBadge({ type, className }: InvestmentTypeBadgeProps) {
    return (
        <Badge
            variant={type === "BUY" ? "default" : type === "SELL" ? "secondary" : "outline"}
            className={cn(
                "gap-1 font-semibold",
                type === "BUY" &&
                    "bg-blue-500/15 text-blue-700 hover:bg-blue-500/20 border-blue-500/30 dark:text-blue-300",
                type === "SELL" &&
                    "bg-amber-500/15 text-amber-700 hover:bg-amber-500/20 border-amber-500/30 dark:text-amber-300",
                type === "INTEREST" &&
                    "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 border-emerald-500/30 dark:text-emerald-300",
                className,
            )}
        >
            {type === "BUY" ? (
                <ArrowUpRight className="h-3 w-3" />
            ) : type === "SELL" ? (
                <ArrowDownRight className="h-3 w-3" />
            ) : (
                <Percent className="h-3 w-3" />
            )}
            {TYPE_LABEL[type]}
        </Badge>
    )
}