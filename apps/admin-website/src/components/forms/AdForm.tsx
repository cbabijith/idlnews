'use client'

import { useState, useEffect } from 'react'
import { Ad, AdPosition } from '@/types'
import { supabaseApi } from '@/api/supabase.api'
import { useThemeStore } from '@/store/themeStore'

interface AdFormProps {
  initialData?: Ad | null
  onSubmit: (data: {
    title: string
    image_url: string
    link_url: string
    position: AdPosition
    display_order: number
    is_active: boolean
  }) => Promise<void> | void
  onCancel: () => void
}

const POSITIONS: { value: AdPosition; label: string }[] = [
  { value: 'main_banner', label: 'Main Banner (Home & News Pages)' },
  { value: 'bottom_nav', label: 'Bottom Navigation Banner (Only 1 allowed)' },
  { value: 'popup_banner', label: 'Popup Banner (Only 1 allowed)' },
]

export function AdForm({ initialData = null, onSubmit, onCancel }: AdFormProps) {
  const { colors } = useThemeStore()
  const [uploading, setUploading] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    link_url: '',
    position: 'main_banner' as AdPosition,
    display_order: 0,
    is_active: true,
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        image_url: initialData.image_url || '',
        link_url: initialData.link_url || '',
        position: initialData.position || 'main_banner',
        display_order: initialData.display_order || 0,
        is_active: initialData.is_active ?? true,
      })
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
      const filePath = `ads/${fileName}`

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
    await onSubmit(formData)
  }

  const handleCancel = () => {
    setShowCancelConfirm(true)
  }

  const confirmCancel = () => {
    setShowCancelConfirm(false)
    onCancel()
  }

  return (
    <div className={`${colors.card} p-4 sm:p-6 rounded-lg shadow mb-8`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${colors.text}`}>Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className={`w-full p-3 ${colors.border} rounded-lg ${colors.text} bg-transparent`}
            placeholder="Ad title"
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${colors.text}`}>Ad Position</label>
          <select
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value as AdPosition })}
            required
            className={`w-full p-3 ${colors.border} rounded-lg ${colors.text} bg-transparent`}
          >
            {POSITIONS.map((pos) => (
              <option key={pos.value} value={pos.value}>{pos.label}</option>
            ))}
          </select>
          <p className={`text-xs ${colors.textSecondary} mt-1`}>
            Main Banner ads appear on the home and news pages. Bottom Nav banner appears in the mobile bottom navigation (only 1 active allowed). Popup Banner appears as a small popup on the user website (only 1 active allowed).
          </p>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${colors.text}`}>Ad Image</label>
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
                alt="Ad preview"
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
          <label className={`block text-sm font-medium mb-2 ${colors.text}`}>Link URL</label>
          <input
            type="url"
            value={formData.link_url}
            onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
            className={`w-full p-3 ${colors.border} rounded-lg ${colors.text} bg-transparent`}
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${colors.text}`}>Display Order</label>
          <input
            type="number"
            min={0}
            value={formData.display_order}
            onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
            className={`w-full p-3 ${colors.border} rounded-lg ${colors.text} bg-transparent`}
            placeholder="0"
          />
          <p className={`text-xs ${colors.textSecondary} mt-1`}>
            Lower numbers appear first. Use this to control which main banner shows first.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 py-2">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 text-button border-gray-300 rounded focus:ring-button cursor-pointer"
            />
            <span className={`ml-2 text-sm font-medium ${colors.text}`}>Active</span>
          </label>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 bg-button text-white rounded-lg hover:opacity-90 font-medium text-center transition-all"
            disabled={uploading || !formData.image_url}
          >
            {initialData ? 'Update' : 'Create'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="w-full sm:w-auto px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium text-center transition-all"
          >
            Cancel
          </button>
        </div>
      </form>

      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${colors.card} p-6 rounded-lg shadow-lg max-w-md w-full mx-auto`}>
            <h3 className={`text-xl font-semibold mb-4 ${colors.text}`}>Cancel Ad {initialData ? 'Edit' : 'Creation'}?</h3>
            <p className={`${colors.text} mb-6 text-sm`}>
              Are you sure you want to cancel? This will discard all your changes.
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
