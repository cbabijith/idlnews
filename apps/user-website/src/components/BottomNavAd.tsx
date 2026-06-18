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

export function BottomNavAd() {
  const [ad, setAd] = useState<Ad | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAd() {
      try {
        const { data, error } = await supabase
          .from('ads')
          .select('*')
          .eq('position', 'bottom_nav')
          .eq('is_active', true)
          .order('display_order', { ascending: true })
          .limit(1)
          .maybeSingle()

        if (error) throw error
        if (data) {
          setAd(data as unknown as Ad)
        }
      } catch (err) {
        console.error('Failed to load bottom nav ad:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAd()
  }, [])

  if (loading || !ad) {
    return null
  }

  const content = (
    <div className="relative w-full h-12 flex items-center justify-center rounded-md overflow-hidden bg-surface-container flex-shrink-0">
      <img
        src={ad.image_url}
        alt={ad.title}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  )

  if (ad.link_url) {
    return (
      <a
        href={ad.link_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full h-12 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {content}
      </a>
    )
  }

  return content
}
