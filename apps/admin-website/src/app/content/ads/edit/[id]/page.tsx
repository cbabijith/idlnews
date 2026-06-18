import { createClient } from '@/lib/server'
import { notFound } from 'next/navigation'
import { EditAdClient } from './EditAdClient'
import { Ad } from '@/types'

export const dynamic = 'force-dynamic'

interface EditAdPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditAdPage({ params }: EditAdPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('ads')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return notFound()
  }

  const ad = data as unknown as Ad

  return <EditAdClient ad={ad} />
}
