import { create } from 'zustand'

interface ThemeState {
  colors: {
    text: string
    textSecondary: string
    primary: string
    accent: string
    background: string
    card: string
    border: string
    surface: string
    onSurface: string
    onSurfaceVariant: string
    onPrimary: string
    onPrimaryContainer: string
    primaryContainer: string
    secondaryContainer: string
    onErrorContainer: string
    error: string
    surfaceContainerLowest: string
    surfaceContainerLow: string
    surfaceContainerHigh: string
    outlineVariant: string
  }
}

export const useThemeStore = create<ThemeState>(() => ({
  colors: {
    text: 'text-on-surface',
    textSecondary: 'text-on-surface-variant',
    primary: 'text-primary',
    accent: 'text-primary',
    background: 'bg-background',
    card: 'bg-surface-container-lowest',
    border: 'border-outline-variant',
    surface: 'bg-surface',
    onSurface: 'text-on-surface',
    onSurfaceVariant: 'text-on-surface-variant',
    onPrimary: 'text-on-primary',
    onPrimaryContainer: 'text-on-primary-container',
    primaryContainer: 'bg-primary-container',
    secondaryContainer: 'bg-secondary-container',
    onErrorContainer: 'text-on-error-container',
    error: 'text-error',
    surfaceContainerLowest: 'bg-surface-container-lowest',
    surfaceContainerLow: 'bg-surface-container-low',
    surfaceContainerHigh: 'bg-surface-container-high',
    outlineVariant: 'border-outline-variant',
  }
}))
