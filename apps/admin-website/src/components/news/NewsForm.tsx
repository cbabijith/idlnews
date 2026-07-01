'use client'

import { useState, useEffect } from 'react'
import { Category, Subcategory, News } from '@/types'
import { supabaseApi } from '@/api/supabase.api'
import { useThemeStore } from '@/store/themeStore'
import { RichTextEditor } from '@/components/editor/RichTextEditor'

interface NewsFormProps {
  categories: Category[]
  subcategories: Subcategory[]
  initialData?: News | null
  onSubmit: (data: {
    category_id: string
    subcategory_id: string
    title: string
    content: string
    image_url: string
    youtube_link: string
    is_published: boolean
    is_pinned: boolean
    published_at: string
  }) => Promise<void> | void
  onCancel: () => void
}

export function NewsForm({
  categories,
  subcategories,
  initialData = null,
  onSubmit,
  onCancel
}: NewsFormProps) {
  const { colors } = useThemeStore()
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const [formData, setFormData] = useState({
    category_id: '',
    subcategory_id: '',
    title: '',
    content: '',
    image_url: '',
    youtube_link: '',
    is_published: false,
    is_pinned: false,
    published_at: ''
  })

  // Initialize form data when initialData is available
  useEffect(() => {
    if (initialData) {
      setFormData({
        category_id: initialData.category_id || '',
        subcategory_id: initialData.subcategory_id || '',
        title: initialData.title || '',
        content: initialData.content || '',
        image_url: initialData.image_url || '',
        youtube_link: initialData.youtube_link || '',
        is_published: initialData.is_published || false,
        is_pinned: initialData.is_pinned || false,
        published_at: initialData.published_at || ''
      })
    }
  }, [initialData])

  // Auto-save draft to localStorage (only when creating news, not editing)
  useEffect(() => {
    if (!initialData) {
      localStorage.setItem('news-draft', JSON.stringify(formData))
    }
  }, [formData, initialData])

  // Load draft when component mounts (only when creating news)
  useEffect(() => {
    if (!initialData) {
      const savedDraft = localStorage.getItem('news-draft')
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft)
          setFormData({
            category_id: draft.category_id || '',
            subcategory_id: draft.subcategory_id || '',
            title: draft.title || '',
            content: draft.content || '',
            image_url: draft.image_url || '',
            youtube_link: draft.youtube_link || '',
            is_published: draft.is_published || false,
            is_pinned: draft.is_pinned || false,
            published_at: draft.published_at || ''
          })
        } catch (e) {
          console.error('Error loading draft:', e)
        }
      }
    }
  }, [initialData])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      if (formData.image_url) {
        try {
          const url = new URL(formData.image_url)
          const pathParts = url.pathname.split('/')
          const fileName = pathParts[pathParts.length - 1]
          await supabaseApi.storage.deleteImage(fileName)
        } catch (error) {
          console.error('Error deleting old image:', error)
        }
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const result = await supabaseApi.storage.uploadImage(file, filePath)
      if (result.error) throw new Error(result.error)

      setFormData({ ...formData, image_url: result.data })
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Error uploading image')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = async () => {
    if (formData.image_url) {
      try {
        const url = new URL(formData.image_url)
        const pathParts = url.pathname.split('/')
        const fileName = pathParts[pathParts.length - 1]
        await supabaseApi.storage.deleteImage(fileName)
      } catch (error) {
        console.error('Error deleting image from storage:', error)
      }
    }
    setFormData({ ...formData, image_url: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      await onSubmit(formData)
      if (!initialData) {
        localStorage.removeItem('news-draft')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    setShowCancelConfirm(true)
  }

  const confirmCancel = () => {
    setShowCancelConfirm(false)
    if (!initialData) {
      localStorage.removeItem('news-draft')
    }
    onCancel()
  }

  return (
    <div className={`${colors.card} p-4 sm:p-6 rounded-lg shadow mb-8`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${colors.text}`}>Category</label>
            <select
              value={formData.category_id || ''}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value, subcategory_id: '' })}
              className={`w-full p-3 ${colors.border} rounded-lg ${colors.text} bg-transparent`}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${colors.text}`}>Subcategory (Optional)</label>
            <select
              value={formData.subcategory_id || ''}
              disabled={!formData.category_id}
              onChange={(e) => setFormData({ ...formData, subcategory_id: e.target.value })}
              className={`w-full p-3 ${colors.border} rounded-lg ${colors.text} bg-transparent disabled:opacity-50`}
            >
              <option value="">No subcategory</option>
              {subcategories
                .filter(sub => sub.category_id === formData.category_id)
                .map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
            </select>
          </div>
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${colors.text}`}>Title</label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className={`w-full p-3 ${colors.border} rounded-lg ${colors.text} bg-transparent`}
            placeholder="News title"
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${colors.text}`}>Content</label>
          <RichTextEditor
            content={formData.content || ''}
            onChange={(content) => setFormData({ ...formData, content })}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${colors.text}`}>Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className={`w-full p-3 ${colors.border} rounded-lg ${colors.text}`}
            disabled={uploading}
          />
          {uploading && <p className={`text-sm ${colors.textSecondary} mt-1`}>Uploading...</p>}
          {formData.image_url && (
            <div className="mt-2 relative inline-block max-w-full">
              <img
                src={formData.image_url}
                alt="Preview"
                className="max-w-full sm:max-w-xs rounded-lg object-contain"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-opacity"
                title="Remove image"
              >
                ✕
              </button>
            </div>
          )}
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${colors.text}`}>YouTube Link</label>
          <input
            type="url"
            value={formData.youtube_link || ''}
            onChange={(e) => setFormData({ ...formData, youtube_link: e.target.value })}
            className={`w-full p-3 ${colors.border} rounded-lg ${colors.text} bg-transparent`}
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 py-2">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_published || false}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              className="h-4 w-4 text-button border-gray-300 rounded focus:ring-button cursor-pointer"
            />
            <span className={`ml-2 text-sm font-medium ${colors.text}`}>Publish Immediately</span>
          </label>

          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_pinned || false}
              onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
              className="h-4 w-4 text-button border-gray-300 rounded focus:ring-button cursor-pointer"
            />
            <span className={`ml-2 text-sm font-medium ${colors.text}`}>📌 Pin to Home (Featured)</span>
          </label>
        </div>
        {formData.is_published && (
          <div>
            <label className={`block text-sm font-medium mb-2 ${colors.text}`}>Publish Date & Time (Rearrange/Backdate/Schedule)</label>
            <input
              type="datetime-local"
              value={formData.published_at ? new Date(new Date(formData.published_at).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
              onChange={(e) => setFormData({ ...formData, published_at: e.target.value ? new Date(e.target.value).toISOString() : '' })}
              className={`w-full p-3 ${colors.border} rounded-lg ${colors.text} bg-transparent`}
            />
            <p className={`text-xs ${colors.textSecondary} mt-1`}>
              Note: Changing this date changes the article's order/position on both the admin panel and the user website.
            </p>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 bg-button text-white rounded-lg hover:opacity-90 font-medium text-center transition-all disabled:opacity-50"
            disabled={uploading || submitting}
          >
            {submitting ? 'Saving...' : (initialData ? 'Update' : 'Create')}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="w-full sm:w-auto px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium text-center transition-all disabled:opacity-50"
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </form>

      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${colors.card} p-6 rounded-lg shadow-lg max-w-md w-full mx-auto`}>
            <h3 className={`text-xl font-semibold mb-4 ${colors.text}`}>Cancel News Creation?</h3>
            <p className={`${colors.text} mb-6 text-sm`}>
              Are you sure you want to cancel? This will clear all your changes and discard the form.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="w-full sm:w-auto px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium transition-all"
              >
                Keep Editing
              </button>
              <button
                onClick={confirmCancel}
                className="w-full sm:w-auto px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition-all"
              >
                Cancel & Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
