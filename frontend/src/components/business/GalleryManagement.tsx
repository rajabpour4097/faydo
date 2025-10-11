import React, { useState, useEffect, useRef } from 'react'
import { apiService, BusinessGalleryImage } from '../../services/api'
import { useTheme } from '../../contexts/ThemeContext'

interface GalleryManagementProps {
  onGalleryUpdate?: (gallery: BusinessGalleryImage[]) => void
}

export const GalleryManagement: React.FC<GalleryManagementProps> = ({ onGalleryUpdate }) => {
  const { isDark } = useTheme()
  const [gallery, setGallery] = useState<BusinessGalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingImage, setEditingImage] = useState<BusinessGalleryImage | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadGallery()
  }, [])

  const loadGallery = async () => {
    try {
      setLoading(true)
      const response = await apiService.getBusinessGallery()
      setGallery(response.data || [])
      onGalleryUpdate?.(response.data || [])
    } catch (err) {
      setError('خطا در بارگذاری گالری')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('فقط فایل‌های تصویری مجاز هستند')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('حجم فایل نباید بیشتر از 5 مگابایت باشد')
      return
    }

    // Check if we already have 4 images
    if (gallery.length >= 4) {
      setError('حداکثر 4 تصویر می‌توانید آپلود کنید')
      return
    }

    try {
      setUploading(true)
      setError(null)

      const formData = new FormData()
      formData.append('image', file)
      formData.append('title', `تصویر ${gallery.length + 1}`)
      formData.append('order', gallery.length.toString())

      const response = await apiService.createGalleryImage(formData)
      await loadGallery() // Reload gallery to get updated data
    } catch (err) {
      setError('خطا در آپلود تصویر')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeleteImage = async (id: number) => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این تصویر را حذف کنید؟')) {
      return
    }

    try {
      await apiService.deleteGalleryImage(id)
      await loadGallery()
    } catch (err) {
      setError('خطا در حذف تصویر')
    }
  }

  const handleEditImage = (image: BusinessGalleryImage) => {
    setEditingImage(image)
    setShowEditModal(true)
  }

  const handleUpdateImage = async (updatedData: Partial<BusinessGalleryImage>) => {
    if (!editingImage) return

    try {
      await apiService.updateGalleryImage(editingImage.id, updatedData)
      await loadGallery()
      setShowEditModal(false)
      setEditingImage(null)
    } catch (err) {
      setError('خطا در به‌روزرسانی تصویر')
    }
  }

  const handleSetFeatured = async (id: number) => {
    try {
      // First, unset all featured images
      const featuredImages = gallery.filter(img => img.is_featured)
      for (const img of featuredImages) {
        await apiService.updateGalleryImage(img.id, { is_featured: false })
      }

      // Then set the selected image as featured
      await apiService.updateGalleryImage(id, { is_featured: true })
      await loadGallery()
    } catch (err) {
      setError('خطا در تنظیم تصویر شاخص')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            مدیریت گالری تصاویر
          </h3>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            حداکثر 4 تصویر می‌توانید آپلود کنید
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {gallery.length}/4 تصویر
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700 dark:text-red-300">{error}</span>
          </div>
        </div>
      )}

      {/* Upload Button */}
      {gallery.length < 4 && (
        <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-6 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              uploading
                ? 'bg-gray-100 dark:bg-slate-700 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                در حال آپلود...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                افزودن تصویر جدید
              </>
            )}
          </button>
          <p className={`text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            فرمت‌های مجاز: JPG, PNG, GIF (حداکثر 5 مگابایت)
          </p>
        </div>
      )}

      {/* Gallery Grid */}
      {gallery.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gallery.map((image) => (
            <div key={image.id} className="relative group">
              <div className="aspect-video bg-gray-200 dark:bg-slate-700 rounded-lg overflow-hidden">
                <img
                  src={image.image_url}
                  alt={image.title || 'تصویر گالری'}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Featured Badge */}
              {image.is_featured && (
                <div className="absolute top-2 right-2">
                  <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    شاخص
                  </span>
                </div>
              )}

              {/* Image Info */}
              <div className="mt-2">
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {image.title || 'بدون عنوان'}
                </h4>
                {image.description && (
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    {image.description}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => handleEditImage(image)}
                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                >
                  ویرایش
                </button>
                {!image.is_featured && (
                  <button
                    onClick={() => handleSetFeatured(image.id)}
                    className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg transition-colors"
                  >
                    شاخص
                  </button>
                )}
                <button
                  onClick={() => handleDeleteImage(image.id)}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingImage && (
        <EditImageModal
          image={editingImage}
          onSave={handleUpdateImage}
          onClose={() => {
            setShowEditModal(false)
            setEditingImage(null)
          }}
        />
      )}
    </div>
  )
}

// Edit Image Modal Component
interface EditImageModalProps {
  image: BusinessGalleryImage
  onSave: (data: Partial<BusinessGalleryImage>) => void
  onClose: () => void
}

const EditImageModal: React.FC<EditImageModalProps> = ({ image, onSave, onClose }) => {
  const { isDark } = useTheme()
  const [title, setTitle] = useState(image.title || '')
  const [description, setDescription] = useState(image.description || '')

  const handleSave = () => {
    onSave({
      title: title.trim() || undefined,
      description: description.trim() || undefined
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md ${isDark ? 'text-white' : 'text-gray-900'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">ویرایش تصویر</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              عنوان تصویر
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full p-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 ${isDark ? 'text-white placeholder-slate-400' : 'text-gray-900 placeholder-gray-500'}`}
              placeholder="عنوان تصویر را وارد کنید"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              توضیحات
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`w-full p-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 ${isDark ? 'text-white placeholder-slate-400' : 'text-gray-900 placeholder-gray-500'}`}
              placeholder="توضیحات تصویر را وارد کنید"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            ذخیره تغییرات
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  )
}
