import { Dashboard } from '@/components/dashboard/Dashboard'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export default async function Home() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black">Welcome back, {user?.email?.split('@')[0]}</h1>
        </div>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="px-4 py-2 bg-button text-white rounded-lg hover:opacity-90"
          >
            Logout
          </button>
        </form>
      </div>
      <Dashboard />
    </DashboardLayout>
  )
}
