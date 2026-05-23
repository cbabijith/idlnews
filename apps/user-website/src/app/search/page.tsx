'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import supabase from '@sngnews/shared-supabase'
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

function SearchContent() {
  const { colors } = useThemeStore()
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [searchQuery, setSearchQuery] = useState(query)
  const [results, setResults] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(false)
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Update URL when debounced query changes
  useEffect(() => {
    if (debouncedQuery) {
      const url = new URL(window.location.href)
      url.searchParams.set('q', debouncedQuery)
      window.history.replaceState({}, '', url)
    }
  }, [debouncedQuery])

  // Search from server
  useEffect(() => {
    async function searchNews() {
      if (!debouncedQuery.trim()) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('news')
          .select('id, title, content, image_url, published_at, categories(name, slug), profiles(full_name)')
          .eq('is_published', true)
          .or(`title.ilike.%${debouncedQuery}%,content.ilike.%${debouncedQuery}%`)
          .order('published_at', { ascending: false })
          .limit(20)

        if (error) throw error
        setResults(data as unknown as NewsItem[])
      } catch (err) {
        console.error('Search failed:', err)
      } finally {
        setLoading(false)
      }
    }

    searchNews()
  }, [debouncedQuery])

  return (
    <div className={`min-h-screen ${colors.background} pb-[80px] md:pb-0`}>
      <Header />
      
      <main className="w-full max-w-container-max mx-auto px-margin-mobile md:px-gutter py-stack-md">
        {/* Search Input */}
        <div className="mb-6">
          <div className={`relative ${colors.surfaceContainerLowest} border ${colors.outlineVariant} rounded-lg`}>
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news..."
              className="w-full pl-12 pr-4 py-3 bg-transparent text-on-surface placeholder:text-on-surface-variant focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Search Results */}
        {loading && (
          <div className="text-center py-8">
            <p className="text-on-surface-variant">Searching...</p>
          </div>
        )}

        {!loading && debouncedQuery && results.length === 0 && (
          <div className="text-center py-8">
            <p className="text-on-surface-variant">No results found for "{debouncedQuery}"</p>
          </div>
        )}

        {!loading && !debouncedQuery && (
          <div className="text-center py-8">
            <p className="text-on-surface-variant">Enter a search term to find news</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="flex flex-col gap-4">
            <p className="text-on-surface-variant text-sm">
              Found {results.length} result{results.length !== 1 ? 's' : ''} for "{debouncedQuery}"
            </p>
            {results.map((item) => (
              <Link key={item.id} href={`/news/${item.id}`} className="block">
                <article className={`flex gap-4 ${colors.surfaceContainerLowest} border ${colors.outlineVariant} p-4 rounded-lg hover:shadow-md transition-shadow`}>
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-24 h-24 object-cover rounded flex-shrink-0"
                    />
                  )}
                  <div className="flex flex-col justify-between flex-1 min-w-0">
                    {item.categories && (
                      <span className="text-primary font-label-caps text-label-caps text-xs">
                        {item.categories.name}
                      </span>
                    )}
                    <h4 className="font-label-category text-label-category text-on-surface line-clamp-2">
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
