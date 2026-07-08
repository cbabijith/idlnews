'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import supabase from '@idlnews/shared-supabase'
import { Header } from '@/components/Header'
import { BottomNavBar } from '@/components/BottomNavBar'
import { ShareButton } from '@/components/ShareButton'
import { AdBanner } from '@/components/AdBanner'
import { ShimmerBox } from '@/components/Shimmer'
import { Footer } from '@/components/Footer'
import { useThemeStore } from '@/store/themeStore'

interface NewsItem {
  id: string
  title: string
  content: string
  description?: string
  image_url?: string
  youtube_link?: string
  published_at?: string
  is_pinned?: boolean
  view_count?: number
  categories?: {
    name: string
    slug: string
  }
  profile?: {
    full_name?: string
  }
}

interface RelatedNews {
  id: string
  title: string
  image_url?: string
  published_at?: string
  categories?: {
    name: string
  }
}

function withTimeout<T>(promise: Promise<T>, ms = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Connection timed out. The database might be waking up or your network is slow. Please try again.')), ms)
    )
  ]);
}

export default function NewsDetailPage() {
  const { colors } = useThemeStore()
  const params = useParams()
  const router = useRouter()
  const [news, setNews] = useState<NewsItem | null>(null)
  const [relatedNews, setRelatedNews] = useState<RelatedNews[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryTrigger, setRetryTrigger] = useState(0)
  const viewCountedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    async function fetchNews() {
      setLoading(true)
      setError(null)
      try {
        const { data, error } = await withTimeout(
          Promise.resolve(
            supabase
              .from('news')
              .select('id, title, content, description, image_url, youtube_link, published_at, is_pinned, view_count, categories(name, slug), profiles(full_name)')
              .eq('id', params.id)
              .eq('is_published', true)
              .single()
          ),
          5000
        )

        if (error) throw error
        const newsData = data as unknown as NewsItem
        setNews(newsData)

        // Increment view count only once per news ID (prevents double counting in dev mode)
        const newsId = params.id as string
        if (newsId && !viewCountedRef.current.has(newsId)) {
          viewCountedRef.current.add(newsId)
          supabase.rpc('increment_news_view', { news_id: newsId }).then(({ error: rpcError }) => {
            if (rpcError) console.error('Failed to increment view:', rpcError)
          })
        }

        // Fetch related news from same category
        if (newsData.categories?.slug) {
          const { data: related } = await supabase
            .from('news')
            .select('id, title, image_url, published_at, categories(name)')
            .eq('is_published', true)
            .neq('id', newsId)
            .order('published_at', { ascending: false })
            .limit(4)
          if (related) setRelatedNews(related as unknown as RelatedNews[])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load news')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchNews()
    }
  }, [params.id, retryTrigger])

  const handleShare = async () => {
    if (typeof window === 'undefined' || !news) return

    const category = news.categories?.name || 'ബ്രേക്കിംഗ് ന്യൂസ്'

    const newsUrl = window.location.href
    const publishedDate = news.published_at
      ? new Date(news.published_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : ''

    const shareText = `📰 *IDL NEWS* | ${category}

✍️ *${news.title}*

👉 *മുഴുവൻ വാർത്ത വായിക്കാൻ:*
${newsUrl}

📅 ${publishedDate}

━━━━━━━━━━━━━━━

📲 *IDL NEWS വാട്സ്ആപ്പ് ചാനലിൽ ചേരൂ*

കേരളത്തിലെയും ലോകത്തെയും പ്രധാന വാർത്തകൾ, ബ്രേക്കിംഗ് അപ്ഡേറ്റുകൾ, പ്രത്യേക റിപ്പോർട്ടുകൾ എന്നിവ അതിവേഗം ലഭിക്കാൻ ഞങ്ങളുടെ വാട്സ്ആപ്പ് ചാനലിൽ ഇപ്പോൾ തന്നെ ജോയിൻ ചെയ്യൂ

👇 *ചാനലിൽ ചേരാൻ*
https://chat.whatsapp.com/B6JGw1jqCMeFBABRYql9MV?mode=ems_copy_t

━━━━━━━━━━━━━━━
*IDL NEWS*
സത്യസന്ധവും വേഗമേറിയതുമായ വാർത്തകൾ 🌐 www.idlnews.com`

    const fallbackToWhatsApp = () => {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`
      window.open(whatsappUrl, '_blank')
    }

    const canShareFiles = typeof navigator !== 'undefined' && typeof navigator.share === 'function' && typeof navigator.canShare === 'function'

    if (canShareFiles && news.image_url) {
      try {
        const response = await fetch(news.image_url)
        const blob = await response.blob()
        const file = new File([blob], 'idlnews.jpg', { type: blob.type || 'image/jpeg' })

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            text: shareText,
            files: [file],
          })
          return
        }
      } catch (err) {
        console.error('Web Share with image failed, falling back:', err)
      }
    }

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ text: shareText })
        return
      } catch (err) {
        console.error('Web Share text failed, falling back:', err)
      }
    }

    fallbackToWhatsApp()
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${colors.background}`}>
        <Header />
        <main className="w-full max-w-[700px] mx-auto px-4 md:px-6 pt-4 pb-8 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <ShimmerBox className="h-4 w-4 rounded" />
            <ShimmerBox className="h-3 w-16 rounded" />
          </div>
          <div className="flex flex-col gap-2">
            <ShimmerBox className="h-5 w-full rounded" />
            <ShimmerBox className="h-5 w-4/5 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <ShimmerBox className="h-3 w-24 rounded" />
            <ShimmerBox className="h-3 w-16 rounded" />
          </div>
          <ShimmerBox className="w-full aspect-[16/9] rounded-xl" />
          <div className="flex flex-col gap-2.5 mt-2">
            <ShimmerBox className="h-3.5 w-full rounded" />
            <ShimmerBox className="h-3.5 w-full rounded" />
            <ShimmerBox className="h-3.5 w-11/12 rounded" />
            <ShimmerBox className="h-3.5 w-full rounded" />
            <ShimmerBox className="h-3.5 w-3/4 rounded" />
          </div>
        </main>
        <BottomNavBar />
      </div>
    )
  }

  if (error || !news) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center gap-4">
        <span className="material-symbols-outlined text-6xl text-on-surface-variant opacity-40">error_outline</span>
        <p className="text-on-surface-variant max-w-md text-sm">{error || 'News article not found'}</p>
        <div className="flex gap-3">
          <button
            onClick={() => setRetryTrigger(prev => prev + 1)}
            className="px-5 py-2.5 bg-button text-on-primary rounded-lg font-medium hover:bg-button-hover transition-all text-sm"
          >
            Retry
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-5 py-2.5 border border-outline-variant text-on-surface rounded-lg font-medium hover:bg-surface-container transition-all text-sm"
          >
            Home
          </button>
        </div>
      </div>
    )
  }

  const formattedDate = news.published_at
    ? new Date(news.published_at).toLocaleDateString('ml-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : ''

  const authorName = news.profile?.full_name || 'സ്റ്റാഫ് റിപ്പോർട്ടർ'
  const formatDateShort = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div className={`min-h-screen ${colors.background}`}>
      <Header />
      
      <main className="w-full max-w-[700px] mx-auto px-4 md:px-6 pt-3 md:pt-5 pb-8 flex flex-col gap-3 md:gap-4">
        {/* Back + Category Row */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 text-on-surface-variant text-[12px] font-medium hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            തിരികെ
          </button>
          {news.categories && (
            <span className="text-secondary text-[10px] font-semibold uppercase tracking-wide">
              {news.categories.name}
            </span>
          )}
        </div>

        {/* Headline */}
        <h1 className="text-[20px] md:text-[28px] font-bold leading-[1.35] text-on-surface">
          {news.title}
        </h1>

        {/* Metadata Row */}
        <div className="flex items-center gap-2 text-[11px] text-on-surface-variant">
          {news.published_at && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">schedule</span>
              {formattedDate}
            </span>
          )}
          <span className="w-1 h-1 rounded-full bg-outline"></span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">person</span>
            {authorName}
          </span>
          {news.view_count !== undefined && news.view_count > 0 && (
            <>
              <span className="w-1 h-1 rounded-full bg-outline"></span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">visibility</span>
                {news.view_count}
              </span>
            </>
          )}
        </div>

        {/* Featured Image */}
        {news.image_url && (
          <div className="w-full rounded-xl overflow-hidden bg-surface-container mt-1">
            <img
              alt={news.title}
              className="w-full h-auto max-h-[600px] object-contain"
              src={news.image_url}
            />
          </div>
        )}

        {/* YouTube Video */}
        {news.youtube_link && (
          <div className="w-full aspect-video rounded-xl overflow-hidden bg-black mt-1">
            <iframe
              className="w-full h-full"
              src={news.youtube_link.replace('watch?v=', 'embed/')}
              title={news.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* Article Content */}
        <article className="w-full mt-2">
          {news.description && (
            <div className="border-l-[3px] border-secondary pl-4 mb-5">
              <p className="font-semibold text-on-surface text-[15px] md:text-[16px] leading-relaxed" style={{ textAlign: 'justify', textAlignLast: 'left', textJustify: 'inter-word', wordSpacing: '0.05em' }}>{news.description}</p>
            </div>
          )}
          {news.content && (
            <div dangerouslySetInnerHTML={{ __html: news.content }} />
          )}
        </article>

        {/* Ad Banners */}
        <div className="w-full pt-2">
          <AdBanner maxAds={3} />
        </div>

        {/* Related Articles */}
        {relatedNews.length > 0 && (
          <section className="w-full pt-4">
            <h3 className="text-on-surface text-[14px] font-bold mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-button rounded-full"></span>
              ബന്ധപ്പെട്ട വാർത്തകൾ
            </h3>
            <div className="flex flex-col">
              {relatedNews.map((item, index) => (
                <Link key={item.id} href={`/news/${item.id}`} className="block group">
                  <div className={`flex gap-3 py-2.5 ${index !== relatedNews.length - 1 ? 'border-b border-outline-variant' : ''}`}>
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-14 h-14 object-cover rounded-md flex-shrink-0"
                      />
                    )}
                    <div className="flex flex-col justify-center flex-1 min-w-0 gap-1">
                      <h4 className="text-[13px] font-medium text-on-surface line-clamp-2 leading-snug group-hover:text-button transition-colors">
                        {item.title}
                      </h4>
                      {item.published_at && (
                        <span className="text-on-surface-variant text-[10px] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[11px]">schedule</span>
                          {formatDateShort(item.published_at)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <BottomNavBar />
      <ShareButton onShare={handleShare} />

      <Footer />
    </div>
  )
}
