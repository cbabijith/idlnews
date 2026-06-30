'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import supabase from '@idlnews/shared-supabase'
import { Header } from '@/components/Header'
import { BreakingNewsTicker } from '@/components/BreakingNewsTicker'
import { CategoryBar } from '@/components/CategoryBar'
import { BottomNavBar } from '@/components/BottomNavBar'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { AdBanner } from '@/components/AdBanner'
import { NewsCardShimmer, FeaturedNewsShimmer, DesktopFeaturedShimmer, SidebarNewsShimmer, TrendingCardShimmer, ShimmerBox } from '@/components/Shimmer'
import { Footer } from '@/components/Footer'
import { useThemeStore } from '@/store/themeStore'

interface Category {
  id: string
  name: string
  slug: string
}

interface NewsItem {
  id: string
  title: string
  content?: string
  image_url?: string
  youtube_link?: string
  published_at?: string
  is_pinned?: boolean
  created_by?: string
  categories?: {
    name: string
    slug: string
  }
  profile?: {
    full_name?: string
    email?: string
  }
}

function withTimeout<T>(promise: Promise<T>, ms = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Connection timed out. The database might be waking up or your network is slow. Please try again.')), ms)
    )
  ])
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <Header />
        <div className="h-10 bg-surface-container border-b border-outline-variant" />
        <div className="flex gap-2 px-4 py-3 overflow-hidden">
          {[1,2,3,4,5].map(i => <ShimmerBox key={i} className="h-8 w-24 rounded-full flex-shrink-0" />)}
        </div>
        <main className="block md:hidden px-4 py-4">
          <FeaturedNewsShimmer />
          <div className="mt-6 flex flex-col gap-3">
            {[1,2,3,4,5].map(i => <NewsCardShimmer key={i} />)}
          </div>
        </main>
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}

