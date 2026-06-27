import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { apiService, ClubItem, ServiceCategoryItem } from '../../services/api'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { MobileDashboardLayout } from '../../components/layout/MobileDashboardLayout'
import { useTheme } from '../../contexts/ThemeContext'

const ADMIN_ROLES = ['admin', 'it_manager', 'project_manager']

export const ServiceCategoryManagement: React.FC = () => {
  const { isDark } = useTheme()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [categories, setCategories] = useState<ServiceCategoryItem[]>([])
  const [clubs, setClubs] = useState<ClubItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ServiceCategoryItem | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  const [filterClubId, setFilterClubId] = useState<number | 'all' | -1>('all')

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    club: null as number | null,
    parent: null as number | null,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user && !ADMIN_ROLES.includes(user.type)) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    const [catResp, clubResp] = await Promise.all([
      apiService.getServiceCategories(),
      apiService.getClubs(),
    ])
    if (catResp.error) setError(catResp.error)
    else if (catResp.data) setCategories(catResp.data)
    if (clubResp.data) setClubs(clubResp.data)
    setLoading(false)
  }

  const openCreate = () => {
    setEditingCategory(null)
    setFormData({ name: '', description: '', club: null, parent: null })
    setShowModal(true)
  }

  const openEdit = (cat: ServiceCategoryItem) => {
    setEditingCategory(cat)
    setFormData({
      name: cat.name,
      description: cat.description || '',
      club: cat.club ?? null,
      parent: cat.parent ?? null,
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('نام دسته‌بندی الزامی است')
      return
    }
    setSaving(true)
    setError(null)
    const payload = {
      name: formData.name,
      description: formData.description || null,
      club: formData.club,
      parent: formData.parent,
    }
    let resp
    if (editingCategory) {
      resp = await apiService.updateServiceCategory(editingCategory.id, payload)
    } else {
      resp = await apiService.createServiceCategory(payload as any)
    }
    setSaving(false)
    if (resp.error) {
      setError(resp.error)
    } else {
      setSuccessMsg(editingCategory ? 'دسته‌بندی با موفقیت ویرایش شد' : 'دسته‌بندی با موفقیت ایجاد شد')
      setShowModal(false)
      loadData()
      setTimeout(() => setSuccessMsg(null), 3000)
    }
  }

  const handleDelete = async (id: number) => {
    const resp = await apiService.deleteServiceCategory(id)
    if (resp.error) {
      setError(resp.error)
    } else {
      setSuccessMsg('دسته‌بندی با موفقیت حذف شد')
      setDeleteConfirmId(null)
      loadData()
      setTimeout(() => setSuccessMsg(null), 3000)
    }
  }

  const filteredCategories = filterClubId === 'all'
    ? categories
    : filterClubId === -1
      ? categories.filter(c => !c.club)
      : categories.filter(c => c.club === filterClubId)

  const getClubForCategory = (cat: ServiceCategoryItem): ClubItem | undefined => {
    if (cat.club_detail) return cat.club_detail
    return clubs.find(cl => cl.id === cat.club)
  }

  const isMobile = window.innerWidth < 1024

  const content = (
    <div style={{ direction: 'rtl' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            مدیریت دسته‌بندی‌های خدمات
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            تعریف و مدیریت دسته‌بندی‌های خدمات و اتصال به باشگاه‌ها
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <span className="text-lg">+</span>
          دسته‌بندی جدید
        </button>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-800 rounded-lg text-sm">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded-lg text-sm flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-600 font-bold">×</button>
        </div>
      )}

      {/* Filter by Club */}
      {clubs.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          <button
            onClick={() => setFilterClubId('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filterClubId === 'all'
                ? 'bg-teal-500 text-white'
                : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            همه باشگاه‌ها
          </button>
          {clubs.map(club => (
            <button
              key={club.id}
              onClick={() => setFilterClubId(club.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterClubId === club.id
                  ? 'bg-teal-500 text-white'
                  : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {club.icon && <span className="ml-1">{club.icon}</span>}
              {club.name}
            </button>
          ))}
          <button
            onClick={() => setFilterClubId(-1 as any)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filterClubId === -1
                ? 'bg-amber-500 text-white'
                : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            بدون باشگاه
          </button>
        </div>
      )}

      {/* Category List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className={`text-center py-16 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          <div className="text-4xl mb-3">📂</div>
          <p>دسته‌بندی‌ای یافت نشد</p>
          <button onClick={openCreate} className="mt-4 text-teal-500 hover:underline text-sm">
            اولین دسته‌بندی را اضافه کنید
          </button>
        </div>
      ) : (
        <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
          {/* Table Header */}
          <div className={`grid grid-cols-12 px-4 py-3 text-xs font-semibold uppercase tracking-wide ${
            isDark ? 'bg-slate-700 text-slate-400' : 'bg-gray-50 text-gray-500'
          }`}>
            <div className="col-span-4">نام دسته‌بندی</div>
            <div className="col-span-3">باشگاه</div>
            <div className="col-span-3 hidden sm:block">توضیحات</div>
            <div className="col-span-2 text-left">عملیات</div>
          </div>

          {/* Table Rows */}
          {filteredCategories.map((cat, idx) => {
            const club = getClubForCategory(cat)
            return (
              <div
                key={cat.id}
                className={`grid grid-cols-12 px-4 py-3 items-center text-sm ${
                  idx % 2 === 0
                    ? isDark ? 'bg-slate-800' : 'bg-white'
                    : isDark ? 'bg-slate-800/50' : 'bg-gray-50/50'
                } border-t ${isDark ? 'border-slate-700' : 'border-gray-100'}`}
              >
                <div className={`col-span-4 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {cat.name}
                  {cat.parent && (
                    <span className={`mr-2 text-xs px-1.5 py-0.5 rounded ${isDark ? 'bg-slate-600 text-slate-300' : 'bg-gray-100 text-gray-500'}`}>
                      زیرمجموعه
                    </span>
                  )}
                </div>
                <div className="col-span-3">
                  {club ? (
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      isDark ? 'bg-teal-900/40 text-teal-300' : 'bg-teal-50 text-teal-700'
                    }`}>
                      {club.icon && <span>{club.icon}</span>}
                      {club.name}
                    </span>
                  ) : (
                    <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>—</span>
                  )}
                </div>
                <div className={`col-span-3 hidden sm:block text-xs truncate ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  {cat.description || '—'}
                </div>
                <div className="col-span-2 flex gap-1 justify-end">
                  <button
                    onClick={() => openEdit(cat)}
                    className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                    title="ویرایش"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(cat.id)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                    title="حذف"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div
            className={`w-full max-w-lg rounded-2xl shadow-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`}
            style={{ direction: 'rtl' }}
          >
            <h2 className={`text-lg font-bold mb-5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {editingCategory ? 'ویرایش دسته‌بندی' : 'ایجاد دسته‌بندی جدید'}
            </h2>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  نام دسته‌بندی <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="مثال: آرایشگاه"
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              {/* Club Selection */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  باشگاه
                </label>
                <select
                  value={formData.club ?? ''}
                  onChange={e => setFormData(p => ({ ...p, club: e.target.value ? Number(e.target.value) : null }))}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">— بدون باشگاه —</option>
                  {clubs.map(club => (
                    <option key={club.id} value={club.id}>
                      {club.icon ? `${club.icon} ` : ''}{club.name}
                    </option>
                  ))}
                </select>
                {clubs.length === 0 && (
                  <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                    ابتدا باشگاه‌ها را از صفحه مدیریت باشگاه‌ها تعریف کنید
                  </p>
                )}
              </div>

              {/* Parent Category */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  دسته‌بندی والد (اختیاری)
                </label>
                <select
                  value={formData.parent ?? ''}
                  onChange={e => setFormData(p => ({ ...p, parent: e.target.value ? Number(e.target.value) : null }))}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">— بدون والد (دسته اصلی) —</option>
                  {categories
                    .filter(c => c.id !== editingCategory?.id && !c.parent)
                    .map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  توضیحات
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  placeholder="توضیح کوتاه..."
                  rows={2}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none ${
                    isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              {error && <p className="text-red-500 text-xs">{error}</p>}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {saving ? 'در حال ذخیره...' : (editingCategory ? 'ذخیره تغییرات' : 'ایجاد دسته‌بندی')}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div
            className={`w-full max-w-sm rounded-2xl shadow-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`}
            style={{ direction: 'rtl' }}
          >
            <div className="text-center mb-4">
              <span className="text-4xl">⚠️</span>
              <h3 className={`mt-3 font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>حذف دسته‌بندی</h3>
              <p className={`text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                آیا مطمئن هستید؟ این دسته‌بندی و زیرمجموعه‌های آن حذف می‌شوند.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-medium transition-colors"
              >
                بله، حذف شود
              </button>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  if (isMobile) {
    return <MobileDashboardLayout>{content}</MobileDashboardLayout>
  }
  return <DashboardLayout>{content}</DashboardLayout>
}
