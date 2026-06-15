'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import supabase from '@idlnews/shared-supabase'
import { Header } from '@/components/Header'
import { BottomNavBar } from '@/components/BottomNavBar'
import { WhatsAppButton } from '@/components/WhatsAppButton'
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
      setTimeout(() => reject(new Error('Connection timed out. The database might be waking up or your network is slow. Please try again.')), ms)
    )
  ]);
}

export default function NewsDetailPage() {
  const { colors } = useThemeStore()
  const params = useParams()
  const router = useRouter()
  const [news, setNews] = useState<NewsItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryTrigger, setRetryTrigger] = useState(0)

  useEffect(() => {
    async function fetchNews() {
      setLoading(true)
      setError(null)
      try {
        const { data, error } = await withTimeout(
          Promise.resolve(
            supabase
              .from('news')
              .select('id, title, content, description, image_url, youtube_link, published_at, is_pinned, categories(name, slug), profiles(full_name)')
              .eq('id', params.id)
              .eq('is_published', true)
              .single()
          ),
          8000
        )

        if (error) throw error
        setNews(data as unknown as NewsItem)
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

  const handleShare = () => {
    if (typeof window !== 'undefined' && news) {
      const category = news.categories?.name || 'ബ്രേക്കിംഗ് ന്യൂസ്'
      const description = news.description || news.content?.replace(/<[^>]*>/g, '').substring(0, 200) || ''
      const newsUrl = window.location.href
      const publishedDate = news.published_at
        ? new Date(news.published_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : ''
      
      const shareText = `📰 IDL NEWS | ${category}

✍️ ${news.title}

${description}

👉 *മുഴുവൻ വാർത്ത വായിക്കാൻ:*
${newsUrl}

📅 Published: ${publishedDate}

━━━━━━━━━━━━━━━

📲 IDL NEWS വാട്സ്ആപ്പ് ചാനലിൽ ചേരൂ

കേരളത്തിലെയും ലോകത്തെയും പ്രധാന വാർത്തകൾ, ബ്രേക്കിംഗ് അപ്ഡേറ്റുകൾ, പ്രത്യേക റിപ്പോർട്ടുകൾ എന്നിവ അതിവേഗം ലഭിക്കാൻ ഞങ്ങളുടെ വാട്സ്ആപ്പ് ചാനലിൽ ഇപ്പോൾ തന്നെ ജോയിൻ ചെയ്യൂ

👇 ചാനലിൽ ചേരാൻ
https://chat.whatsapp.com/B6JGw1jqCMeFBABRYql9MV?mode=ems_copy_t

━━━━━━━━━━━━━━━
*IDL NEWS
സത്യസന്ധവും വേഗമേറിയതുമായ വാർത്തകൾ* 🌐www.idlnews.com`
      
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`
      window.open(whatsappUrl, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-on-surface">Loading...</p>
      </div>
    )
  }

  if (error || !news) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <p className="text-error mb-4 font-medium max-w-md">{error || 'News article not found'}</p>
        <button
          onClick={() => setRetryTrigger(prev => prev + 1)}
          className="px-6 py-2.5 bg-button text-on-primary rounded-lg font-medium hover:opacity-90 transition-all shadow-md mb-3"
        >
          Retry Loading
        </button>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-2 bg-surfaceContainerLowest border border-outlineVariant text-on-surface rounded-lg font-medium hover:opacity-90 transition-all shadow-sm"
        >
          Go Back Home
        </button>
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

  return (
    <div className={`min-h-screen ${colors.background} pb-[80px] md:pb-0`}>
      <Header />
      
      <main className="w-full max-w-container-max mx-auto px-margin-mobile md:px-gutter py-stack-md flex flex-col gap-stack-md pb-32">
        {/* Header Section */}
        <article className="flex flex-col gap-stack-sm">
          <div className="flex items-center gap-base">
            {news.categories && (
              <span className="bg-primary-container text-on-primary-container font-label-category text-label-category px-3 py-1 rounded-DEFAULT inline-block w-max">
                {news.categories.name}
              </span>
            )}
          </div>
          <h1 className="font-display-hero-mobile text-display-hero-mobile md:font-display-hero md:text-display-hero text-on-surface">
            {news.title}
          </h1>
          <div className="text-on-surface-variant font-label-category text-label-category flex items-center gap-2 flex-wrap">
            <span>{formattedDate}</span>
            <span className="text-outline">|</span>
            <span>{authorName}</span>
          </div>
        </article>

        {/* Featured Image */}
        {news.image_url && (
          <div className="w-full aspect-[16/9] bg-surface-container rounded-lg overflow-hidden border border-outline-variant relative group">
            <img
              alt={news.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              src={news.image_url}
            />
          </div>
        )}

        {/* YouTube Video */}
        {news.youtube_link && (
          <div className="w-full aspect-video bg-surface-container rounded-lg overflow-hidden border border-outline-variant">
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
        <div className="flex flex-col gap-stack-md font-body-lg text-body-lg text-on-surface-variant max-w-3xl mx-auto leading-relaxed w-full">
          {news.description && (
            <p className="font-semibold text-on-surface">{news.description}</p>
          )}
          {news.content && (
            <div dangerouslySetInnerHTML={{ __html: news.content }} />
          )}
        </div>

        {/* Share Action */}
        <div className="mt-stack-lg flex justify-center">
          <button
            onClick={handleShare}
            className="bg-button text-on-primary font-label-category text-label-category px-6 py-3 rounded-full flex items-center gap-2 hover:bg-button-hover transition-all active:scale-95 duration-150 shadow-md hover:shadow-lg border border-transparent"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: 'FILL 1' }}>
              share
            </span>
            Share
          </button>
        </div>
      </main>

      <BottomNavBar />
      <WhatsAppButton />

      {/* Footer */}
      <footer className="bg-inverse-surface text-primary-fixed font-body-md text-body-md w-full mt-auto flex flex-col items-center gap-stack-md p-stack-md text-center pb-24 md:pb-stack-md">
        <div className="font-headline-md text-headline-md text-primary-fixed">
          IDL NEWS
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <a className="text-inverse-on-surface opacity-80 hover:text-secondary-fixed transition-colors cursor-pointer" href="#">
            ഞങ്ങളെക്കുറിച്ച്
          </a>
          <a className="text-inverse-on-surface opacity-80 hover:text-secondary-fixed transition-colors cursor-pointer" href="#">
            പരസ്യം
          </a>
          <a className="text-inverse-on-surface opacity-80 hover:text-secondary-fixed transition-colors cursor-pointer" href="#">
            സ്വകാര്യതാ നയം
          </a>
          <a className="text-inverse-on-surface opacity-80 hover:text-secondary-fixed transition-colors cursor-pointer" href="#">
            സമ്പർക്കം
          </a>
        </div>
        <p className="text-inverse-on-surface opacity-60 text-sm mt-4">
          © 2024 IDL വാർത്തകൾ. All rights reserved.
        </p>
        <p className="text-inverse-on-surface opacity-50 text-xs mt-1">
          Made by <a href="https://abijithcb.com" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-secondary-fixed transition-colors">abijithcb.com</a>
        </p>
      </footer>
    </div>
  )
}
