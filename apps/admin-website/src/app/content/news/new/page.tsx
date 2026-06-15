import { createClient } from '@/lib/server'
import { NewNewsClient } from './NewNewsClient'
import { Category, Subcategory } from '@/types'

export const dynamic = 'force-dynamic'

export default async function NewNewsPage() {
  const supabase = await createClient()

  const categoriesQuery = supabase
    .from('categories')
    .select('*')
    .order('name')

  const subcategoriesQuery = supabase
    .from('subcategories')
    .select('*')
    .order('name')

  const [categoriesResult, subcategoriesResult] = await Promise.all([
    categoriesQuery,
    subcategoriesQuery
  ])

  const categories = (categoriesResult.data || []) as unknown as Category[]
  const subcategories = (subcategoriesResult.data || []) as unknown as Subcategory[]

  return (
    <NewNewsClient
      categories={categories}
      subcategories={subcategories}
    />
  )
}
