'use client'

import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { useThemeStore } from '@/store/themeStore'
import { useNavigationStore } from '@/store/navigationStore'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { colors } = useThemeStore()
  const { sidebarOpen } = useNavigationStore()

  return (
    <div className={`min-h-screen ${colors.background} flex flex-col md:flex-row`}>
      <Sidebar />

      {/* Mobile Top Header */}
      <header className={`md:hidden ${colors.card} border-b border-gray-200 h-20 flex items-center justify-between px-4 sticky top-0 z-30 shadow-sm`}>
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="IDL News" className="h-20 w-auto object-contain" />
          <div>
            <h1 className={`text-sm font-bold ${colors.text} tracking-tight leading-none`}>IDL News</h1>
            <p className={`text-[10px] ${colors.textSecondary} mt-0.5`}>Admin Panel</p>
          </div>
        </div>
      </header>

      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'md:ml-64' : 'md:ml-20'
        } ml-0 pb-20 md:pb-0`}
      >
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
