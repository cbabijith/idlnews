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
    <nav className={`bg-surface border-b ${colors.outlineVariant} overflow-x-auto no-scrollbar`}>
      <div className="flex space-x-2 px-margin-mobile md:px-4 py-3 min-w-max md:justify-center md:min-w-0 max-w-container-max mx-auto">
        <button
          onClick={() => onCategorySelect(null)}
          className={`px-4 py-1.5 rounded-full font-label-category text-label-category transition-colors ${
            selectedCategory === null
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high'
          }`}
        >
          All
        </button>
        {categories.length > 0 ? (
          categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategorySelect(category.id)}
              className={`px-4 py-1.5 rounded-full font-label-category text-label-category transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high'
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
