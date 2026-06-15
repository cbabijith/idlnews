'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import supabase from '@idlnews/shared-supabase'
import { Header } from '@/components/Header'
import { BreakingNewsTicker } from '@/components/BreakingNewsTicker'
import { CategoryBar } from '@/components/CategoryBar'
import { BottomNavBar } from '@/components/BottomNavBar'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { useThemeStore } from '@/store/themeStore'

interface Category {
  id: string
  name: string
  slug: string
}

interface NewsItem {
  id: string
  title: string
  content: string
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

export default function Home() {
  const { colors } = useThemeStore()
  const [categories, setCategories] = useState<Category[]>([])
  const [pinnedNews, setPinnedNews] = useState<NewsItem[]>([])
  const [recentNews, setRecentNews] = useState<NewsItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [categoriesRes, pinnedRes, recentRes] = await Promise.all([
          supabase.from('categories').select('*').order('name'),
          supabase.from('news').select('*, categories(name, slug), profiles(full_name, email)').eq('is_published', true).eq('is_pinned', true).order('published_at', { ascending: false }).limit(5),
          supabase.from('news').select('*, categories(name, slug), profiles(full_name, email)').eq('is_published', true).eq('is_pinned', false).order('published_at', { ascending: false }).limit(10)
        ])

        if (categoriesRes.error) throw categoriesRes.error
        if (pinnedRes.error) throw pinnedRes.error
        if (recentRes.error) throw recentRes.error

        setCategories(categoriesRes.data || [])
        setPinnedNews(pinnedRes.data || [])
        setRecentNews(recentRes.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    async function fetchFilteredNews() {
      try {
        let query = supabase
          .from('news')
          .select('id, title, content, description, image_url, youtube_link, published_at, is_pinned, categories(name, slug), profiles(full_name, email)')
          .eq('is_published', true)
          .order('published_at', { ascending: false })

        if (selectedCategory) {
          query = query.eq('category_id', selectedCategory)
        }

        const { data, error } = await query

        if (error) throw error
        
        const newsData = data as unknown as NewsItem[]
        
        // If category is selected, use latest news as featured
        // If "All" is selected, use pinned news as featured
        if (selectedCategory) {
          setRecentNews(newsData.filter(item => !item.is_pinned))
          setPinnedNews(newsData.filter(item => item.is_pinned))
        } else {
          // For "All", fetch pinned news separately
          const pinnedRes = await supabase
            .from('news')
            .select('id, title, content, description, image_url, youtube_link, published_at, is_pinned, categories(name, slug), profiles(full_name, email)')
            .eq('is_published', true)
            .eq('is_pinned', true)
            .order('published_at', { ascending: false })
            .limit(5)
          
          if (pinnedRes.error) throw pinnedRes.error
          setPinnedNews(pinnedRes.data as unknown as NewsItem[])
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-on-surface">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-error">Error: {error}</p>
      </div>
    )
  }

  const featuredNews = pinnedNews.length > 0 ? pinnedNews[0] : null
  const latestNews = recentNews

  return (
    <div className={`min-h-screen ${colors.background} pb-[80px] md:pb-0`}>
      <Header pinnedNews={pinnedNews} />
      <BreakingNewsTicker pinnedNews={pinnedNews} latestNews={recentNews} />
      <CategoryBar categories={categories} selectedCategory={selectedCategory} onCategorySelect={setSelectedCategory} />
      
      {/* Mobile Layout */}
      <main className="block md:hidden">
        {/* Featured News */}
        {featuredNews && (
          <section className="px-margin-mobile py-stack-md">
            <Link href={`/news/${featuredNews.id}`} className="block">
              <div className={`${colors.surfaceContainerLowest} border ${colors.outlineVariant} rounded-2xl overflow-hidden relative shadow-lg hover:shadow-xl transition-shadow duration-300`}>
                {featuredNews.image_url ? (
                  <>
                    {featuredNews.categories && (
                      <div className="absolute top-0 left-0 bg-button text-on-primary font-label-caps text-label-caps px-4 py-1.5 m-3 rounded-full z-10 shadow-md">
                        {featuredNews.categories.name}
                      </div>
                    )}
                    <img
                      src={featuredNews.image_url}
                      alt={featuredNews.title}
                      className="w-full h-56 object-cover"
                    />
                  </>
                ) : null}
                <div className="p-5">
                  {!featuredNews.image_url && featuredNews.categories && (
                    <div className="inline-block bg-button text-on-primary font-label-caps text-label-caps px-4 py-1.5 mb-3 rounded-full shadow-md">
                      {featuredNews.categories.name}
                    </div>
                  )}
                  <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-3 leading-tight">
                    {featuredNews.title}
                  </h2>
                  <div className="flex items-center gap-2 text-on-surface-variant text-xs mb-4">
                    {featuredNews.published_at && (
                      <span>
                        {new Date(featuredNews.published_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    )}
                    {featuredNews.profile?.full_name && (
                      <span>• {featuredNews.profile.full_name}</span>
                    )}
                    {!featuredNews.profile?.full_name && featuredNews.profile?.email && (
                      <span>• {featuredNews.profile.email}</span>
                    )}
                    {!featuredNews.profile?.full_name && !featuredNews.profile?.email && (
                      <span>• IDL News Admin</span>
                    )}
                  </div>
                  {featuredNews.content && (
                    <p className="font-body-md text-body-md text-on-surface-variant mb-5 line-clamp-2">
                      {featuredNews.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                    </p>
                  )}
                  <button className="bg-button text-on-primary font-label-category text-label-category px-6 py-2.5 rounded-xl flex items-center justify-center w-full active:scale-95 transition-all shadow-md hover:shadow-lg hover:bg-button-hover">
                    Read More
                  </button>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* Latest News List */}
        <section className="px-margin-mobile pb-stack-lg">
          <h3 className="font-headline-md text-headline-md-mobile text-on-surface mb-stack-sm flex items-center border-l-4 border-button pl-3">
            Latest Stories
          </h3>
          <div className="flex flex-col gap-stack-sm">
            {latestNews.length > 0 ? (
              latestNews.map((item) => (
                <Link key={item.id} href={`/news/${item.id}`} className="block">
                  <article className={`flex gap-4 ${colors.surfaceContainerLowest} border ${colors.outlineVariant} p-3 rounded-xl hover:shadow-md transition-shadow duration-300`}>
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex flex-col justify-between flex-1 min-w-0">
                      {item.categories && (
                        <span className="text-button font-label-caps text-label-caps">
                          {item.categories.name}
                        </span>
                      )}
                      <h4 className="font-label-category text-label-category text-on-surface line-clamp-2 leading-tight">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2 text-on-surface-variant text-[10px]">
                        {item.published_at && (
                          <span>
                            {new Date(item.published_at).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        )}
                        {item.profile?.full_name && (
                          <span>• {item.profile.full_name}</span>
                        )}
                        {!item.profile?.full_name && item.profile?.email && (
                          <span>• {item.profile.email}</span>
                        )}
                        {!item.profile?.full_name && !item.profile?.email && (
                          <span>• IDL News Admin</span>
                        )}
                      </div>
                    </div>
                  </article>
                </Link>
              ))
            ) : (
              <p className={colors.onSurfaceVariant + " text-center py-8"}>No news items found</p>
            )}
          </div>
        </section>
      </main>

      {/* Desktop Layout - 3 Column */}
      <main className="hidden md:block max-w-container-max mx-auto px-4 md:px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Latest News (3 cols) */}
          <div className="col-span-3">
            <h3 className="font-headline-md text-on-surface mb-4 flex items-center border-l-4 border-button pl-3">
              ഏറ്റവും പുതിയ വാർത്തകൾ
            </h3>
            <div className="flex flex-col gap-3">
              {latestNews.slice(0, 10).map((item) => (
                <Link key={item.id} href={`/news/${item.id}`} className="block">
                  <article className={`p-4 rounded-xl ${colors.surfaceContainerLowest} border ${colors.outlineVariant} hover:shadow-md transition-shadow duration-300`}>
                    {item.categories && (
                      <span className="text-button font-label-caps text-label-caps text-xs">
                        {item.categories.name}
                      </span>
                    )}
                    <h4 className="font-label-category text-label-category text-on-surface line-clamp-2 mt-1 leading-tight">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 text-on-surface-variant text-xs mt-2">
                      {item.published_at && (
                        <span>
                          {new Date(item.published_at).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      )}
                      {item.profile?.full_name && (
                        <span>• {item.profile.full_name}</span>
                      )}
                      {!item.profile?.full_name && item.profile?.email && (
                        <span>• {item.profile.email}</span>
                      )}
                      {!item.profile?.full_name && !item.profile?.email && (
                        <span>• IDL News Admin</span>
                      )}
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>

          {/* Middle Column - Featured News (6 cols) */}
          <div className="col-span-6">
            {featuredNews && (
              <Link href={`/news/${featuredNews.id}`} className="block">
                <div className={`${colors.surfaceContainerLowest} border ${colors.outlineVariant} rounded-2xl overflow-hidden relative shadow-lg hover:shadow-xl transition-shadow duration-300`}>
                  {featuredNews.image_url ? (
                    <>
                      {featuredNews.categories && (
                        <div className="absolute top-0 left-0 bg-button text-on-primary font-label-caps text-label-caps px-4 py-1.5 m-4 rounded-full z-10 shadow-md">
                          {featuredNews.categories.name}
                        </div>
                      )}
                      <img
                        src={featuredNews.image_url}
                        alt={featuredNews.title}
                        className="w-full h-96 object-cover"
                      />
                    </>
                  ) : null}
                  <div className="p-6">
                    {!featuredNews.image_url && featuredNews.categories && (
                      <div className="inline-block bg-button text-on-primary font-label-caps text-label-caps px-4 py-1.5 mb-3 rounded-full shadow-md">
                        {featuredNews.categories.name}
                      </div>
                    )}
                    <h2 className="font-headline-lg text-headline-lg text-on-surface mb-3 leading-tight">
                      {featuredNews.title}
                    </h2>
                    <div className="flex items-center gap-2 text-on-surface-variant text-sm mb-4">
                      {featuredNews.published_at && (
                        <span>
                          {new Date(featuredNews.published_at).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      )}
                      {featuredNews.profile?.full_name && (
                        <span>• {featuredNews.profile.full_name}</span>
                      )}
                      {!featuredNews.profile?.full_name && featuredNews.profile?.email && (
                        <span>• {featuredNews.profile.email}</span>
                      )}
                      {!featuredNews.profile?.full_name && !featuredNews.profile?.email && (
                        <span>• IDL News Admin</span>
                      )}
                    </div>
                    {featuredNews.content && (
                      <p className="font-body-lg text-body-lg text-on-surface-variant mb-4 line-clamp-3">
                        {featuredNews.content.replace(/<[^>]*>/g, '').substring(0, 200)}...
                      </p>
                    )}
                    <button className="bg-button text-on-primary font-label-category text-label-category px-8 py-3 rounded-xl hover:bg-button-hover transition-all shadow-md hover:shadow-lg">
                      കൂടുതൽ വായിക്കുക
                    </button>
                  </div>
                </div>
              </Link>
            )}
          </div>

          {/* Right Column - Trending/Multimedia (3 cols) */}
          <div className="col-span-3">
            <h3 className="font-headline-md text-on-surface mb-4 flex items-center border-l-4 border-button pl-3">
              ട്രെൻഡിംഗ് / മൾട്ടിമീഡിയ
            </h3>
            <div className="flex flex-col gap-4">
              {pinnedNews.slice(1, 6).map((item) => (
                <Link key={item.id} href={`/news/${item.id}`} className="block">
                  <article className={`${colors.surfaceContainerLowest} border ${colors.outlineVariant} rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-300`}>
                    <div className="relative">
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-32 object-cover"
                        />
                      )}
                      {item.youtube_link && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <span className="material-symbols-outlined text-white text-4xl">play_circle</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      {item.categories && (
                        <span className="text-button font-label-caps text-label-caps text-xs">
                          {item.categories.name}
                        </span>
                      )}
                      <h4 className="font-label-category text-label-category text-on-surface line-clamp-2 mt-1 leading-tight">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2 text-on-surface-variant text-xs mt-2">
                        {item.published_at && (
                          <span>
                            {new Date(item.published_at).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        )}
                        {item.profile?.full_name && (
                          <span>• {item.profile.full_name}</span>
                        )}
                        {!item.profile?.full_name && item.profile?.email && (
                          <span>• {item.profile.email}</span>
                        )}
                        {!item.profile?.full_name && !item.profile?.email && (
                          <span>• IDL News Admin</span>
                        )}
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <BottomNavBar />
      <WhatsAppButton />
    </div>
  )
}
