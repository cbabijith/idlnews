'use client'

import { useEffect, useState, Suspense, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import supabase from '@idlnews/shared-supabase'
import { Header } from '@/components/Header'
import { BottomNavBar } from '@/components/BottomNavBar'
import { useThemeStore } from '@/store/themeStore'

interface NewsItem {
  id: string
  title: string
  content: string
  image_url?: string
  published_at?: string
  categories?: {
    name: string
    slug: string
  }
  profile?: {
    full_name?: string
  }
}

function withTimeout<T>(promise: Promise<T>, ms = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Connection timed out. Please try again.')), ms)
    )
  ]);
}

function SearchContent() {
  const { colors } = useThemeStore()
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [searchQuery, setSearchQuery] = useState(query)
  const [results, setResults] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [retryTrigger, setRetryTrigger] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search from server
  useEffect(() => {
    async function searchNews() {
      if (!searchQuery.trim()) {
        setResults([])
        setShowDropdown(false)
        return
      }

      setLoading(true)
      setError(null)
      setShowDropdown(true)
      try {
        const { data, error } = await withTimeout(
          Promise.resolve(
            supabase
              .from('news')
              .select('id, title, content, image_url, published_at, categories(name, slug), profiles(full_name)')
              .eq('is_published', true)
              .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
              .order('published_at', { ascending: false })
              .limit(10)
          ),
          8000
        )

        if (error) throw error
        setResults(data as unknown as NewsItem[])
      } catch (err) {
        console.error('Search failed:', err)
        setError(err instanceof Error ? err.message : 'Search failed. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(searchNews, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, retryTrigger])

  return (
    <div className={`min-h-screen ${colors.background} pb-[80px] md:pb-0`}>
      <Header />
      
      <main className="w-full max-w-container-max mx-auto px-margin-mobile md:px-gutter py-stack-md">
        {/* Search Input with Dropdown */}
        <div className="mb-6 relative" ref={dropdownRef}>
          <div className={`relative ${colors.surfaceContainerLowest} border ${colors.outlineVariant} rounded-xl`}>
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setShowDropdown(true)}
              placeholder="Search news..."
              className="w-full pl-12 pr-4 py-3 bg-transparent text-on-surface placeholder:text-on-surface-variant focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setResults([])
                  setShowDropdown(false)
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            )}
          </div>

          {/* Dropdown Results */}
          {showDropdown && (
            <div className={`absolute top-full left-0 right-0 mt-2 ${colors.surface} border ${colors.outlineVariant} rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto`}>
              {loading && (
                <div className="text-center py-8">
                  <p className="text-on-surface-variant">Searching...</p>
                </div>
              )}

              {error && (
                <div className="text-center py-8 px-4">
                  <p className="text-error mb-2 text-sm">{error}</p>
                  <button 
                    onClick={() => setRetryTrigger(prev => prev + 1)}
                    className="px-4 py-1.5 bg-button text-on-primary rounded-lg text-xs font-medium hover:opacity-90 transition-all shadow-sm"
                  >
                    Retry
                  </button>
                </div>
              )}

              {!loading && !error && searchQuery && results.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-on-surface-variant">No results found for "{searchQuery}"</p>
                </div>
              )}

              {!loading && !error && !searchQuery && (
                <div className="text-center py-8">
                  <p className="text-on-surface-variant">Enter a search term to find news</p>
                </div>
              )}

              {!loading && !error && results.length > 0 && (
                <div className="p-2">
                  <p className="text-on-surface-variant text-xs px-3 py-2">
                    Found {results.length} result{results.length !== 1 ? 's' : ''} for "{searchQuery}"
                  </p>
                  <div className="flex flex-col gap-1">
                    {results.map((item) => (
                      <Link
                        key={item.id}
                        href={`/news/${item.id}`}
                        onClick={() => setShowDropdown(false)}
                        className="block"
                      >
                        <article className={`flex gap-3 ${colors.surfaceContainerLowest} hover:bg-surface-container-high p-3 rounded-lg transition-colors`}>
                          {item.image_url && (
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                            />
                          )}
                          <div className="flex flex-col justify-between flex-1 min-w-0">
                            {item.categories && (
                              <span className="text-button font-label-caps text-label-caps text-xs">
                                {item.categories.name}
                              </span>
                            )}
                            <h4 className="font-label-category text-label-category text-on-surface line-clamp-2 leading-tight">
                              {item.title}
                            </h4>
                            {item.published_at && (
                              <span className="text-on-surface-variant text-xs">
                                {new Date(item.published_at).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric'
                                })}
                              </span>
                            )}
                          </div>
                        </article>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Full Results List */}
        {!showDropdown && results.length > 0 && (
          <div className="flex flex-col gap-4">
            <p className="text-on-surface-variant text-sm">
              Found {results.length} result{results.length !== 1 ? 's' : ''} for "{searchQuery}"
            </p>
            {results.map((item) => (
              <Link key={item.id} href={`/news/${item.id}`} className="block">
                <article className={`flex gap-4 ${colors.surfaceContainerLowest} border ${colors.outlineVariant} p-4 rounded-xl hover:shadow-md transition-shadow`}>
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex flex-col justify-between flex-1 min-w-0">
                    {item.categories && (
                      <span className="text-button font-label-caps text-label-caps text-xs">
                        {item.categories.name}
                      </span>
                    )}
                    <h4 className="font-label-category text-label-category text-on-surface line-clamp-2 leading-tight">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 text-on-surface-variant text-xs">
                      {item.published_at && (
                        <span>
                          {new Date(item.published_at).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric'
                          })}
                        </span>
                      )}
                      {item.profile?.full_name && (
                        <span>• {item.profile.full_name}</span>
                      )}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </main>

      <BottomNavBar />
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-on-surface">Loading...</p>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
