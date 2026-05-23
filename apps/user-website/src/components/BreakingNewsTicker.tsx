'use client'

import { useThemeStore } from '@/store/themeStore'

interface NewsItem {
  id: string
  title: string
}

interface BreakingNewsTickerProps {
  pinnedNews?: NewsItem[]
  latestNews?: NewsItem[]
}

export function BreakingNewsTicker({ pinnedNews = [], latestNews = [] }: BreakingNewsTickerProps) {
  const { colors } = useThemeStore()

  // Combine pinned news and latest 4 news items
  const allNews = [...pinnedNews, ...latestNews.slice(0, 4)]
  
  const tickerContent = allNews.length > 0 
    ? allNews.map(item => item.title).join(' • • ')
    : 'Latest news updates will appear here...'

  return (
    <div className="bg-secondary-container text-on-secondary-container font-label-category text-label-category py-2 w-full overflow-hidden flex items-center px-0 md:px-0">
      <div className="ticker whitespace-nowrap animate-marquee">
        {tickerContent}
      </div>
    </div>
  )
}
