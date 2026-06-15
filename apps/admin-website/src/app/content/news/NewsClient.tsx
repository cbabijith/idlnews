'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { newsService } from '@/services'
import { supabaseApi } from '@/api/supabase.api'
import { News, Category, Subcategory } from '@/types'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useThemeStore } from '@/store/themeStore'
import { searchNewsAction } from '@/app/actions/news'

interface NewsClientProps {
  initialNews: News[]
  initialCategories: Category[]
  initialSubcategories: Subcategory[]
  initialCount: number
}

export function NewsClient({
  initialNews,
  initialCategories,
  initialCount
}: NewsClientProps) {
  const { colors } = useThemeStore()
  const [newsItems, setNewsItems] = useState<News[]>(initialNews)
  const [categories] = useState<Category[]>(initialCategories)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(initialNews.length < initialCount)

  // Search, filtering and sorting states
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'category' | 'title-asc' | 'title-desc'>('date-desc')

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch filtered/sorted news items from server on control changes
  useEffect(() => {
    let active = true
    async function performSearch() {
      setLoading(true)
      const result = await searchNewsAction({
        searchQuery: debouncedSearchQuery,
        categoryId: filterCategory,
        sortBy,
        limit: 10,
        offset: 0
      })
      if (active) {
        if (result.data) {
          setNewsItems(result.data)
          setCount(result.count)
          setHasMore(result.data.length < result.count)
        }
        setLoading(false)
      }
    }
    performSearch()
    return () => {
      active = false
    }
  }, [debouncedSearchQuery, filterCategory, sortBy])

  // Load more news items on scroll
  const loadMoreNews = async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    const result = await searchNewsAction({
      searchQuery: debouncedSearchQuery,
      categoryId: filterCategory,
      sortBy,
      limit: 10,
      offset: newsItems.length
    })
    if (result.data) {
      setNewsItems(prev => {
        const existingIds = new Set(prev.map(item => item.id))
        const newItems = result.data.filter(item => !existingIds.has(item.id))
        return [...prev, ...newItems]
      })
      setCount(result.count)
      setHasMore(newsItems.length + result.data.length < result.count)
    }
    setLoadingMore(false)
  }

  // Scroll listener for infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === 'undefined') return
      
      const threshold = 100
      const position = window.innerHeight + window.scrollY
      const height = document.documentElement.scrollHeight
      
      if (position >= height - threshold && hasMore && !loadingMore && !loading) {
        loadMoreNews()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasMore, loadingMore, loading, newsItems.length, debouncedSearchQuery, filterCategory, sortBy])

  const refreshNews = async () => {
    const currentLimit = Math.max(10, newsItems.length)
    const result = await searchNewsAction({
      searchQuery: debouncedSearchQuery,
      categoryId: filterCategory,
      sortBy,
      limit: currentLimit,
      offset: 0
    })
    if (result.data) {
      setNewsItems(result.data)
      setCount(result.count)
      setHasMore(result.data.length < result.count)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this news item?')) return
    
    const newsItem = newsItems.find(item => item.id === id)
    
    if (newsItem?.image_url) {
      try {
        const url = new URL(newsItem.image_url)
        const pathParts = url.pathname.split('/')
        const fileName = pathParts[pathParts.length - 1]
        await supabaseApi.storage.deleteImage(fileName)
      } catch (error) {
        console.error('Error deleting image from storage:', error)
      }
    }
    
    const result = await newsService.deleteNews(id)
    if (result.error) {
      alert(result.error)
      return
    }
    refreshNews()
  }

  const togglePublish = async (news: News) => {
    const result = await newsService.togglePublishStatus(news.id)
    if (result.error) {
      alert(result.error)
      return
    }
    refreshNews()
  }

  const togglePin = async (news: News) => {
    const result = await newsService.togglePinStatus(news.id)
    if (result.error) {
      alert(result.error)
      return
    }
    refreshNews()
  }

  return (
    <DashboardLayout>
      <div className="hidden sm:flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className={`text-3xl sm:text-4xl font-bold ${colors.text}`}>News Management</h1>
        <Link
          href="/content/news/new"
          className="w-full sm:w-auto px-6 py-3 bg-button text-white rounded-lg hover:opacity-90 transition-all font-medium text-center"
        >
          Add News
        </Link>
      </div>

      {/* Floating Add Button for Mobile only */}
      <Link
        href="/content/news/new"
        className="sm:hidden fixed bottom-24 right-6 w-14 h-14 bg-button text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all z-40"
        title="Add News"
      >
        <span className="text-3xl font-light">+</span>
      </Link>

      {/* Filtering and Sorting Controls */}
      <div className={`flex flex-col lg:flex-row gap-4 p-4 mb-6 rounded-lg ${colors.card} shadow-sm border border-gray-100 justify-between items-center`}>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-1">
          <div className="w-full sm:max-w-md">
            <label className={`block text-[10px] font-semibold uppercase tracking-wider mb-1 ${colors.textSecondary}`}>Search News</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, description or content..."
                className={`w-full p-2 pl-8 text-sm ${colors.border} rounded-lg ${colors.text} bg-transparent`}
              />
              <span className="absolute left-2.5 top-2.5 text-gray-400 text-xs">🔍</span>
            </div>
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto flex-1 sm:flex-none">
            <div className="flex-1 sm:w-[180px] sm:flex-none">
              <label className={`block text-[10px] font-semibold uppercase tracking-wider mb-1 ${colors.textSecondary}`}>Filter by Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className={`w-full p-2 text-sm ${colors.border} rounded-lg ${colors.text} bg-transparent`}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 sm:w-[180px] sm:flex-none">
              <label className={`block text-[10px] font-semibold uppercase tracking-wider mb-1 ${colors.textSecondary}`}>Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className={`w-full p-2 text-sm ${colors.border} rounded-lg ${colors.text} bg-transparent`}
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="category">Category</option>
                <option value="title-asc">Title (A to Z)</option>
                <option value="title-desc">Title (Z to A)</option>
              </select>
            </div>
          </div>
        </div>
        <div className={`text-xs ${colors.textSecondary} w-full lg:w-auto text-left lg:text-right mt-2 lg:mt-0 font-medium`}>
          Showing {newsItems.length} of {count} articles
        </div>
      </div>

      <div className="grid gap-4">
        {loading && newsItems.length === 0 ? (
          <p className={`${colors.textSecondary} text-center py-8`}>Loading news...</p>
        ) : newsItems.length === 0 ? (
          <p className={colors.textSecondary}>No news items found</p>
        ) : (
          <>
            {newsItems.map((item) => (
              <div key={item.id} className={`${colors.card} rounded-lg shadow overflow-hidden h-40 sm:h-48 flex flex-row`}>
                {/* Fixed Image Container */}
                {item.image_url ? (
                  <div className="w-28 sm:w-48 h-full flex-shrink-0 relative bg-gray-100">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover absolute inset-0"
                    />
                  </div>
                ) : (
                  <div className="w-28 sm:w-48 h-full flex-shrink-0 bg-gray-100 flex items-center justify-center text-gray-400">
                    <span className="material-symbols-outlined text-4xl">image</span>
                  </div>
                )}

                {/* Content Area */}
                <div className="flex-1 p-3 sm:p-5 flex flex-col justify-between min-w-0">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase ${
                        item.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.is_published ? 'Published' : 'Draft'}
                      </span>
                      {item.is_pinned && (
                        <span className="px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase bg-indigo-100 text-indigo-800 flex items-center gap-0.5">
                          📌 Pinned
                        </span>
                      )}
                      <span className={`text-[10px] sm:text-xs ${colors.textSecondary}`} title={`Created: ${new Date(item.created_at).toLocaleString()}`}>
                        Created: {new Date(item.created_at).toLocaleDateString()}
                      </span>
                      <span className={`text-[10px] sm:text-xs ${colors.textSecondary}`} title={`Updated: ${new Date(item.updated_at).toLocaleString()}`}>
                        Updated: {new Date(item.updated_at).toLocaleDateString()}
                      </span>
                      {item.profiles && (
                        <span className={`text-[10px] sm:text-xs ${colors.textSecondary} font-semibold`} title={`Written by: ${item.profiles.full_name || item.profiles.email}`}>
                          By: {item.profiles.full_name || item.profiles.email?.split('@')[0]}
                        </span>
                      )}
                    </div>
                    
                    <h3 className={`text-sm sm:text-lg font-bold mb-1 ${colors.text} truncate`} title={item.title}>
                      {item.title}
                    </h3>
                    
                    <p className={`${colors.textSecondary} text-[11px] sm:text-sm line-clamp-2 sm:line-clamp-3 mb-1.5`}>
                      {item.description || (item.content ? item.content.replace(/<[^>]*>/g, '') : 'No description available')}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-2 mt-auto">
                    <div>
                      {item.youtube_link && (
                        <a
                          href={item.youtube_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] sm:text-xs text-blue-500 hover:underline flex items-center gap-1"
                        >
                          🎥 Video
                        </a>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => togglePublish(item)}
                        className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-white rounded-lg hover:opacity-90 transition-opacity text-[10px] sm:text-xs ${
                          item.is_published ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        title={item.is_published ? 'Unpublish' : 'Publish'}
                      >
                        {item.is_published ? '↓' : '↑'}
                      </button>
                      <button
                        onClick={() => togglePin(item)}
                        className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-white rounded-lg hover:opacity-90 transition-opacity text-[10px] sm:text-xs ${
                          item.is_pinned ? 'bg-indigo-600' : 'bg-gray-400'
                        }`}
                        title={item.is_pinned ? 'Unpin' : 'Pin'}
                      >
                        📌
                      </button>
                      <Link
                        href={`/content/news/edit/${item.id}`}
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-button text-white rounded-lg hover:opacity-90 transition-opacity text-[10px] sm:text-xs"
                        title="Edit"
                      >
                        ✎
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-red-500 text-white rounded-lg hover:bg-red-600 transition-opacity text-[10px] sm:text-xs"
                        title="Delete"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {loadingMore && <p className={`${colors.textSecondary} text-center py-4`}>Loading more stories...</p>}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
