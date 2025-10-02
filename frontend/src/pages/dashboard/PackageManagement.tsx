import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { apiService, Package } from '../../services/api'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { MobileDashboardLayout } from '../../components/layout/MobileDashboardLayout'
import { useTheme } from '../../contexts/ThemeContext'

interface PackageManagementProps {}

export const PackageManagement: React.FC<PackageManagementProps> = () => {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    loadPackages()
  }, [])

  const loadPackages = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.getPackages()
      
      if (response.error) {
        setError(response.error)
      } else if (response.data) {
        setPackages(response.data)
      }
    } catch (err) {
      setError('خطا در بارگذاری پکیج‌ها')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePackage = async (packageId: number) => {
    if (!window.confirm('آیا از حذف این پکیج اطمینان دارید؟')) {
      return
    }

    try {
      const response = await apiService.deletePackage(packageId)
      
      if (response.error) {
        setError(response.error)
      } else {
        setPackages(packages.filter(pkg => pkg.id !== packageId))
      }
    } catch (err) {
      setError('خطا در حذف پکیج')
    }
  }

  const handleToggleActive = async (packageId: number) => {
    try {
      const response = await apiService.togglePackageActive(packageId)
      
      if (response.error) {
        setError(response.error)
      } else if (response.data) {
        setPackages(packages.map(pkg => 
          pkg.id === packageId 
            ? { ...pkg, is_active: response.data!.is_active }
            : pkg
        ))
      }
    } catch (err) {
      setError('خطا در تغییر وضعیت پکیج')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'rejected':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'تایید شده'
      case 'pending':
        return 'در حال بررسی'
      case 'rejected':
        return 'نیاز به ویرایش'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <>
        {/* Mobile */}
        <div className="md:hidden">
          <MobileDashboardLayout>
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </MobileDashboardLayout>
        </div>

        {/* Desktop */}
        <div className="hidden md:block">
          <DashboardLayout>
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </DashboardLayout>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden">
        <MobilePackageManagement
          packages={packages}
          error={error}
          onDeletePackage={handleDeletePackage}
          onToggleActive={handleToggleActive}
          onCreatePackage={() => setShowCreateModal(true)}
          getStatusColor={getStatusColor}
          getStatusText={getStatusText}
        />
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <DashboardLayout>
          <div className="p-6 max-w-7xl mx-auto" dir="rtl">
            {/* Header */}
            <div className="mb-8">
              <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                مدیریت پکیج‌های تبلیغاتی
              </h1>
              <p className={`${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                پکیج‌های من
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Action Bar */}
            <div className="mb-6 flex justify-between items-center">
              <div className="flex items-center space-x-4 space-x-reverse">
                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  تعداد کل: {packages.length}
                </span>
                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  فعال: {packages.filter(pkg => pkg.is_active).length}
                </span>
                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  تایید شده: {packages.filter(pkg => pkg.status === 'approved').length}
                </span>
              </div>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 space-x-reverse transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>ایجاد پکیج جدید</span>
              </button>
            </div>

            {/* Packages List */}
            {packages.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                  هنوز پکیجی ایجاد نکرده‌اید
                </h3>
                <p className={`${isDark ? 'text-slate-400' : 'text-gray-600'} mb-6`}>
                  برای شروع، اولین پکیج تبلیغاتی خود را ایجاد کنید
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  ایجاد اولین پکیج
                </button>
              </div>
            ) : (
              <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow-sm border ${isDark ? 'border-slate-600' : 'border-gray-200'} overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className={`${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
                      <tr>
                        <th className={`px-6 py-3 text-right text-xs font-medium ${isDark ? 'text-slate-300' : 'text-gray-500'} uppercase tracking-wider`}>
                          نام پکیج
                        </th>
                        <th className={`px-6 py-3 text-right text-xs font-medium ${isDark ? 'text-slate-300' : 'text-gray-500'} uppercase tracking-wider`}>
                          وضعیت
                        </th>
                        <th className={`px-6 py-3 text-right text-xs font-medium ${isDark ? 'text-slate-300' : 'text-gray-500'} uppercase tracking-wider`}>
                          تاریخ ایجاد
                        </th>
                        <th className={`px-6 py-3 text-right text-xs font-medium ${isDark ? 'text-slate-300' : 'text-gray-500'} uppercase tracking-wider`}>
                          آخرین ویرایش
                        </th>
                        <th className={`px-6 py-3 text-right text-xs font-medium ${isDark ? 'text-slate-300' : 'text-gray-500'} uppercase tracking-wider`}>
                          عملیات
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`${isDark ? 'bg-slate-800' : 'bg-white'} divide-y ${isDark ? 'divide-slate-600' : 'divide-gray-200'}`}>
                      {packages.map((pkg) => (
                        <tr key={pkg.id} className={`${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-50'}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                  </svg>
                                </div>
                              </div>
                              <div className="mr-4">
                                <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {pkg.business_name}
                                </div>
                                <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                                  پکیج تبلیغاتی
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(pkg.status)}`}>
                                {getStatusText(pkg.status)}
                              </span>
                              {pkg.is_active && (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-green-600 bg-green-100">
                                  فعال
                                </span>
                              )}
                            </div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                            {new Date(pkg.created_at).toLocaleDateString('fa-IR')}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                            {new Date(pkg.modified_at).toLocaleDateString('fa-IR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <button
                                onClick={() => handleToggleActive(pkg.id)}
                                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                  pkg.is_active
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                              >
                                {pkg.is_active ? 'غیرفعال' : 'فعال'}
                              </button>
                              <button
                                onClick={() => {/* TODO: Implement edit */}}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                ویرایش
                              </button>
                              <button
                                onClick={() => handleDeletePackage(pkg.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                حذف
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </DashboardLayout>
      </div>

      {/* Create Package Modal */}
      {showCreateModal && (
        <CreatePackageModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            loadPackages()
          }}
        />
      )}
    </>
  )
}

// Mobile Package Management Component
interface MobilePackageManagementProps {
  packages: Package[]
  error: string | null
  onDeletePackage: (id: number) => void
  onToggleActive: (id: number) => void
  onCreatePackage: () => void
  getStatusColor: (status: string) => string
  getStatusText: (status: string) => string
}

const MobilePackageManagement: React.FC<MobilePackageManagementProps> = ({
  packages,
  error,
  onDeletePackage,
  onToggleActive,
  onCreatePackage,
  getStatusColor,
  getStatusText
}) => {
  const { isDark } = useTheme()

  return (
    <MobileDashboardLayout>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-4 shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                مدیریت پکیج‌ها
              </h2>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                پکیج‌های تبلیغاتی شما
              </p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl">📦</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-4 shadow-sm text-center`}>
            <div className="text-2xl font-bold text-blue-500 mb-1">{packages.length}</div>
            <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>کل پکیج‌ها</div>
          </div>
          <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-4 shadow-sm text-center`}>
            <div className="text-2xl font-bold text-green-500 mb-1">{packages.filter(pkg => pkg.is_active).length}</div>
            <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>فعال</div>
          </div>
          <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-4 shadow-sm text-center`}>
            <div className="text-2xl font-bold text-purple-500 mb-1">{packages.filter(pkg => pkg.status === 'approved').length}</div>
            <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>تایید شده</div>
          </div>
        </div>

        {/* Create Package Button */}
        <button
          onClick={onCreatePackage}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl flex items-center justify-center space-x-2 space-x-reverse transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-lg font-medium">ایجاد پکیج جدید</span>
        </button>

        {/* Packages List */}
        {packages.length === 0 ? (
          <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-8 shadow-sm text-center`}>
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
              هنوز پکیجی ایجاد نکرده‌اید
            </h3>
            <p className={`${isDark ? 'text-slate-400' : 'text-gray-600'} mb-6`}>
              برای شروع، اولین پکیج تبلیغاتی خود را ایجاد کنید
            </p>
            <button
              onClick={onCreatePackage}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              ایجاد اولین پکیج
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {packages.map((pkg) => (
              <div key={pkg.id} className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-4 shadow-sm`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div>
                      <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {pkg.business_name}
                      </div>
                      <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                        پکیج تبلیغاتی
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(pkg.status)}`}>
                      {getStatusText(pkg.status)}
                    </span>
                    {pkg.is_active && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-green-600 bg-green-100">
                        فعال
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm mb-3">
                  <div className={`${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    ایجاد: {new Date(pkg.created_at).toLocaleDateString('fa-IR')}
                  </div>
                  <div className={`${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    ویرایش: {new Date(pkg.modified_at).toLocaleDateString('fa-IR')}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <button
                      onClick={() => onToggleActive(pkg.id)}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                        pkg.is_active
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {pkg.is_active ? 'غیرفعال' : 'فعال'}
                    </button>
                    <button
                      onClick={() => {/* TODO: Implement edit */}}
                      className="text-blue-600 hover:text-blue-900 text-sm"
                    >
                      ویرایش
                    </button>
                  </div>
                  <button
                    onClick={() => onDeletePackage(pkg.id)}
                    className="text-red-600 hover:text-red-900 text-sm"
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Spacing for Navigation */}
        <div className="h-4"></div>
      </div>
    </MobileDashboardLayout>
  )
}

// Create Package Modal Component
interface CreatePackageModalProps {
  onClose: () => void
  onSuccess: () => void
}

const CreatePackageModal: React.FC<CreatePackageModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    is_active: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setError(null)
      
      // For now, we'll create a basic package
      // In a real implementation, you'd need to get the business ID from the user's profile
      const response = await apiService.createPackage({
        business: 1, // This should come from the user's business profile
        ...formData,
        status: 'pending',
        is_complete: false,
      })
      
      if (response.error) {
        setError(response.error)
      } else {
        onSuccess()
      }
    } catch (err) {
      setError('خطا در ایجاد پکیج')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">ایجاد پکیج جدید</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تاریخ شروع
            </label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تاریخ پایان
            </label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="ml-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">فعال</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 space-x-reverse">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'در حال ایجاد...' : 'ایجاد پکیج'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
