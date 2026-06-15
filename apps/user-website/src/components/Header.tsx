'use client'

import { useState } from 'react'
import { useThemeStore } from '@/store/themeStore'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface NewsItem {
  id: string
  title: string
}

interface HeaderProps {
  pinnedNews?: NewsItem[]
}

export function Header({ pinnedNews = [] }: HeaderProps) {
  const { colors } = useThemeStore()
  const router = useRouter()
  const [showComingSoon, setShowComingSoon] = useState(false)

  const handleComingSoon = () => {
    setShowComingSoon(true)
  }

  const handleCloseComingSoon = () => {
    setShowComingSoon(false)
  }

  return (
    <>
      <header className={`sticky top-0 z-50 ${colors.surface} border-b ${colors.outlineVariant} flex items-center justify-between px-4 md:px-8 h-24 w-full shadow-sm`}>
        <button
          onClick={handleComingSoon}
          aria-label="Menu"
          className="text-primary hover:opacity-80 transition-all cursor-pointer active:scale-95"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>
        <Link href="/" className="hover:opacity-90 transition-opacity">
          <img src="/logo.png" alt="IDL News" className="h-24 w-auto" />
        </Link>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/search')}
            aria-label="Search"
            className="text-on-surface-variant hover:text-primary transition-all cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-2xl">search</span>
          </button>
          <button
            onClick={handleComingSoon}
            aria-label="Profile"
            className="text-on-surface-variant hover:text-primary transition-all cursor-pointer active:scale-95 hidden md:block"
          >
            <span className="material-symbols-outlined text-2xl">account_circle</span>
          </button>
        </div>
      </header>
      
      {showComingSoon && (
        <div 
          onClick={handleCloseComingSoon}
          className="fixed inset-0 flex items-center justify-center z-[60] bg-black/50 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className={`${colors.surface} p-6 rounded-lg shadow-lg`}
          >
            <p className="text-on-surface font-label-category text-label-category">Coming Soon</p>
          </div>
        </div>
      )}
    </>
  )
}
