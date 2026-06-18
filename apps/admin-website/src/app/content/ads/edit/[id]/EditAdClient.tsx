'use client'

import { useRouter } from 'next/navigation'
import { adService } from '@/services'
import { Ad, AdPosition } from '@/types'
import { AdForm } from '@/components/forms/AdForm'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useThemeStore } from '@/store/themeStore'

interface EditAdClientProps {
  ad: Ad
}

export function EditAdClient({ ad }: EditAdClientProps) {
  const router = useRouter()
  const { colors } = useThemeStore()

  const handleSubmit = async (formData: {
    title: string
    image_url: string
    link_url: string
    position: AdPosition
    display_order: number
    is_active: boolean
  }) => {
    const result = await adService.updateAd(
      ad.id,
      formData.title,
      formData.image_url,
      formData.link_url || null,
      formData.position,
      formData.display_order,
      formData.is_active
    )

    if (result.error) {
      alert(result.error)
      return
    }

    router.push('/content/ads')
    router.refresh()
  }

  const handleCancel = () => {
    router.push('/content/ads')
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={handleCancel}
          className={`p-2 rounded-lg border ${colors.border} ${colors.text} hover:bg-gray-100 transition-all flex items-center justify-center`}
          title="Go Back"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </button>
        <h1 className={`text-3xl font-bold ${colors.text}`}>Edit Ad</h1>
      </div>
      <AdForm
        initialData={ad}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </DashboardLayout>
  )
}
