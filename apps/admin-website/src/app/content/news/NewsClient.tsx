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
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null)

  // Search, filtering and sorting states
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'category' | 'title-asc' | 'title-desc' | 'views-desc'>('date-desc')

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

  // Scroll listener for infinite scroll (throttled)
  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        if (typeof window === 'undefined') return
        
        const threshold = 100
        const position = window.innerHeight + window.scrollY
        const height = document.documentElement.scrollHeight
        
        if (position >= height - threshold && hasMore && !loadingMore && !loading) {
          loadMoreNews()
        }
        ticking = false
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasMore, loadingMore, loading, newsItems.length])

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

  const performDelete = async (id: string) => {
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
    setNewsItems(prev => prev.map(item =>
      item.id === news.id ? { ...item, is_published: !item.is_published } : item
    ))
  }

  const togglePin = async (news: News) => {
    const result = await newsService.togglePinStatus(news.id)
    if (result.error) {
      alert(result.error)
      return
    }
    setNewsItems(prev => prev.map(item =>
      item.id === news.id ? { ...item, is_pinned: !item.is_pinned } : item
    ))
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
                <option value="views-desc">Most Viewed</option>
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
      <div className="grid gap-4 pb-24">
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
                      loading="lazy"
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
                      <span className="px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase bg-blue-100 text-blue-800 flex items-center gap-0.5">
                        👁 {item.view_count || 0}
                      </span>
                      <span suppressHydrationWarning className={`hidden sm:inline text-[10px] sm:text-xs ${colors.textSecondary}`} title={`Created: ${new Date(item.created_at).toLocaleString()}`}>
                        Created: {new Date(item.created_at).toLocaleDateString()}
                      </span>
                      <span suppressHydrationWarning className={`hidden sm:inline text-[10px] sm:text-xs ${colors.textSecondary}`} title={`Updated: ${new Date(item.updated_at).toLocaleString()}`}>
                        Updated: {new Date(item.updated_at).toLocaleDateString()}
                      </span>
                      {item.profiles && (
                        <span className={`hidden sm:inline text-[10px] sm:text-xs ${colors.textSecondary} font-semibold`} title={`Written by: ${item.profiles.full_name || item.profiles.email}`}>
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
                    <div className="flex gap-2">
                      <button
                        onClick={() => togglePublish(item)}
                        className={`w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg transition-colors duration-150 ${
                          item.is_published 
                            ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' 
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                        title={item.is_published ? 'Unpublish' : 'Publish'}
                      >
                        {item.is_published ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => togglePin(item)}
                        className={`w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg transition-colors duration-150 ${
                          item.is_pinned 
                            ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' 
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                        title={item.is_pinned ? 'Unpin' : 'Pin'}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                        </svg>
                      </button>
                      <Link
                        href={`/content/news/edit/${item.id}`}
                        className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-150"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => setDeleteItemId(item.id)}
                        className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center bg-red-55 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-150"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
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

      {deleteItemId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${colors.card} p-6 rounded-lg shadow-lg max-w-md w-full mx-auto`}>
            <h3 className={`text-xl font-semibold mb-4 ${colors.text}`}>Delete News Article?</h3>
            <p className={`${colors.text} mb-6 text-sm`}>
              Are you sure you want to permanently delete this news article? This will also remove its image from the storage bucket and cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={() => setDeleteItemId(null)}
                className="w-full sm:w-auto px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium transition-all"
              >
                Keep Article
              </button>
              <button
                onClick={async () => {
                  const id = deleteItemId
                  setDeleteItemId(null)
                  await performDelete(id)
                }}
                className="w-full sm:w-auto px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition-all"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
