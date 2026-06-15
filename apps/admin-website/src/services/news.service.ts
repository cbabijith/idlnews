import { newsRepository } from '@/repositories/news.repository'
import { News, ApiResponse } from '@/types'

export class NewsService {
  async getAllNews(includeCategory = true): Promise<ApiResponse<News[]>> {
    return newsRepository.getAll(includeCategory)
  }

  async getNewsById(id: string, includeCategory = true): Promise<ApiResponse<News>> {
    return newsRepository.getById(id, includeCategory)
  }

  async getNewsByCategory(categoryId: string): Promise<ApiResponse<News[]>> {
    return newsRepository.getByCategory(categoryId)
  }

  async getPublishedNews(): Promise<ApiResponse<News[]>> {
    return newsRepository.getPublished()
  }

  async createNews(
    title: string,
    description: string | null,
    content: string | null,
    imageUrl: string | null,
    youtubeLink: string | null,
    categoryId: string | null,
    createdById: string | null,
    isPublished = false,
    subcategoryId: string | null = null,
    isPinned = false,
    publishedAt: string | null = null
  ): Promise<ApiResponse<News>> {
    return newsRepository.create({
      title,
      description,
      content,
      image_url: imageUrl,
      youtube_link: youtubeLink,
      category_id: categoryId,
      subcategory_id: subcategoryId,
      created_by: createdById,
      is_published: isPublished,
      is_pinned: isPinned,
      published_at: isPublished ? (publishedAt || new Date().toISOString()) : null,
    })
  }

  async updateNews(
    id: string,
    title?: string,
    description?: string | null,
    content?: string | null,
    imageUrl?: string | null,
    youtubeLink?: string | null,
    categoryId?: string | null,
    subcategoryId?: string | null,
    isPublished?: boolean,
    isPinned?: boolean,
    publishedAt?: string | null
  ): Promise<ApiResponse<News>> {
    const updates: Partial<News> = {}

    if (title !== undefined) updates.title = title
    if (description !== undefined) updates.description = description
    if (content !== undefined) updates.content = content
    if (imageUrl !== undefined) updates.image_url = imageUrl
    if (youtubeLink !== undefined) updates.youtube_link = youtubeLink
    if (categoryId !== undefined) updates.category_id = categoryId
    if (subcategoryId !== undefined) updates.subcategory_id = subcategoryId
    if (isPinned !== undefined) {
      updates.is_pinned = isPinned
      if (isPinned) {
        updates.published_at = new Date().toISOString()
      }
    }
    if (publishedAt !== undefined) updates.published_at = publishedAt
    if (isPublished !== undefined) {
      updates.is_published = isPublished
      if (publishedAt === undefined) {
        updates.published_at = isPublished ? new Date().toISOString() : null
      }
    }

    return newsRepository.update(id, updates)
  }

  async deleteNews(id: string): Promise<ApiResponse<void>> {
    return newsRepository.delete(id)
  }

  async togglePublishStatus(id: string): Promise<ApiResponse<News>> {
    // First get the current status
    const current = await newsRepository.getById(id, false)
    if (current.error || !current.data) {
      return { data: null, error: current.error || 'News not found' }
    }

    return newsRepository.togglePublish(id, !current.data.is_published)
  }

  async togglePinStatus(id: string): Promise<ApiResponse<News>> {
    // First get the current status
    const current = await newsRepository.getById(id, false)
    if (current.error || !current.data) {
      return { data: null, error: current.error || 'News not found' }
    }

    const nextPinnedStatus = !current.data.is_pinned
    const updates: Partial<News> = { is_pinned: nextPinnedStatus }
    
    // Auto-update published_at to now if pinning it
    if (nextPinnedStatus) {
      updates.published_at = new Date().toISOString()
    }

    return newsRepository.update(id, updates)
  }
}

export const newsService = new NewsService()
