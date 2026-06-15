'use client'

import { useRouter } from 'next/navigation'
import { newsService } from '@/services'
import { Category, Subcategory } from '@/types'
import { NewsForm } from '@/components/news/NewsForm'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useThemeStore } from '@/store/themeStore'

interface NewNewsClientProps {
  categories: Category[]
  subcategories: Subcategory[]
}

export function NewNewsClient({ categories, subcategories }: NewNewsClientProps) {
  const router = useRouter()
  const { colors } = useThemeStore()

  const handleSubmit = async (formData: any) => {
    const result = await newsService.createNews(
      formData.title,
      null,
      formData.content,
      formData.image_url,
      formData.youtube_link,
      formData.category_id || null,
      null,
      formData.is_published,
      formData.subcategory_id || null,
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
        <h1 className={`text-3xl font-bold ${colors.text}`}>Add New News</h1>
      </div>
      <NewsForm
        categories={categories}
        subcategories={subcategories}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </DashboardLayout>
  )
}