function HomeContent() {
  const { colors } = useThemeStore()
  const searchParams = useSearchParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [pinnedNews, setPinnedNews] = useState<NewsItem[]>([])
  const [recentNews, setRecentNews] = useState<NewsItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get('category'))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryTrigger, setRetryTrigger] = useState(0)
  const hasFetchedRef = useRef(false)

  useEffect(() => {
    const cat = searchParams.get('category')
    setSelectedCategory(cat)
  }, [searchParams])

  useEffect(() => {
    async function fetchData() {
      if (!hasFetchedRef.current) {
        setLoading(true)
      }
      setError(null)
      try {
        const [categoriesRes, pinnedRes, recentRes] = await withTimeout(
          Promise.all([
            supabase.from('categories').select('id, name, slug').order('name'),
            supabase.from('news').select('id, title, image_url, youtube_link, published_at, is_pinned, categories(name, slug), profiles(full_name, email)').eq('is_published', true).eq('is_pinned', true).order('published_at', { ascending: false }).limit(5),
            supabase.from('news').select('id, title, image_url, youtube_link, published_at, is_pinned, categories(name, slug), profiles(full_name, email)').eq('is_published', true).eq('is_pinned', false).order('published_at', { ascending: false }).limit(10)
          ]),
          5000
        )

        if (categoriesRes.error) throw categoriesRes.error
        if (pinnedRes.error) throw pinnedRes.error
        if (recentRes.error) throw recentRes.error

        setCategories(categoriesRes.data || [])
        setPinnedNews((pinnedRes.data || []) as unknown as NewsItem[])
        setRecentNews((recentRes.data || []) as unknown as NewsItem[])
        hasFetchedRef.current = true
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [retryTrigger])

  const skipFilterRef = useRef(true)

  useEffect(() => {
    if (skipFilterRef.current) {
      skipFilterRef.current = false
      return
    }

    async function fetchFilteredNews() {
      try {
        let query = supabase
          .from('news')
          .select('id, title, image_url, youtube_link, published_at, is_pinned, categories(name, slug), profiles(full_name, email)')
          .eq('is_published', true)
          .order('published_at', { ascending: false })
          .limit(15)

        if (selectedCategory) {
          query = query.eq('category_id', selectedCategory)
        }

        const { data, error } = await withTimeout(
          Promise.resolve(query),
          5000
        ) as { data: NewsItem[] | null; error: any }

        if (error) throw error
        
        const newsData = data as unknown as NewsItem[]
        
        if (selectedCategory) {
          setRecentNews(newsData.filter(item => !item.is_pinned))
          setPinnedNews(newsData.filter(item => item.is_pinned))
        } else {
          setPinnedNews(newsData.filter(item => item.is_pinned))
          setRecentNews(newsData.filter(item => !item.is_pinned).slice(0, 10))
        }
      } catch (err) {
        console.error('Failed to filter news:', err)
      }
    }

    fetchFilteredNews()
  }, [selectedCategory])

  if (loading) {
    return (
      <div className={`min-h-screen ${colors.background}`}>
        <Header />
        <BreakingNewsTicker />
        <div className="flex gap-2 px-4 py-3 overflow-hidden no-scrollbar">
          {[1,2,3,4,5].map(i => <ShimmerBox key={i} className="h-7 w-20 rounded-full flex-shrink-0" />)}
        </div>
        <main className="px-4 py-4 flex flex-col gap-4">
          <ShimmerBox className="w-full aspect-[16/9] rounded-xl" />
          <div className="flex flex-col gap-3">
            <ShimmerBox className="h-5 w-3/4 rounded" />
            <ShimmerBox className="h-3 w-1/2 rounded" />
          </div>
          <div className="flex flex-col gap-3 mt-2">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex gap-3">
                <ShimmerBox className="w-20 h-20 rounded-lg flex-shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <ShimmerBox className="h-3 w-1/4 rounded" />
                  <ShimmerBox className="h-4 w-full rounded" />
                  <ShimmerBox className="h-3 w-1/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        </main>
        <BottomNavBar />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center gap-4">
        <span className="material-symbols-outlined text-6xl text-on-surface-variant opacity-40">error_outline</span>
        <p className="text-on-surface-variant max-w-md text-sm">{error}</p>
        <button
          onClick={() => setRetryTrigger(prev => prev + 1)}
          className="px-5 py-2.5 bg-button text-on-primary rounded-lg font-medium hover:bg-button-hover transition-all text-sm"
        >
          Retry
        </button>
      </div>
    )
  }

  const featuredNews = pinnedNews.length > 0 ? pinnedNews[0] : null
  const latestNews = recentNews

  const getAuthorName = (item: NewsItem) => item.profile?.full_name || item.profile?.email || 'IDL News'
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div className={`min-h-screen ${colors.background}`}>
      <Header pinnedNews={pinnedNews} />
      <BreakingNewsTicker pinnedNews={pinnedNews} latestNews={recentNews} />
      <CategoryBar categories={categories} selectedCategory={selectedCategory} onCategorySelect={setSelectedCategory} />

      {/* Mobile Layout */}
      <main className="md:hidden">
        {/* Featured News - Hero Card */}
        {featuredNews && (
          <section className="px-4 pt-4">
            <Link href={`/news/${featuredNews.id}`} className="block group">
              {featuredNews.image_url ? (
                <div className="relative rounded-xl overflow-hidden">
                  <img
                    src={featuredNews.image_url}
                    alt={featuredNews.title}
                    className="w-full aspect-[16/10] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    {featuredNews.categories && (
                      <span className="inline-block bg-secondary text-white text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded mb-2">
                        {featuredNews.categories.name}
                      </span>
                    )}
                    <h2 className="text-white text-[20px] font-bold leading-snug line-clamp-3">
                      {featuredNews.title}
                    </h2>
                    {featuredNews.published_at && (
                      <p className="text-white/70 text-[11px] mt-1.5">
                        {formatDate(featuredNews.published_at)} • {getAuthorName(featuredNews)}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-surface-container rounded-xl p-4">
                  {featuredNews.categories && (
                    <span className="inline-block bg-secondary text-white text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded mb-2">
                      {featuredNews.categories.name}
                    </span>
                  )}
                  <h2 className="text-on-surface text-[20px] font-bold leading-snug">
                    {featuredNews.title}
                  </h2>
                  {featuredNews.published_at && (
                    <p className="text-on-surface-variant text-[11px] mt-1.5">
                      {formatDate(featuredNews.published_at)} • {getAuthorName(featuredNews)}
                    </p>
                  )}
                </div>
              )}
            </Link>
          </section>
        )}

        {/* Secondary Pinned News - Horizontal scroll */}
        {pinnedNews.length > 1 && (
          <section className="pt-5">
            <div className="flex items-center justify-between px-4 mb-2.5">
              <h3 className="text-on-surface text-[14px] font-bold flex items-center gap-2">
                <span className="w-1 h-4 bg-secondary rounded-full"></span>
                തിരഞ്ഞെടുത്ത വാർത്തകൾ
              </h3>
              <span className="text-on-surface-variant text-[10px] flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              </span>
            </div>
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar px-4 pb-2 scroll-smooth">
              {pinnedNews.slice(1).map((item) => (
                <Link key={item.id} href={`/news/${item.id}`} className="flex-shrink-0 w-[160px] group">
                  <div className="relative rounded-xl overflow-hidden bg-surface-container">
                    {item.image_url ? (
                      <>
                        <img src={item.image_url} alt={item.title} className="w-full h-[100px] object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        {item.youtube_link && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-3xl drop-shadow-lg">play_circle</span>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-2">
                          {item.categories && (
                            <span className="text-white/90 text-[9px] font-semibold uppercase tracking-wide block mb-0.5">
                              {item.categories.name}
                            </span>
                          )}
                          <h4 className="text-white text-[12px] font-medium line-clamp-2 leading-snug">
                            {item.title}
                          </h4>
                        </div>
                      </>
                    ) : (
                      <div className="p-3 min-h-[100px] flex flex-col justify-between">
                        {item.categories && (
                          <span className="text-button text-[9px] font-semibold uppercase tracking-wide">
                            {item.categories.name}
                          </span>
                        )}
                        <h4 className="text-on-surface text-[12px] font-medium line-clamp-3 leading-snug group-hover:text-button transition-colors">
                          {item.title}
                        </h4>
                        {item.published_at && (
                          <span className="text-on-surface-variant text-[9px]">
                            {formatDate(item.published_at)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {item.image_url && item.published_at && (
                    <span className="text-on-surface-variant text-[9px] mt-1 block px-0.5">
                      {formatDate(item.published_at)}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Ad Banner */}
        <section className="px-4 pt-4 pb-2">
          <AdBanner maxAds={3} />
        </section>

        {/* Latest News List */}
        <section className="px-4 pb-8">
          <h3 className="text-on-surface text-[16px] font-bold mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-button rounded-full"></span>
            ഏറ്റവും പുതിയ വാർത്തകൾ
          </h3>
          <div className="flex flex-col">
            {latestNews.length > 0 ? (
              latestNews.map((item, index) => (
                <Link key={item.id} href={`/news/${item.id}`} className="block group">
                  <div className={`flex gap-3 py-3 ${index !== latestNews.length - 1 ? 'border-b border-outline-variant' : ''}`}>
                    {item.image_url && (
                      <div className="relative flex-shrink-0">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-[72px] h-[72px] object-cover rounded-lg"
                        />
                        {item.youtube_link && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                            <span className="material-symbols-outlined text-white text-2xl">play_circle</span>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex flex-col justify-center flex-1 min-w-0 gap-1">
                      {item.categories && (
                        <span className="text-secondary text-[10px] font-semibold uppercase tracking-wide">
                          {item.categories.name}
                        </span>
                      )}
                      <h4 className="text-[14px] font-medium text-on-surface line-clamp-2 leading-snug group-hover:text-button transition-colors">
                        {item.title}
                      </h4>
                      {item.published_at && (
                        <span className="text-on-surface-variant text-[10px] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[11px]">schedule</span>
                          {formatDate(item.published_at)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-on-surface-variant text-center py-8 text-sm">വാർത്തകൾ ഇല്ല</p>
            )}
          </div>
        </section>
      </main>

      {/* Desktop Layout - 3 Column */}
      <main className="hidden md:block max-w-[1200px] mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Latest News (3 cols) */}
          <div className="col-span-3">
            <h3 className="text-on-surface text-[16px] font-bold mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-button rounded-full"></span>
              ഏറ്റവും പുതിയ വാർത്തകൾ
            </h3>
            <div className="flex flex-col gap-2">
              {latestNews.slice(0, 10).map((item) => (
                <Link key={item.id} href={`/news/${item.id}`} className="block group">
                  <div className="p-3 rounded-lg hover:bg-surface-container transition-colors">
                    {item.categories && (
                      <span className="text-button text-[10px] font-semibold uppercase tracking-wide">
                        {item.categories.name}
                      </span>
                    )}
                    <h4 className="text-[13px] font-medium text-on-surface line-clamp-2 mt-1 leading-snug group-hover:text-button transition-colors">
                      {item.title}
                    </h4>
                    {item.published_at && (
                      <span className="text-on-surface-variant text-[10px] mt-1 block">
                        {formatDate(item.published_at)} • {getAuthorName(item)}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Middle Column - Featured News (6 cols) */}
          <div className="col-span-6">
            {featuredNews && (
              <Link href={`/news/${featuredNews.id}`} className="block group">
                {featuredNews.image_url ? (
                  <div className="relative rounded-xl overflow-hidden">
                    <img
                      src={featuredNews.image_url}
                      alt={featuredNews.title}
                      className="w-full h-96 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      {featuredNews.categories && (
                        <span className="inline-block bg-secondary text-white text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded mb-2">
                          {featuredNews.categories.name}
                        </span>
                      )}
                      <h2 className="text-white text-[28px] font-bold leading-snug">
                        {featuredNews.title}
                      </h2>
                      {featuredNews.published_at && (
                        <p className="text-white/70 text-sm mt-2">
                          {formatDate(featuredNews.published_at)} • {getAuthorName(featuredNews)}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-surface-container rounded-xl p-6">
                    {featuredNews.categories && (
                      <span className="inline-block bg-secondary text-white text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded mb-3">
                        {featuredNews.categories.name}
                      </span>
                    )}
                    <h2 className="text-on-surface text-[28px] font-bold leading-snug">
                      {featuredNews.title}
                    </h2>
                    {featuredNews.published_at && (
                      <p className="text-on-surface-variant text-sm mt-2">
                        {formatDate(featuredNews.published_at)} • {getAuthorName(featuredNews)}
                      </p>
                    )}
                  </div>
                )}
              </Link>
            )}
          </div>

          {/* Right Column - Trending (3 cols) */}
          <div className="col-span-3">
            <h3 className="text-on-surface text-[16px] font-bold mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-secondary rounded-full"></span>
              ട്രെൻഡിംഗ്
            </h3>
            <div className="flex flex-col gap-3">
              {pinnedNews.slice(1, 6).map((item) => (
                <Link key={item.id} href={`/news/${item.id}`} className="block group">
                  <article className="rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-300 bg-surface-container">
                    {item.image_url && (
                      <div className="relative">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-32 object-cover"
                        />
                        {item.youtube_link && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <span className="material-symbols-outlined text-white text-4xl">play_circle</span>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="p-3">
                      {item.categories && (
                        <span className="text-button text-[10px] font-semibold uppercase tracking-wide">
                          {item.categories.name}
                        </span>
                      )}
                      <h4 className="text-[13px] font-medium text-on-surface line-clamp-2 mt-1 leading-snug group-hover:text-button transition-colors">
                        {item.title}
                      </h4>
                      {item.published_at && (
                        <span className="text-on-surface-variant text-[10px] mt-1 block">
                          {formatDate(item.published_at)}
                        </span>
                      )}
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            <div className="mt-6">
              <AdBanner maxAds={3} />
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <BottomNavBar />
      <WhatsAppButton />
    </div>
  )
}
