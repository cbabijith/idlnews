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
      <div className="mb-6">
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
