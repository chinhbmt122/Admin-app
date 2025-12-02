// src/app/(dashboard)/layout.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Film,
  Building2,
  DoorOpen,
  Calendar,
  Users,
  Ticket,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  Tag,
  Zap,
  Wrench,
  Eye,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Building2, label: 'Cinemas', href: '/dashboard/cinemas' },
  { icon: DoorOpen, label: 'Halls', href: '/dashboard/halls' },
  { icon: Wrench, label: 'Seat Status', href: '/dashboard/seat-status' },
  { icon: Film, label: 'Movies', href: '/dashboard/movies' },
  { icon: Tag, label: 'Genres', href: '/dashboard/genres' },
  { icon: Calendar, label: 'Movie Releases', href: '/dashboard/movie-releases' },
  { icon: Calendar, label: 'Showtimes', href: '/dashboard/showtimes' },
  { icon: Eye, label: 'Showtime Seats', href: '/dashboard/showtime-seats' },
  { icon: Zap, label: 'Batch Showtimes', href: '/dashboard/batch-showtimes' },
  { icon: DollarSign, label: 'Ticket Pricing', href: '/dashboard/ticket-pricing' },
  { icon: Ticket, label: 'Reservations', href: '/dashboard/reservations' },
  { icon: MessageSquare, label: 'Reviews', href: '/dashboard/reviews' },
  { icon: Users, label: 'Staff', href: '/dashboard/staff' },
  { icon: BarChart3, label: 'Reports', href: '/dashboard/reports' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen transition-all duration-300 bg-white border-r',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b">
          {sidebarOpen && (
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Cinema Admin
            </h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-4rem)] px-3 py-4">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || 
                              pathname.startsWith(item.href + '/');
              
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-purple-50 hover:text-purple-600',
                      isActive
                        ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 shadow-sm'
                        : 'text-gray-700'
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {sidebarOpen && <span>{item.label}</span>}
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 pt-6 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => {
                localStorage.removeItem('admin_token');
                window.location.href = '/login';
              }}
            >
              <LogOut className="h-5 w-5 mr-3" />
              {sidebarOpen && <span>Logout</span>}
            </Button>
          </div>
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          'flex-1 transition-all duration-300',
          sidebarOpen ? 'ml-64' : 'ml-20'
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-6">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">
                {menuItems.find((item) => pathname.startsWith(item.href))?.label || 'Dashboard'}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right mr-3">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-gray-500">admin@cinema.com</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}