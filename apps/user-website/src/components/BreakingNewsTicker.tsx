'use client'

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
  const allNews = [...pinnedNews, ...latestNews.slice(0, 5)]

  if (allNews.length === 0) {
    return null
  }

  const firstNews = allNews[0]

  const renderTickerList = () => (
    <div className="flex items-center gap-8 px-4">
      {allNews.map((item, index) => (
        <Link
          key={`${item.id}-${index}`}
          href={`/news/${item.id}`}
          className="hover:underline flex items-center whitespace-nowrap text-white text-[14px] sm:text-[15px] font-semibold transition-all"
        >
          <span>{item.title}</span>
          <span className="material-symbols-outlined text-base ml-2 text-white/70">chevron_right</span>
        </Link>
      ))}
    </div>
  )

  return (
    <div className="w-full flex items-stretch h-11 sm:h-12 shadow-sm relative z-10">
      {/* Left Fixed Section */}
      <Link
        href={`/news/${firstNews.id}`}
        className="flex items-center justify-center px-3 sm:px-4 bg-[#D50000] text-white font-bold text-[13px] sm:text-[14px] tracking-wide whitespace-nowrap flex-shrink-0 w-[120px] sm:w-[130px] z-10"
      >
        LATEST NEWS
      </Link>

      {/* Right Scrolling Section */}
      <div
        className="flex-1 bg-[#B71C1C] overflow-hidden group"
      >
        <div className="animate-breaking-marquee flex items-center h-full group-hover:[animation-play-state:paused]">
          {renderTickerList()}
          {renderTickerList()}
        </div>
      </div>
    </div>
  )
}
