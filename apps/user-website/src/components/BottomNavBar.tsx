'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useThemeStore } from '@/store/themeStore'
import { BottomNavAd } from './BottomNavAd'

export function BottomNavBar() {
  const { colors } = useThemeStore()
  const [showComingSoon, setShowComingSoon] = useState(false)

  const handleComingSoon = () => {
    setShowComingSoon(true)
  }

  const handleCloseComingSoon = () => {
    setShowComingSoon(false)
  }

  return (
    <>
      {/* Bottom Nav Ad Banner */}
      <div className="fixed bottom-16 left-0 right-0 h-12 z-40 px-4 py-1 md:hidden">
        <BottomNavAd />
      </div>

      <nav className={`bg-surface font-label-caps text-label-caps fixed bottom-0 w-full z-50 border-t ${colors.outlineVariant} flex justify-around items-center h-16 px-4 md:hidden shadow-lg`}>
        <button onClick={handleComingSoon} className="flex flex-col items-center justify-center text-button font-bold hover:bg-surface-container-low transition-all active:scale-95 duration-150 w-full h-full bg-transparent border-none cursor-pointer">
          <span className="material-symbols-outlined mb-1">trending_up</span>
          <span>Trending</span>
        </button>
        <button onClick={handleComingSoon} className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-all active:scale-95 duration-150 w-full h-full bg-transparent border-none cursor-pointer">
          <span className="material-symbols-outlined mb-1">category</span>
          <span>Categories</span>
        </button>
      </nav>
      
      {showComingSoon && (
        <div 
          onClick={handleCloseComingSoon}
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
