'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { adService } from '@/services'
import { Ad } from '@/types'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useThemeStore } from '@/store/themeStore'
import { supabaseApi } from '@/api/supabase.api'

export function AdsClient() {
  const { colors } = useThemeStore()
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null)

  useEffect(() => {
    fetchAds()
  }, [])

  const fetchAds = async () => {
    setLoading(true)
    const result = await adService.getAllAds()
    if (result.data) {
      setAds(result.data)
    }
    setLoading(false)
  }

  const toggleActive = async (ad: Ad) => {
    const result = await adService.toggleAdStatus(ad.id)
    if (result.error) {
      alert(result.error)
      return
    }
    fetchAds()
  }

  const performDelete = async (id: string) => {
    const ad = ads.find(item => item.id === id)

    if (ad?.image_url) {
      try {
        const url = new URL(ad.image_url)
        const pathParts = url.pathname.split('/')
        const fileName = pathParts[pathParts.length - 1]
        await supabaseApi.storage.deleteImage(fileName)
      } catch (error) {
        console.error('Error deleting image from storage:', error)
      }
    }

    const result = await adService.deleteAd(id)
    if (result.error) {
      alert(result.error)
      return
    }
    fetchAds()
  }

  return (
    <DashboardLayout>
      <div className="hidden sm:flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className={`text-3xl sm:text-4xl font-bold ${colors.text}`}>Ads Management</h1>
        <Link
          href="/content/ads/new"
          className="w-full sm:w-auto px-6 py-3 bg-button text-white rounded-lg hover:opacity-90 transition-all font-medium text-center"
        >
          Add Ad
        </Link>
      </div>

      <Link
        href="/content/ads/new"
        className="sm:hidden fixed bottom-24 right-6 w-14 h-14 bg-button text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all z-40"
        title="Add Ad"
      >
        <span className="text-3xl font-light">+</span>
      </Link>

      <div className={`p-4 mb-6 rounded-lg ${colors.card} shadow-sm border border-gray-100`}>
        <p className={`text-sm ${colors.textSecondary}`}>
          <strong>Main Banner</strong> ads appear on the home page and news detail pages (up to 2-3 banners recommended).
          <br />
          <strong>Bottom Nav</strong> banner appears inside the mobile bottom navigation bar (only 1 active allowed).
        </p>
      </div>

      <div className="grid gap-4 pb-24">
        {loading ? (
          <p className={`${colors.textSecondary} text-center py-8`}>Loading ads...</p>
        ) : ads.length === 0 ? (
          <p className={colors.textSecondary}>No ads found</p>
        ) : (
          ads.map((ad) => (
            <div key={ad.id} className={`${colors.card} rounded-lg shadow overflow-hidden h-40 sm:h-48 flex flex-row`}>
              <div className="w-28 sm:w-48 h-full flex-shrink-0 relative bg-gray-100">
                <img
                  src={ad.image_url}
                  alt={ad.title}
                  className="w-full h-full object-cover absolute inset-0"
                />
              </div>

              <div className="flex-1 p-3 sm:p-5 flex flex-col justify-between min-w-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase ${
                      ad.is_active ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {ad.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className={`text-[10px] sm:text-xs ${colors.textSecondary} uppercase font-semibold`}>
                      {ad.position === 'main_banner' ? 'Main Banner' : 'Bottom Nav'}
                    </span>
                    <span className={`text-[10px] sm:text-xs ${colors.textSecondary}`}>
                      Order: {ad.display_order}
                    </span>
                  </div>

                  <h3 className={`text-sm sm:text-lg font-bold mb-1 ${colors.text} truncate`} title={ad.title}>
                    {ad.title}
                  </h3>

                  {ad.link_url && (
                    <a
                      href={ad.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] sm:text-xs text-blue-500 hover:underline truncate block"
                    >
                      {ad.link_url}
                    </a>
                  )}
                </div>

                <div className="flex items-center justify-end border-t border-gray-100 pt-2 mt-auto">
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleActive(ad)}
                      className={`w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg transition-colors duration-150 ${
                        ad.is_active
                          ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                      title={ad.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {ad.is_active ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
                        </svg>
                      )}
                    </button>
                    <Link
                      href={`/content/ads/edit/${ad.id}`}
                      className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-150"
                      title="Edit"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => setDeleteItemId(ad.id)}
                      className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-150"
                      title="Delete"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {deleteItemId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${colors.card} p-6 rounded-lg shadow-lg max-w-md w-full mx-auto`}>
            <h3 className={`text-xl font-semibold mb-4 ${colors.text}`}>Delete Ad?</h3>
            <p className={`${colors.text} mb-6 text-sm`}>
              Are you sure you want to permanently delete this ad? This will also remove its image from the storage bucket and cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={() => setDeleteItemId(null)}
                className="w-full sm:w-auto px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium transition-all"
              >
                Keep Ad
              </button>
              <button
                onClick={async () => {
                  const id = deleteItemId
                  setDeleteItemId(null)
                  await performDelete(id)
                }}
                className="w-full sm:w-auto px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition-all"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
