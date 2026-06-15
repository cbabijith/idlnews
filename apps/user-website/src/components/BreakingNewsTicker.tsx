'use client'

import { useThemeStore } from '@/store/themeStore'

import Link from 'next/link'

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

  // Combine pinned news and latest 3 news items
  const allNews = [...pinnedNews, ...latestNews.slice(0, 3)]
  
  if (allNews.length === 0) {
    return null
  }

  const renderTickerList = () => (
    <div className="flex items-center gap-12 px-6">
      {allNews.map((item, index) => (
        <Link
          key={`${item.id}-${index}`}
          href={`/news/${item.id}`}
          className="hover:underline flex items-center whitespace-nowrap text-on-secondary-container text-sm sm:text-base font-semibold group transition-all"
        >
          <span>{item.title}</span>
        </Link>
      ))}
    </div>
  )

  return (
    <div className="bg-secondary-container text-on-secondary-container py-2.5 w-full overflow-hidden flex border-y border-secondary/20 shadow-inner">
      <div className="animate-marquee flex">
        {renderTickerList()}
        {renderTickerList()}
      </div>
    </div>
  )
}
