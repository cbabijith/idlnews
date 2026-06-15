import { createClient } from '@/lib/server'
import { NewsClient } from './NewsClient'
import { News, Category, Subcategory } from '@/types'

export const dynamic = 'force-dynamic'

export default async function NewsPage() {
  const supabase = await createClient()

  // 1. Fetch categories
  const categoriesQuery = supabase
    .from('categories')
    .select('*')
    .order('name')

  // 2. Fetch subcategories
  const subcategoriesQuery = supabase
    .from('subcategories')
    .select('*')
    .order('name')

  // 3. Fetch initial news items (first 10 items)
  const newsQuery = supabase
    .from('news')
    .select('*, categories(*), profiles(*)', { count: 'exact' })
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(0, 9)

  const [categoriesResult, subcategoriesResult, newsResult] = await Promise.all([
    categoriesQuery,
    subcategoriesQuery,
    newsQuery
  ])

  const categories = (categoriesResult.data || []) as unknown as Category[]
  const subcategories = (subcategoriesResult.data || []) as unknown as Subcategory[]
  const initialNews = (newsResult.data || []) as unknown as News[]
  const initialCount = newsResult.count || 0

  return (
    <NewsClient
      initialNews={initialNews}
      initialCategories={categories}
      initialSubcategories={subcategories}
      initialCount={initialCount}
    />
  )
}
