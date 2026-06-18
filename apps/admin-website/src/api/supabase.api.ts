import { createClient } from '@/lib/client'
import { adRepository, categoryRepository, newsRepository } from '@/repositories'
import { uploadImageAction, deleteImageAction } from '@/app/actions/upload'

// This layer provides a unified API interface for external calls
// Currently it wraps the repository layer, but can be extended for external APIs

const supabase = createClient()

async function compressImage(file: File, maxKB: number = 50): Promise<File> {
  // If the file is already under 50KB or is not an image, skip compression
  if (file.size <= maxKB * 1024 || !file.type.startsWith('image/')) return file

  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img

        // Limit dimensions to 1000px max to speed up compression and guarantee sub-50KB size
        const MAX_DIM = 1000
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = (height * MAX_DIM) / width
            width = MAX_DIM
          } else {
            width = (width * MAX_DIM) / height
            height = MAX_DIM
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) return resolve(file)
        ctx.drawImage(img, 0, 0, width, height)

        const targetBytes = maxKB * 1024
        let quality = 0.75

        const compress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) return resolve(file)
              
              if (blob.size > targetBytes && quality > 0.1) {
                // Reduce quality steps to find target size under 50kb
                quality -= 0.15
                compress()
              } else {
                const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                })
                resolve(compressedFile)
              }
            },
            'image/jpeg',
            quality
          )
        }
        compress()
      }
      img.onerror = () => resolve(file)
      img.src = e.target?.result as string
    }
    reader.onerror = () => resolve(file)
    reader.readAsDataURL(file)
  })
}

export const supabaseApi = {
  // Auth
  auth: {
    signIn: async (email: string, password: string) => {
      return supabase.auth.signInWithPassword({ email, password })
    },
    signOut: async () => {
      return supabase.auth.signOut()
    },
    signUp: async (email: string, password: string) => {
      return supabase.auth.signUp({ email, password })
    },
    getUser: async () => {
      return supabase.auth.getUser()
    },
  },

  // Storage (Cloudflare R2 via Server Actions)
  storage: {
    uploadImage: async (file: File, path: string) => {
      const compressedFile = await compressImage(file)
      const formData = new FormData()
      formData.append('file', compressedFile)
      const result = await uploadImageAction(formData)
      if (result.error || !result.data) throw new Error(result.error || 'Failed to upload image')
      return { data: result.data, error: null }
    },

    deleteImage: async (path: string) => {
      const filename = path.split('/').pop() || path
      // Construct a dummy URL with the key so deleteImageAction can extract it
      const result = await deleteImageAction(`https://dummy.com/news/${filename}`)
      return { data: result.success ? [] : null, error: result.error ? new Error(result.error) : null }
    },
  },

  // Database (delegates to repositories)
  ads: adRepository,
  categories: categoryRepository,
  news: newsRepository,
}
