'use client'

import { BarChart3, Settings, Download, Wallet, ListCheck, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import axiosClient from '../utils/axioClient';
import { clearUser } from '@/store/user-slice';

export function DashboardHeader() {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axiosClient.post('/auth/logout');
      dispatch(clearUser());
      // Remove the session cookie explicitly, just in case
      document.cookie = "JSESSIONID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout API fails, force a client-side logout
      dispatch(clearUser());
      document.cookie = "JSESSIONID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      router.push('/login');
    }
  };

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
            <Link href="/categories">
                <Button variant="outline">
                    <ListCheck className="h-4 w-4 mr-2" />
                    Categories
                </Button>
            </Link>
          <Link href="/budgets">
            <Button variant="outline">
              <Wallet className="h-4 w-4 mr-2" />
              Budgets
            </Button>
          </Link>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
          {/*<Button variant="outline" size="icon">*/}
          {/*  <Settings className="h-4" />*/}
          {/*</Button>*/}
          <ThemeToggle />
          <Button variant="outline" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
