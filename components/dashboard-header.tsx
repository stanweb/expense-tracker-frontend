'use client'

import { BarChart3, Settings, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card shadow-2xl">
      <div className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-primary-foreground" />
            </div>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Spending Tracker</h1>
            <p className="text-sm text-foreground/60">Monitor your expenses in real-time</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Settings className="h-4" />
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
