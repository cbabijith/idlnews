'use client'

import { useEffect, useState } from 'react'
import supabase from '@idlnews/shared-supabase'

interface Ad {
  id: string
  title: string
  image_url: string
  link_url: string | null
  position: string
  is_active: boolean
  display_order: number
}

interface AdBannerProps {
  maxAds?: number
  className?: string
}

export function AdBanner({ maxAds = 3, className = '' }: AdBannerProps) {
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAds() {
      try {
        const { data, error } = await supabase
          .from('ads')
          .select('*')
          .eq('position', 'main_banner')
          .eq('is_active', true)
          .order('display_order', { ascending: true })
          .limit(maxAds)

        if (error) throw error
        setAds(data as unknown as Ad[] || [])
      } catch (err) {
        console.error('Failed to load ads:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAds()
  }, [maxAds])

  if (loading || ads.length === 0) {
    return null
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="flex flex-col gap-2.5">
        {ads.map((ad) => (
          <AdBannerItem key={ad.id} ad={ad} />
        ))}
      </div>
    </div>
  )
}

function AdBannerItem({ ad }: { ad: Ad }) {
  const content = (
    <div className="relative w-full rounded-lg overflow-hidden bg-surface-container group">
      <img
        src={ad.image_url}
        alt={ad.title}
        className="w-full h-auto object-cover"
        loading="lazy"
      />
      <span className="absolute top-1.5 right-1.5 text-[8px] font-medium uppercase tracking-wider bg-black/40 backdrop-blur-sm text-white/80 px-1.5 py-0.5 rounded">
        Sponsored
      </span>
    </div>
  )

  if (ad.link_url) {
    return (
      <a
        href={ad.link_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {content}
      </a>
    )
  }

  return content
}
