import React, { useState } from 'react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { DiscountCreate as DiscountCreateType } from '../../types/discount'
import discountService from '../../services/discountService'
import { useNavigate } from 'react-router-dom'

export const DiscountCreate: React.FC = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<DiscountCreateType>({
    title: '',
    description: '',
    percentage: 10,
    start_date: '',
    end_date: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'percentage' ? Math.max(0, Math.min(100, parseInt(value || '0'))) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (!formData.title.trim()) throw new Error('عنوان را وارد کنید')
      if (!formData.start_date || !formData.end_date) throw new Error('تاریخ‌ها را کامل کنید')
      if (new Date(formData.end_date) <= new Date(formData.start_date)) throw new Error('تاریخ پایان باید بعد از شروع باشد')

      await discountService.createDiscount({
        title: formData.title.trim(),
        description: formData.description?.trim() || undefined,
        percentage: formData.percentage,
        start_date: formData.start_date,
        end_date: formData.end_date,
      })

      navigate('/dashboard/business/discounts')
    } catch (err: any) {
      setError(err.message || 'خطا در ایجاد تخفیف')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-4rem)] p-4 lg:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">ایجاد تخفیف جدید</h1>
            <p className="text-white/70 text-sm mt-1">اطلاعات زیر را تکمیل کنید و ثبت نمایید.</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 text-white space-y-5">
            <div>
              <label className="block text-sm mb-1">عنوان *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="مثال: تخفیف ویژه پاییز"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">توضیحات</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="توضیحات اضافی..."
              />
            </div>

            <div>
              <label className="block text-sm mb-1">درصد تخفیف (1-100) *</label>
              <input
                type="number"
                name="percentage"
                value={formData.percentage}
                onChange={handleChange}
                min={1}
                max={100}
                className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">تاریخ شروع *</label>
                <input
                  type="datetime-local"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">تاریخ پایان *</label>
                <input
                  type="datetime-local"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 rounded-md border border-white/10 hover:bg-white/5"
                disabled={submitting}
              >
                انصراف
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-md bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border border-white/10 text-white disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? 'در حال ثبت...' : 'ثبت تخفیف'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default DiscountCreate
