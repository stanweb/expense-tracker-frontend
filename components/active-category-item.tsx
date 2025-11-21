'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { ElementType } from 'react'

interface ActiveCategoryItemProps {
    label: string
    value: string
    icon: ElementType
    color: string
    trend: string
    trendUp: boolean
}

export function ActiveCategoryItem({
                                       label,
                                       value,
                                       icon: Icon,
                                       color,
                                       trend,
                                       trendUp,
                                   }: ActiveCategoryItemProps) {
    const content = (
        <Card className="bg-card hover:bg-card/80 transition-colors">
            <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-foreground/60 mb-2">{label}</p>
                        <p className="text-3xl font-bold text-foreground">{value}</p>
                        <p className={`text-xs mt-2 ${trendUp ? 'text-chart-2' : 'text-destructive'}`}>
                            {trend}
                        </p>
                    </div>
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${color}`}>
                        <Icon className="h-5 w-5 text-primary" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    if (label === 'Categories') {
        return <Link href="/categories">{content}</Link>
    }

    return content
}
