'use server'

import { createClient } from '@/lib/server'
import { News } from '@/types'

export interface SearchNewsParams {
  searchQuery?: string
  categoryId?: string
  sortBy?: 'date-desc' | 'date-asc' | 'category' | 'title-asc' | 'title-desc' | 'views-desc'
  limit: number
  offset: number
}

export async function searchNewsAction({
  searchQuery,
  categoryId,
  sortBy = 'date-desc',
  limit,
  offset
}: SearchNewsParams) {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('news')
      .select('*, categories(*), profiles(*)', { count: 'exact' })

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    if (searchQuery) {
      const escapedQuery = searchQuery.trim()
      query = query.or(
        `title.ilike.%${escapedQuery}%,description.ilike.%${escapedQuery}%,content.ilike.%${escapedQuery}%`
      )
    }

    // Apply sorting
    if (sortBy === 'date-desc') {
      query = query
        .order('published_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
    } else if (sortBy === 'date-asc') {
      query = query
        .order('published_at', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: true })
    } else if (sortBy === 'title-asc') {
      query = query.order('title', { ascending: true })
    } else if (sortBy === 'title-desc') {
      query = query.order('title', { ascending: false })
    } else if (sortBy === 'category') {
      query = query.order('category_id', { ascending: true })
    } else if (sortBy === 'views-desc') {
      query = query.order('view_count', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    // Apply pagination range
    query = query.range(offset, offset + limit - 1)

    const { data, count, error } = await query

    if (error) throw error

    return {
      data: data as unknown as News[],
      count: count || 0,
      error: null
    }
  } catch (error) {
    console.error('Error in searchNewsAction:', error)
    return {
      data: [],
      count: 0,
      error: error instanceof Error ? error.message : 'Failed to search news'
    }
  }
}
