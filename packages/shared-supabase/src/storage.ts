import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || 'https://aac3ff53cff9e3877e8b3098f772b81a.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || 'd1827d2575691cf2df76f6631610374c',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '8984d2615a3a2072c3f9074af81df3cd0b631d45dacb8cab1c0c7d2cc1a0fcad',
  },
})

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'idlnews'
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-7a1a77e5d8f3444d931ce51a542a8b7d.r2.dev'

export async function uploadImage(file: File, path: string): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: path,
    Body: buffer,
    ContentType: file.type,
  })

  await s3Client.send(command)

  // Return the public URL
  return `${R2_PUBLIC_URL}/${path}`
}

export async function deleteImage(path: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: path,
  })

  await s3Client.send(command)
}

export async function getImageUrl(path: string): Promise<string> {
  return `${R2_PUBLIC_URL}/${path}`
}
