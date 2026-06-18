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

export function PopupAd() {
  const [ad, setAd] = useState<Ad | null>(null)
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    async function fetchAd() {
      try {
        const { data, error } = await supabase
          .from('ads')
          .select('*')
          .eq('position', 'popup_banner')
          .eq('is_active', true)
          .order('display_order', { ascending: true })
          .limit(1)
          .maybeSingle()

        if (error) throw error
        if (data) {
          setAd(data as unknown as Ad)
        }
      } catch (err) {
        console.error('Failed to load popup ad:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAd()
  }, [])

  if (loading || !ad || dismissed) {
    return null
  }

  const content = (
    <div className="relative w-full max-w-sm rounded-xl overflow-hidden shadow-2xl bg-surface">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 z-10 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
        title="Close"
      >
        <span className="material-symbols-outlined text-base">close</span>
      </button>
      <img
        src={ad.image_url}
        alt={ad.title}
        className="w-full h-auto object-cover"
        loading="lazy"
      />
    </div>
  )

  if (ad.link_url) {
    return (
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[55] animate-slide-up">
        <a
          href={ad.link_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          {content}
        </a>
      </div>
    )
  }

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[55] animate-slide-up">
      {content}
    </div>
  )
}
