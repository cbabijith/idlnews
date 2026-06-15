import { ReactNode } from 'react'
import { LOGIN_TEXT } from '@/constants/login'
import { useThemeStore } from '@/store/themeStore'

interface LoginLayoutProps {
  children: ReactNode
}

export function LoginLayout({ children }: LoginLayoutProps) {
  const { colors } = useThemeStore()
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6">
      <div className="max-w-md w-full space-y-8 p-6 sm:p-8">
        <div className="flex flex-col items-center">
          <img src="/logo.png" alt="IDL News Logo" className="h-48 w-auto mb-4 object-contain" />
          <h2 className={`text-center text-2xl sm:text-3xl font-extrabold ${colors.text}`}>
            {LOGIN_TEXT.pageTitle}
          </h2>
          <p className={`mt-2 text-center text-xs sm:text-sm ${colors.textSecondary}`}>
            {LOGIN_TEXT.pageSubtitle}
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
