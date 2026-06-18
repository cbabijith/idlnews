'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useThemeStore } from '@/store/themeStore'
import { useNavigationStore } from '@/store/navigationStore'
import { LayoutDashboard, Newspaper, Folder, Megaphone, ChevronLeft, ChevronRight } from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()
  const { colors } = useThemeStore()
  const { sidebarOpen, toggleSidebar, setCurrentPath } = useNavigationStore()

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/content/news', label: 'News', icon: Newspaper },
    { href: '/content/categories', label: 'Categories', icon: Folder },
    { href: '/content/ads', label: 'Ads', icon: Megaphone },
  ]

  const handleNavClick = (href: string) => {
    setCurrentPath(href)
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full ${colors.card} border-r border-gray-200 hidden md:flex flex-col transition-all duration-300 ease-in-out z-40 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Header / Logo */}
        <div className={`p-4 border-b border-gray-100 flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="IDL News" className="h-20 w-auto object-contain" />
              <div>
                <h2 className={`text-sm font-bold ${colors.text} tracking-tight leading-none`}>IDL News</h2>
                <p className={`text-[10px] ${colors.textSecondary} mt-0.5`}>Admin Panel</p>
              </div>
            </div>
          ) : (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-all active:scale-95 cursor-pointer"
              title="Expand sidebar"
            >
              <img src="/logo.png" alt="IDL News" className="h-20 w-20 object-contain" />
            </button>
          )}
          
          {sidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              title="Collapse sidebar"
            >
              <ChevronLeft size={20} />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-6">
          <ul className="space-y-1.5 px-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => handleNavClick(item.href)}
                    className={`flex items-center rounded-xl transition-all duration-200 ${
                      sidebarOpen ? 'px-4 py-3 gap-3' : 'p-3 justify-center'
                    } ${
                      isActive
                        ? 'bg-button text-white shadow-md shadow-red-100 dark:shadow-none'
                        : `${colors.text} hover:bg-gray-50`
                    }`}
                    title={!sidebarOpen ? item.label : undefined}
                  >
                    <Icon size={22} className={isActive ? 'text-white' : 'text-gray-500'} />
                    {sidebarOpen && (
                      <span className="font-medium text-sm">{item.label}</span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Bottom Collapse Toggle (only visible when collapsed) */}
        {!sidebarOpen && (
          <div className="p-4 border-t border-gray-100 flex justify-center">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              title="Expand sidebar"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className={`fixed bottom-0 left-0 right-0 h-16 ${colors.card} border-t border-gray-200 flex items-center justify-around z-40 md:hidden pb-safe shadow-lg`}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => handleNavClick(item.href)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1.5 text-xs transition-colors ${
                isActive ? 'text-button font-semibold' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-button' : 'text-gray-500'} />
              <span className="mt-1">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
