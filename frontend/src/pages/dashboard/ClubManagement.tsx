import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { apiService, ClubItem } from '../../services/api'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { MobileDashboardLayout } from '../../components/layout/MobileDashboardLayout'
import { useTheme } from '../../contexts/ThemeContext'

const ADMIN_ROLES = ['admin', 'it_manager', 'project_manager']

export const ClubManagement: React.FC = () => {
  const { isDark } = useTheme()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [clubs, setClubs] = useState<ClubItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const [showModal, setShowModal] = useState(false)
  const [editingClub, setEditingClub] = useState<ClubItem | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  const [formData, setFormData] = useState({ name: '', description: '', icon: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user && !ADMIN_ROLES.includes(user.type)) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  useEffect(() => {
    loadClubs()
  }, [])

  const loadClubs = async () => {
    setLoading(true)
    setError(null)
    const resp = await apiService.getClubs()
    if (resp.error) {
      setError(resp.error)
    } else if (resp.data) {
      setClubs(resp.data)
    }
    setLoading(false)
  }

  const openCreate = () => {
    setEditingClub(null)
    setFormData({ name: '', description: '', icon: '' })
    setShowModal(true)
  }

  const openEdit = (club: ClubItem) => {
    setEditingClub(club)
    setFormData({ name: club.name, description: club.description || '', icon: club.icon || '' })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('نام باشگاه الزامی است')
      return
    }
    setSaving(true)
    setError(null)
    let resp
    if (editingClub) {
      resp = await apiService.updateClub(editingClub.id, formData)
    } else {
      resp = await apiService.createClub(formData)
    }
    setSaving(false)
    if (resp.error) {
      setError(resp.error)
    } else {
      setSuccessMsg(editingClub ? 'باشگاه با موفقیت ویرایش شد' : 'باشگاه با موفقیت ایجاد شد')
      setShowModal(false)
      loadClubs()
      setTimeout(() => setSuccessMsg(null), 3000)
    }
  }

  const handleDelete = async (id: number) => {
    const resp = await apiService.deleteClub(id)
    if (resp.error) {
      setError(resp.error)
    } else {
      setSuccessMsg('باشگاه با موفقیت حذف شد')
      setDeleteConfirmId(null)
      loadClubs()
      setTimeout(() => setSuccessMsg(null), 3000)
    }
  }

  const isMobile = window.innerWidth < 1024

  const content = (
    <div style={{ direction: 'rtl' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            مدیریت باشگاه‌ها
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            ایجاد، ویرایش و حذف باشگاه‌های فایدو
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <span className="text-lg">+</span>
          باشگاه جدید
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

      {/* Club List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : clubs.length === 0 ? (
        <div className={`text-center py-16 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          <div className="text-4xl mb-3">🏆</div>
          <p>هیچ باشگاهی وجود ندارد</p>
          <button onClick={openCreate} className="mt-4 text-teal-500 hover:underline text-sm">
            اولین باشگاه را اضافه کنید
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubs.map(club => (
            <div
              key={club.id}
              className={`rounded-xl border p-5 transition-shadow hover:shadow-md ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-3xl">{club.icon || '🏆'}</span>
                  <div className="min-w-0">
                    <h3 className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {club.name}
                    </h3>
                    {club.description && (
                      <p className={`text-xs mt-1 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                        {club.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mr-2 shrink-0">
                  <button
                    onClick={() => openEdit(club)}
                    className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    title="ویرایش"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(club.id)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="حذف"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`}
            style={{ direction: 'rtl' }}>
            <h2 className={`text-lg font-bold mb-5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {editingClub ? 'ویرایش باشگاه' : 'ایجاد باشگاه جدید'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  نام باشگاه <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="مثال: باشگاه طعم‌ها"
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  آیکون (ایموجی)
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={e => setFormData(p => ({ ...p, icon: e.target.value }))}
                  placeholder="مثال: 🍽"
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  توضیحات
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  placeholder="توضیح کوتاه درباره این باشگاه..."
                  rows={3}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none ${
                    isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              {error && (
                <p className="text-red-500 text-xs">{error}</p>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {saving ? 'در حال ذخیره...' : (editingClub ? 'ذخیره تغییرات' : 'ایجاد باشگاه')}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${
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
          <div className={`w-full max-w-sm rounded-2xl shadow-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`}
            style={{ direction: 'rtl' }}>
            <div className="text-center mb-4">
              <span className="text-4xl">⚠️</span>
              <h3 className={`mt-3 font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                حذف باشگاه
              </h3>
              <p className={`text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                آیا مطمئن هستید؟ این عمل قابل بازگشت نیست و دسته‌بندی‌های مرتبط بدون باشگاه می‌مانند.
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
