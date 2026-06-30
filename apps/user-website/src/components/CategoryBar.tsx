'use client'

import { useThemeStore } from '@/store/themeStore'

interface Category {
  id: string
  name: string
  slug: string
}

interface CategoryBarProps {
  categories: Category[]
  selectedCategory: string | null
  onCategorySelect: (categoryId: string | null) => void
}

export function CategoryBar({ categories, selectedCategory, onCategorySelect }: CategoryBarProps) {
  const { colors } = useThemeStore()

  return (
    <nav className={`bg-surface border-b ${colors.outlineVariant} overflow-x-auto no-scrollbar sticky top-16 z-30`}>
      <div className="flex gap-2 px-4 py-2.5 min-w-max md:justify-center md:min-w-0 max-w-[1200px] mx-auto">
        <button
          onClick={() => onCategorySelect(null)}
          className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all ${
            selectedCategory === null
              ? 'bg-button text-on-primary'
              : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          All
        </button>
        {categories.length > 0 ? (
          categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategorySelect(category.id)}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-button text-on-primary'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {category.name}
            </button>
          ))
        ) : null}
      </div>
    </nav>
  )
}
