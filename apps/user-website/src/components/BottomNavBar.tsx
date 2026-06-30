'use client'

import { BottomNavAd } from './BottomNavAd'

export function BottomNavBar() {
  return (
    <>
      {/* Bottom Nav Ad Banner - Permanent Fixed Size */}
      <div className="fixed bottom-0 left-0 right-0 h-12 z-40 px-2 md:hidden">
        <BottomNavAd />
      </div>
    </>
  )
}
