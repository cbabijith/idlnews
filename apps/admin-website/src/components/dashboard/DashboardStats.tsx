'use client'

import { useThemeStore } from '@/store/themeStore'

interface StatCardProps {
  title: string
  value: number
  icon: string
  color: string
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const { colors } = useThemeStore()
  return (
    <div className={`${colors.card} p-4 sm:p-6 rounded-lg shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-xs sm:text-sm ${colors.textSecondary}`}>{title}</p>
          <p className={`text-2xl sm:text-3xl font-bold ${colors.text} mt-2`}>{value}</p>
        </div>
        <div className={`text-3xl sm:text-4xl ${color}`}>{icon}</div>
      </div>
    </div>
  )
}

interface DashboardStatsProps {
  totalNews: number
  totalStaff: number
  totalUsers: number
  totalCategories: number
}

export function DashboardStats({ 
  totalNews, 
  totalStaff, 
  totalUsers, 
  totalCategories 
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total News Published"
        value={totalNews}
        icon="📰"
        color="text-blue-500"
      />
      <StatCard
        title="Total Staff"
        value={totalStaff}
        icon="👥"
        color="text-green-500"
      />
      <StatCard
        title="Total Users"
        value={totalUsers}
        icon="👤"
        color="text-purple-500"
      />
      <StatCard
        title="Total Categories"
        value={totalCategories}
        icon="📁"
        color="text-orange-500"
      />
    </div>
  )
}
