import { Metadata } from 'next'
import { Archivo_Narrow, Be_Vietnam_Pro } from 'next/font/google'
import '../../globals.css'

const archivoNarrow = Archivo_Narrow({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-archivo-narrow',
})

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-be-vietnam-pro',
})

interface NewsItem {
  id: string
  title: string
  content: string
  description?: string
  image_url?: string
  published_at?: string
  categories?: {
    name: string
  }
}

async function getNews(id: string): Promise<NewsItem | null> {
  try {
    const { createSupabaseClient } = await import('@idlnews/shared-supabase')
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )
    
    const { data, error } = await supabase
      .from('news')
      .select('*, categories(name)')
      .eq('id', id)
      .eq('is_published', true)
      .single()

    if (error) return null
    return data as NewsItem
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params
  const news = await getNews(resolvedParams.id)

  if (!news) {
    return {
      title: 'News Not Found - IDL വാർത്തകൾ',
      description: 'The requested news article could not be found.',
    }
  }

  const description = news.description || news.content?.replace(/<[^>]*>/g, '').substring(0, 160) || ''
  const imageUrl = news.image_url || ''

  return {
    title: `${news.title} - IDL വാർത്തകൾ`,
    description: description,
    openGraph: {
      title: news.title,
      description: description,
      images: imageUrl ? [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: news.title,
        }
      ] : [],
      type: 'article',
      publishedTime: news.published_at,
      siteName: 'IDL വാർത്തകൾ',
    },
    twitter: {
      card: 'summary_large_image',
      title: news.title,
      description: description,
      images: imageUrl ? [imageUrl] : [],
    },
  }
}

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
