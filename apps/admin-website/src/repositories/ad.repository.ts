import { createClient } from '@/lib/client'
import { Ad, AdPosition, ApiResponse } from '@/types'

const supabase = createClient()

export class AdRepository {
  async getAll(): Promise<ApiResponse<Ad[]>> {
    try {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .order('position')
        .order('display_order', { ascending: true })

      if (error) throw error

      return { data: data as unknown as Ad[], error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch ads',
      }
    }
  }

  async getById(id: string): Promise<ApiResponse<Ad>> {
    try {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return { data: data as unknown as Ad, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch ad',
      }
    }
  }

  async getActiveByPosition(position: AdPosition): Promise<ApiResponse<Ad[]>> {
    try {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('position', position)
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (error) throw error

      return { data: data as unknown as Ad[], error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch ads by position',
      }
    }
  }

  async create(ad: Omit<Ad, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Ad>> {
    try {
      const { data, error } = await supabase
        .from('ads')
        .insert(ad)
        .select()
        .single()

      if (error) throw error

      return { data: data as unknown as Ad, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to create ad',
      }
    }
  }

  async update(id: string, ad: Partial<Ad>): Promise<ApiResponse<Ad>> {
    try {
      const { data, error } = await supabase
        .from('ads')
        .update(ad)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return { data: data as unknown as Ad, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to update ad',
      }
    }
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', id)

      if (error) throw error

      return { data: null, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to delete ad',
      }
    }
  }

  async toggleActive(id: string): Promise<ApiResponse<Ad>> {
    const current = await this.getById(id)
    if (current.error || !current.data) {
      return { data: null, error: current.error || 'Ad not found' }
    }

    return this.update(id, { is_active: !current.data.is_active })
  }
}

export const adRepository = new AdRepository()
