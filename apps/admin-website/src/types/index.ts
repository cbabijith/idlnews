// Role Types
export type UserRole = 'admin' | 'staff' | 'user'

// Database Types
export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface Subcategory {
  id: string
  category_id: string
  name: string
  slug: string
  description: string | null
  created_at: string
  updated_at: string
}

export type AdPosition = 'main_banner' | 'bottom_nav' | 'popup_banner'

export interface Ad {
  id: string
  title: string
  image_url: string
  link_url: string | null
  position: AdPosition
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface News {
  id: string
  title: string
  description: string | null
  content: string | null
  image_url: string | null
  youtube_link: string | null
  category_id: string | null
  subcategory_id: string | null
  is_published: boolean
  is_pinned: boolean
  published_at: string | null
  view_count: number
  created_at: string
  updated_at: string
  created_by: string | null
  categories?: Category
  subcategories?: Subcategory
  profiles?: Profile
}

export interface Comment {
  id: string
  news_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  profile?: Profile
}

export interface Like {
  id: string
  news_id: string
  user_id: string
  created_at: string
}

// Auth Types
export interface User {
  id: string
  email: string
  created_at: string
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
}
