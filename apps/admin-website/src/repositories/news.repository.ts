import { createClient } from '@/lib/client'
import { News, ApiResponse } from '@/types'

const supabase = createClient()

export class NewsRepository {
  async getAll(includeCategory = true): Promise<ApiResponse<News[]>> {
    try {
      const query = supabase
        .from('news')
        .select(includeCategory ? '*, categories(*), profiles(*)' : '*, profiles(*)')
        .order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error

      return { data: data as unknown as News[], error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch news',
      }
    }
  }

  async getById(id: string, includeCategory = true): Promise<ApiResponse<News>> {
    try {
      const query = supabase
        .from('news')
        .select(includeCategory ? '*, categories(*), profiles(*)' : '*, profiles(*)')
        .eq('id', id)
        .single()

      const { data, error } = await query

      if (error) throw error

      return { data: data as unknown as News, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch news',
      }
    }
  }

  async getByCategory(categoryId: string): Promise<ApiResponse<News[]>> {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*, categories(*)')
        .eq('category_id', categoryId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { data: data as unknown as News[], error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch news by category',
      }
    }
  }

  async getPublished(): Promise<ApiResponse<News[]>> {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*, categories(*)')
        .eq('is_published', true)
        .order('published_at', { ascending: false })

      if (error) throw error

      return { data: data as unknown as News[], error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch published news',
      }
    }
  }

  async create(news: Omit<News, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<News>> {
    try {
      const { data, error } = await supabase
        .from('news')
        .insert(news)
        .select()
        .single()

      if (error) throw error

      return { data: data as unknown as News, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to create news',
      }
    }
  }

  async update(id: string, news: Partial<News>): Promise<ApiResponse<News>> {
    try {
      const { data, error } = await supabase
        .from('news')
        .update(news)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return { data: data as unknown as News, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to update news',
      }
    }
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id)

      if (error) throw error

      return { data: null, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to delete news',
      }
    }
  }

  async togglePublish(id: string, isPublished: boolean): Promise<ApiResponse<News>> {
    try {
      const { data, error } = await supabase
        .from('news')
        .update({
          is_published: isPublished,
          published_at: isPublished ? new Date().toISOString() : null,
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return { data: data as unknown as News, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to toggle publish status',
      }
    }
  }
}

export const newsRepository = new NewsRepository()
