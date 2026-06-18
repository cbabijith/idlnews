import { adRepository } from '@/repositories'
import { Ad, AdPosition, ApiResponse } from '@/types'

export class AdService {
  async getAllAds(): Promise<ApiResponse<Ad[]>> {
    return adRepository.getAll()
  }

  async getAdById(id: string): Promise<ApiResponse<Ad>> {
    return adRepository.getById(id)
  }

  async getActiveAdsByPosition(position: AdPosition): Promise<ApiResponse<Ad[]>> {
    return adRepository.getActiveByPosition(position)
  }

  async createAd(
    title: string,
    imageUrl: string,
    linkUrl: string | null,
    position: AdPosition,
    displayOrder: number,
    isActive = true
  ): Promise<ApiResponse<Ad>> {
    return adRepository.create({
      title,
      image_url: imageUrl,
      link_url: linkUrl,
      position,
      display_order: displayOrder,
      is_active: isActive,
    })
  }

  async updateAd(
    id: string,
    title?: string,
    imageUrl?: string,
    linkUrl?: string | null,
    position?: AdPosition,
    displayOrder?: number,
    isActive?: boolean
  ): Promise<ApiResponse<Ad>> {
    const updates: Partial<Ad> = {}

    if (title !== undefined) updates.title = title
    if (imageUrl !== undefined) updates.image_url = imageUrl
    if (linkUrl !== undefined) updates.link_url = linkUrl
    if (position !== undefined) updates.position = position
    if (displayOrder !== undefined) updates.display_order = displayOrder
    if (isActive !== undefined) updates.is_active = isActive

    return adRepository.update(id, updates)
  }

  async deleteAd(id: string): Promise<ApiResponse<void>> {
    return adRepository.delete(id)
  }

  async toggleAdStatus(id: string): Promise<ApiResponse<Ad>> {
    return adRepository.toggleActive(id)
  }
}

export const adService = new AdService()
