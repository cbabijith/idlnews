'use client'

import { useRouter } from 'next/navigation'
import { newsService } from '@/services'
import { Category, Subcategory, News } from '@/types'
import { NewsForm } from '@/components/news/NewsForm'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useThemeStore } from '@/store/themeStore'

interface EditNewsClientProps {
  newsItem: News
  categories: Category[]
  subcategories: Subcategory[]
}

export function EditNewsClient({ newsItem, categories, subcategories }: EditNewsClientProps) {
  const router = useRouter()
  const { colors } = useThemeStore()

  const handleSubmit = async (formData: any) => {
    const result = await newsService.updateNews(
      newsItem.id,
      formData.title,
      null,
      formData.content,
      formData.image_url,
      formData.youtube_link,
      formData.category_id || null,
      formData.subcategory_id || null,
      formData.is_published,
      formData.is_pinned,
      formData.published_at || null
    )

    if (result.error) {
      alert(result.error)
      return
    }

    router.push('/content/news')
    router.refresh()
  }

  const handleCancel = () => {
    router.push('/content/news')
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
        <h1 className={`text-3xl font-bold ${colors.text}`}>Edit News</h1>
      </div>
      <NewsForm
        categories={categories}
        subcategories={subcategories}
        initialData={newsItem}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </DashboardLayout>
  )
}
