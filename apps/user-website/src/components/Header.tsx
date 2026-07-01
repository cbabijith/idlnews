'use client'

import { useState, useEffect } from 'react'
import { useThemeStore } from '@/store/themeStore'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import supabase from '@idlnews/shared-supabase'

interface Category {
  id: string
  name: string
  slug: string
}

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
  const [categories, setCategories] = useState<Category[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug')
          .order('name')
        if (error) throw error
        setCategories(data || [])
      } catch (err) {
        console.error('Error fetching categories for header:', err)
      }
    }
    fetchCategories()
  }, [])

  const handleComingSoon = () => {
    setShowComingSoon(true)
  }

  const handleCloseComingSoon = () => {
    setShowComingSoon(false)
  }

  return (
    <>
      <header className={`sticky top-0 z-50 bg-primary border-b border-blue-200 flex items-center justify-between px-4 md:px-8 h-16 w-full shadow-sm`}>
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Menu"
          className="text-white hover:opacity-80 transition-all cursor-pointer active:scale-95"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>
        <Link href="/" className="hover:opacity-90 transition-opacity">
          <img src="/whitelogoidlnewslargesvg.svg" alt="IDL News" className="h-24 w-auto object-contain" />
        </Link>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/search')}
            aria-label="Search"
            className="text-white hover:opacity-80 transition-all cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-2xl">search</span>
          </button>
          <button
            onClick={handleComingSoon}
            aria-label="Profile"
            className="text-white hover:opacity-80 transition-all cursor-pointer active:scale-95 hidden md:block"
          >
            <span className="material-symbols-outlined text-2xl">account_circle</span>
          </button>
        </div>
      </header>
      
      {/* Mobile Categories Sidebar Drawer */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex transition-opacity duration-300"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-72 max-w-[85vw] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300"
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">folder</span>
                <span className="font-bold text-gray-800 text-base">Categories</span>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="text-gray-500 hover:text-gray-800 p-1.5 rounded-full hover:bg-gray-200 transition-colors"
                aria-label="Close menu"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Sidebar List Content */}
            <div className="flex-1 overflow-y-auto py-3 px-2">
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => {
                      router.push('/')
                      setSidebarOpen(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <span className="material-symbols-outlined text-gray-400 text-lg">home</span>
                    All News
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => {
                        router.push(`/?category=${cat.id}`)
                        setSidebarOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <span className="material-symbols-outlined text-gray-400 text-lg">chevron_right</span>
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Sidebar Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 text-center">
              <p className="text-[10px] text-gray-400">© 2026 IDL News</p>
            </div>
          </div>
        </div>
      )}

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
