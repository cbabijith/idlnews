'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useThemeStore } from '@/store/themeStore'
import { BottomNavAd } from './BottomNavAd'
import supabase from '@idlnews/shared-supabase'

interface Category {
  id: string
  name: string
  slug: string
  icon?: string
}

export function BottomNavBar() {
  const { colors } = useThemeStore()
  const router = useRouter()
  const [showCategories, setShowCategories] = useState(false)
  const [showTrendingSoon, setShowTrendingSoon] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCats, setLoadingCats] = useState(false)

  useEffect(() => {
    if (showCategories && categories.length === 0) {
      setLoadingCats(true)
      supabase
        .from('categories')
        .select('*')
        .order('name')
        .then(({ data, error }) => {
          if (!error && data) {
            setCategories(data as unknown as Category[])
          }
          setLoadingCats(false)
        })
    }
  }, [showCategories])

  const handleCategoryClick = (categoryId: string) => {
    setShowCategories(false)
    router.push(`/?category=${categoryId}`)
  }

  const handleAllNews = () => {
    setShowCategories(false)
    router.push('/')
  }

  return (
    <>
      {/* Bottom Nav Ad Banner - Permanent Fixed Size */}
      <div className="fixed bottom-16 left-0 right-0 h-12 z-40 px-2 md:hidden">
        <BottomNavAd />
      </div>

      <nav className={`bg-surface font-label-caps text-label-caps fixed bottom-0 w-full z-50 border-t ${colors.outlineVariant} flex justify-around items-center h-16 px-4 md:hidden shadow-lg`}>
        <button
          onClick={() => setShowTrendingSoon(true)}
          className="flex flex-col items-center justify-center text-button font-bold hover:bg-surface-container-low transition-all active:scale-95 duration-150 w-full h-full bg-transparent border-none cursor-pointer"
        >
          <span className="material-symbols-outlined mb-1">trending_up</span>
          <span>Trending</span>
        </button>
        <button
          onClick={() => setShowCategories(true)}
          className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-all active:scale-95 duration-150 w-full h-full bg-transparent border-none cursor-pointer"
        >
          <span className="material-symbols-outlined mb-1">category</span>
          <span>Categories</span>
        </button>
      </nav>

      {/* Categories Modal */}
      {showCategories && (
        <div
          onClick={() => setShowCategories(false)}
          className="fixed inset-0 z-[60] bg-black/50 flex items-end md:hidden cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full ${colors.surface} rounded-t-2xl shadow-2xl max-h-[75vh] overflow-y-auto`}
          >
            <div className="sticky top-0 bg-inherit flex items-center justify-between p-4 border-b border-outline-variant">
              <h2 className="text-lg font-bold text-on-surface">Categories</h2>
              <button
                onClick={() => setShowCategories(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <div className="p-4">
              {/* All News Card */}
              <button
                onClick={handleAllNews}
                className="w-full flex items-center gap-3 p-3 mb-3 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-primary-container flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-on-primary-container">newspaper</span>
                </div>
                <span className="font-medium text-on-surface">All News</span>
              </button>

              {/* Category Cards */}
              {loadingCats ? (
                <div className="flex flex-col gap-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-full flex items-center gap-3 p-3 rounded-xl bg-surface-container-low animate-pulse">
                      <div className="w-12 h-12 rounded-lg bg-surface-container" />
                      <div className="h-4 w-32 rounded bg-surface-container" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-colors active:scale-95 duration-150"
                    >
                      <div className="w-12 h-12 rounded-lg bg-primary-container flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-on-primary-container">
                          {category.icon || 'category'}
                        </span>
                      </div>
                      <span className="font-medium text-on-surface text-left">{category.name}</span>
                      <span className="material-symbols-outlined ml-auto text-on-surface-variant">chevron_right</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Trending Coming Soon */}
      {showTrendingSoon && (
        <div
          onClick={() => setShowTrendingSoon(false)}
          className="fixed inset-0 flex items-center justify-center z-[60] bg-black/50 cursor-pointer md:hidden"
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
