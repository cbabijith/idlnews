'use client'

import { useState, useEffect } from 'react'
import { categoryService, subcategoryService } from '@/services'
import { Category, Subcategory } from '@/types'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useThemeStore } from '@/store/themeStore'

export default function CategoriesPage() {
  const { colors } = useThemeStore()
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showSubcategoryForm, setShowSubcategoryForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    slug: ''
  })
  const [subcategoryFormData, setSubcategoryFormData] = useState({
    name: '',
    slug: '',
    description: ''
  })

  useEffect(() => {
    fetchCategories()
    fetchSubcategories()
  }, [])

  const fetchCategories = async () => {
    const result = await categoryService.getAllCategories()
    if (result.data) {
      setCategories(result.data)
    }
    setLoading(false)
  }

  const fetchSubcategories = async () => {
    const result = await subcategoryService.getAllSubcategories()
    if (result.data) {
      setSubcategories(result.data)
    }
  }

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    let result
    if (editingCategory) {
      result = await categoryService.updateCategory(editingCategory.id, categoryFormData.name, undefined)
    } else {
      result = await categoryService.createCategory(categoryFormData.name, undefined)
    }
    
    if (result.error) {
      alert(result.error)
      return
    }
    
    setShowCategoryForm(false)
    setEditingCategory(null)
    setCategoryFormData({ name: '', slug: '' })
    fetchCategories()
  }

  const handleSubcategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedCategoryId) return
    
    let result
    if (editingSubcategory) {
      result = await subcategoryService.updateSubcategory(editingSubcategory.id, subcategoryFormData.name, subcategoryFormData.description)
    } else {
      result = await subcategoryService.createSubcategory(selectedCategoryId, subcategoryFormData.name, subcategoryFormData.description)
    }
    
    if (result.error) {
      alert(result.error)
      return
    }
    
    setShowSubcategoryForm(false)
    setEditingSubcategory(null)
    setSelectedCategoryId(null)
    setSubcategoryFormData({ name: '', slug: '', description: '' })
    fetchSubcategories()
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setCategoryFormData({
      name: category.name,
      slug: category.slug
    })
    setShowCategoryForm(true)
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    
    const result = await categoryService.deleteCategory(id)
    if (result.error) {
      alert(result.error)
      return
    }
    fetchCategories()
    fetchSubcategories()
  }

  const handleAddSubcategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId)
    setEditingSubcategory(null)
    setSubcategoryFormData({ name: '', slug: '', description: '' })
    setShowSubcategoryForm(true)
  }

  const handleEditSubcategory = (subcategory: Subcategory) => {
    setSelectedCategoryId(subcategory.category_id)
    setEditingSubcategory(subcategory)
    setSubcategoryFormData({
      name: subcategory.name,
      slug: subcategory.slug,
      description: subcategory.description || ''
    })
    setShowSubcategoryForm(true)
  }

  const handleDeleteSubcategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) return
    
    const result = await subcategoryService.deleteSubcategory(id)
    if (result.error) {
      alert(result.error)
      return
    }
    fetchSubcategories()
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleCategoryNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setCategoryFormData({
      ...categoryFormData,
      name,
      slug: generateSlug(name)
    })
  }

  const handleSubcategoryNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setSubcategoryFormData({
      ...subcategoryFormData,
      name,
      slug: generateSlug(name)
    })
  }

  const toggleCategoryExpand = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">Loading categories...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex sm:hidden justify-between items-center mb-6">
        <h1 className={`text-2xl font-bold ${colors.text}`}>Categories</h1>
        <button
          onClick={() => {
            setShowCategoryForm(true)
            setEditingCategory(null)
            setCategoryFormData({ name: '', slug: '' })
          }}
          className="px-4 py-2 bg-button text-white rounded-lg hover:opacity-90 text-sm"
        >
          + Add
        </button>
      </div>

      <div className="hidden sm:flex justify-between items-center mb-8">
        <h1 className={`text-4xl font-bold ${colors.text}`}>Categories</h1>
        <button
          onClick={() => {
            setShowCategoryForm(true)
            setEditingCategory(null)
            setCategoryFormData({ name: '', slug: '' })
          }}
          className="px-6 py-3 bg-button text-white rounded-lg hover:opacity-90"
        >
          Add Category
        </button>
      </div>


      {showCategoryForm && (
        <div className={`${colors.card} p-4 sm:p-6 rounded-lg shadow mb-6`}>
          <h2 className={`text-xl sm:text-2xl font-semibold mb-4 ${colors.text}`}>
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </h2>
          <form onSubmit={handleCategorySubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${colors.text}`}>Name</label>
              <input
                type="text"
                value={categoryFormData.name}
                onChange={handleCategoryNameChange}
                required
                className={`w-full p-3 ${colors.border} rounded-lg ${colors.text}`}
                placeholder="Category name"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${colors.text}`}>Slug</label>
              <input
                type="text"
                value={categoryFormData.slug}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, slug: e.target.value })}
                required
                className={`w-full p-3 ${colors.border} rounded-lg ${colors.text}`}
                placeholder="category-slug"
                disabled
              />
              <p className={`text-xs ${colors.textSecondary} mt-1`}>Slug is auto-generated from name</p>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-button text-white rounded-lg hover:opacity-90"
              >
                {editingCategory ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCategoryForm(false)
                  setEditingCategory(null)
                  setCategoryFormData({ name: '', slug: '' })
                }}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {showSubcategoryForm && (
        <div className={`${colors.card} p-4 sm:p-6 rounded-lg shadow mb-6`}>
          <h2 className={`text-xl sm:text-2xl font-semibold mb-4 ${colors.text}`}>
            {editingSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}
          </h2>
          <form onSubmit={handleSubcategorySubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${colors.text}`}>Name</label>
              <input
                type="text"
                value={subcategoryFormData.name}
                onChange={handleSubcategoryNameChange}
                required
                className={`w-full p-3 ${colors.border} rounded-lg ${colors.text}`}
                placeholder="Subcategory name"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${colors.text}`}>Slug</label>
              <input
                type="text"
                value={subcategoryFormData.slug}
                onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, slug: e.target.value })}
                required
                className={`w-full p-3 ${colors.border} rounded-lg ${colors.text}`}
                placeholder="subcategory-slug"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${colors.text}`}>Description</label>
              <textarea
                value={subcategoryFormData.description}
                onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, description: e.target.value })}
                className={`w-full p-3 ${colors.border} rounded-lg ${colors.text}`}
                rows={3}
                placeholder="Subcategory description"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-button text-white rounded-lg hover:opacity-90"
              >
                {editingSubcategory ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSubcategoryForm(false)
                  setEditingSubcategory(null)
                  setSelectedCategoryId(null)
                  setSubcategoryFormData({ name: '', slug: '', description: '' })
                }}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {categories.length === 0 ? (
          <p className={colors.textSecondary}>No categories found</p>
        ) : (
          categories.map((category) => {
            const categorySubcategories = subcategories.filter(sub => sub.category_id === category.id)
            return (
              <div key={category.id} className={`${colors.card} p-4 sm:p-6 rounded-lg shadow`}>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 cursor-pointer min-w-0" onClick={() => toggleCategoryExpand(category.id)}>
                    <div className="flex items-center gap-2">
                      <span className={`text-base sm:text-lg ${colors.text} flex-shrink-0`}>
                        {expandedCategories.has(category.id) ? '▼' : '▶'}
                      </span>
                      <h3 className={`text-lg sm:text-xl font-semibold ${colors.text} truncate`}>{category.name}</h3>
                    </div>
                    <p className={`${colors.text} text-xs sm:text-sm mb-1 sm:mb-2 ml-6 truncate`}>/{category.slug}</p>
                    {category.description && (
                      <p className={`${colors.text} text-sm ml-6`}>{category.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-button text-white rounded hover:opacity-90 text-xs sm:text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-500 text-white rounded hover:bg-red-600 text-xs sm:text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                {expandedCategories.has(category.id) && (
                  <div className={`${colors.border} border-t pt-4 mt-4`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                      <h4 className={`text-base sm:text-lg font-medium ${colors.text}`}>Subcategories ({categorySubcategories.length})</h4>
                      <button
                        onClick={() => handleAddSubcategory(category.id)}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-button text-white rounded hover:opacity-90 text-xs sm:text-sm w-full sm:w-auto"
                      >
                        + Add Subcategory
                      </button>
                    </div>
                    
                    {categorySubcategories.length === 0 ? (
                      <p className={`${colors.text} text-sm`}>No subcategories yet</p>
                    ) : (
                      <div className="space-y-2">
                        {categorySubcategories.map((sub) => (
                          <div key={sub.id} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-3 ${colors.background} rounded`}>
                            <div className="min-w-0">
                              <p className={`font-medium ${colors.text} truncate`}>{sub.name}</p>
                              <p className={`${colors.text} text-xs sm:text-sm truncate`}>/{sub.slug}</p>
                              {sub.description && (
                                <p className={`${colors.text} text-xs sm:text-sm`}>{sub.description}</p>
                              )}
                            </div>
                            <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
                              <button
                                onClick={() => handleEditSubcategory(sub)}
                                className="flex-1 sm:flex-none px-3 py-1 bg-button text-white rounded hover:opacity-90 text-xs sm:text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteSubcategory(sub.id)}
                                className="flex-1 sm:flex-none px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs sm:text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </DashboardLayout>
  )
}
