'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useThemeStore } from '@/store/themeStore'

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
      <nav className={`bg-surface font-label-caps text-label-caps fixed bottom-0 w-full z-50 border-t ${colors.outlineVariant} flex justify-around items-center h-16 px-4 md:hidden`}>
        <Link className="flex flex-col items-center justify-center text-primary font-bold hover:bg-surface-container-low transition-all active:scale-95 duration-150 w-full h-full" href="/">
          <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: 'FILL 1' }}>home</span>
          <span>Home</span>
        </Link>
        <button onClick={handleComingSoon} className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-all active:scale-95 duration-150 w-full h-full bg-transparent border-none cursor-pointer">
          <span className="material-symbols-outlined mb-1">live_tv</span>
          <span>Live</span>
        </button>
        <button onClick={handleComingSoon} className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-all active:scale-95 duration-150 w-full h-full bg-transparent border-none cursor-pointer">
          <span className="material-symbols-outlined mb-1">bookmark</span>
          <span>Saved</span>
        </button>
        <button onClick={handleComingSoon} className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-all active:scale-95 duration-150 w-full h-full bg-transparent border-none cursor-pointer">
          <span className="material-symbols-outlined mb-1">grid_view</span>
          <span>Menu</span>
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
