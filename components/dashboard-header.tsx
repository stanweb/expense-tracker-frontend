'use client'

import { useState } from 'react'
import {
  BarChart3,
  Briefcase,
  LayoutDashboard,
  ListCheck,
  LogOut,
  Menu,
  Receipt,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'

import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { clearUser } from '@/store/user-slice'
import axiosClient from '../utils/apiClient'

type NavItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Transactions', href: '/all-transactions', icon: Receipt },
  { label: 'Categories', href: '/categories', icon: ListCheck },
  { label: 'Budgets', href: '/budgets', icon: Wallet },
  { label: 'Portfolios', href: '/portfolios', icon: Briefcase },
  { label: 'Top Spenders', href: '/top-spenders', icon: TrendingUp },
]

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(href + '/')
}

export function DashboardHeader() {
  const dispatch = useDispatch()
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [signOutOpen, setSignOutOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleLogout = async () => {
    setIsSigningOut(true)
    try {
      await axiosClient.post('/auth/logout')
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      dispatch(clearUser())
      setIsSigningOut(false)
      setSignOutOpen(false)
      router.push('/login')
    }
  }

  const openSignOut = () => {
    setMenuOpen(false)
    setSignOutOpen(true)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 shrink-0 rounded-lg bg-primary flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="hidden sm:block min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-foreground truncate">
              Spending Tracker
            </h1>
            <p className="text-xs text-foreground/60 truncate">
              Monitor your expenses in real-time
            </p>
          </div>
        </Link>

        <nav aria-label="Primary" className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(pathname, item.href)
            return (
              <Button
                key={item.href}
                asChild
                variant="ghost"
                size="sm"
                className={cn(
                  'gap-2 text-foreground/90 hover:text-accent-foreground hover:bg-accent/70',
                  active && 'bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground',
                )}
              >
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            )
          })}
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button
            variant="outline"
            size="icon"
            className="hidden md:inline-flex"
            onClick={openSignOut}
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 sm:max-w-sm">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-primary-foreground" />
                  </div>
                  Spending Tracker
                </SheetTitle>
                <SheetDescription>
                  Monitor your expenses in real-time
                </SheetDescription>
              </SheetHeader>
              <nav aria-label="Primary mobile" className="flex flex-col gap-1 px-4">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(pathname, item.href)
                  return (
                    <SheetClose asChild key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground/50 hover:bg-accent hover:text-foreground/30',
                          active && 'bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground',
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </SheetClose>
                  )
                })}
              </nav>
              <div className="mt-auto px-4 pb-4">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={openSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <AlertDialog open={signOutOpen} onOpenChange={setSignOutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out of Spending Tracker?</AlertDialogTitle>
            <AlertDialogDescription>
              You'll need to sign in again to view your expenses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSigningOut}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleLogout()
              }}
              disabled={isSigningOut}
            >
              {isSigningOut ? 'Signing out…' : 'Sign out'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  )
}
