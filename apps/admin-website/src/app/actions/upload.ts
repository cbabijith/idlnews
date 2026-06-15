'use server'

import { uploadImage as r2Upload, deleteImage as r2Delete } from '@idlnews/shared-supabase'

export async function uploadImageAction(formData: FormData) {
  try {
    const file = formData.get('file') as File
    if (!file) throw new Error('No file provided')

    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `news/${fileName}`

    // Call the R2 upload function from shared-supabase
    const publicUrl = await r2Upload(file, filePath)
    return { data: publicUrl, error: null }
  } catch (error) {
    console.error('Error uploading image to R2:', error)
    return { data: null, error: (error as Error).message }
  }
}

export async function deleteImageAction(url: string) {
  try {
    const urlObj = new URL(url)
    // Extract everything after the bucket name in URL
    // Format is endpoint/bucket/news/filename.ext or similar
    const pathParts = urlObj.pathname.split('/')
    // We want the path in the bucket: e.g. "news/filename.ext"
    const newsIdx = pathParts.indexOf('news')
    let key = pathParts[pathParts.length - 1]
    if (newsIdx !== -1) {
      key = pathParts.slice(newsIdx).join('/')
    }
    
    await r2Delete(key)
    return { success: true, error: null }
  } catch (error) {
    console.error('Error deleting image from R2:', error)
    return { success: false, error: (error as Error).message }
  }
}
