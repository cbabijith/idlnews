import { createClient } from '@/lib/server'
import { notFound } from 'next/navigation'
import { EditNewsClient } from './EditNewsClient'
import { News, Category, Subcategory } from '@/types'

export const dynamic = 'force-dynamic'

interface EditNewsPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditNewsPage({ params }: EditNewsPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const categoriesQuery = supabase
    .from('categories')
    .select('*')
    .order('name')

  const subcategoriesQuery = supabase
    .from('subcategories')
    .select('*')
    .order('name')

  const newsQuery = supabase
    .from('news')
    .select('*, categories(*), profiles(*)')
    .eq('id', id)
    .single()

  const [categoriesResult, subcategoriesResult, newsResult] = await Promise.all([
    categoriesQuery,
    subcategoriesQuery,
    newsQuery
  ])

  if (newsResult.error || !newsResult.data) {
    return notFound()
  }

  const categories = (categoriesResult.data || []) as unknown as Category[]
  const subcategories = (subcategoriesResult.data || []) as unknown as Subcategory[]
  const newsItem = newsResult.data as unknown as News

  return (
    <EditNewsClient
      newsItem={newsItem}
      categories={categories}
      subcategories={subcategories}
    />
  )
}
