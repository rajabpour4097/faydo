import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BusinessScreen } from '../../components/business/BusinessScreen'
import { apiService, BusinessDashboardData } from '../../services/api'
import { useTheme } from '../../contexts/ThemeContext'
import { faNum, formatToman } from '../../components/business/businessHomeUtils'

export const BusinessRegisterTransactionPage = () => {
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const [dash, setDash] = useState<BusinessDashboardData | null>(null)
  const [phone, setPhone] = useState('')
  const [amount, setAmount] = useState('')
  const [specialAmount, setSpecialAmount] = useState('')
  const [useSpecial, setUseSpecial] = useState(false)
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    apiService.getBusinessDashboard().then(response => {
      if (response.data) setDash(response.data)
    })
  }, [])

  const parseAmount = (value: string) => Number(value.replace(/,/g, '').replace(/[^\d]/g, '')) || 0
  const formatInput = (value: string) => {
    const n = parseAmount(value)
    return n ? n.toLocaleString('en-US') : ''
  }

  const original = parseAmount(amount)
  const special = useSpecial ? parseAmount(specialAmount) : 0
  const discountPct = dash?.package?.discount_percentage || 0
  const cashbackPct = dash?.package?.cashback_percentage || 0
  const specificPct = dash?.package?.specific_percentage || 0
  const afterDiscount = original - (original * discountPct) / 100
  const afterSpecial = special - (special * specificPct) / 100
  const finalAmount = afterDiscount + (useSpecial ? afterSpecial : 0)
  const cashback = (original * cashbackPct) / 100

  const canSubmit = useMemo(() => phone.trim().length >= 10 && original > 0 && !loading, [phone, original, loading])

  const page = isDark ? 'bg-slate-900 text-white' : 'bg-[#F4F6FB] text-gray-900'
  const card = isDark ? 'bg-slate-800' : 'bg-white'
  const inputClass = `w-full rounded-2xl border px-4 py-3 text-sm ${isDark ? 'border-slate-600 bg-slate-800' : 'border-gray-100 bg-white'}`

  const submit = async () => {
    setError(null)
    setSuccess(null)
    setLoading(true)
    const response = await apiService.createBusinessTransaction({
      phone: phone.trim(),
      original_amount: original,
      has_special_discount: useSpecial,
      special_discount_original_amount: useSpecial ? special : undefined,
      note: note.trim() || undefined,
      auto_approve: true,
    })
    setLoading(false)
    if (response.error) {
      setError(response.error)
      return
    }
    setSuccess('تراکنش با موفقیت ثبت و تایید شد.')
    setTimeout(() => navigate('/dashboard/transactions'), 900)
  }

  return (
    <BusinessScreen>
      <div className={`min-h-full px-4 py-4 ${page}`} dir="rtl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-black">ثبت تراکنش</h1>
          <Link to="/dashboard" className="text-sm text-[#7C5CFC]">بازگشت</Link>
        </div>
        <p className="mb-4 text-[12px] leading-6 text-gray-400">
          خرید مشتری را با شماره موبایل ثبت کنید. تخفیف پکیج فعال به‌صورت خودکار اعمال می‌شود.
        </p>

        {!dash?.package || !dash.package.is_active || dash.package.status !== 'approved' ? (
          <div className={`rounded-3xl p-5 text-center ${card}`}>
            <p className="text-sm text-gray-500">برای ثبت تراکنش باید پکیج فعال و تاییدشده داشته باشید.</p>
            <Link to="/dashboard/packages" className="mt-3 inline-block font-bold text-[#7C5CFC]">مدیریت پکیج</Link>
          </div>
        ) : (
          <div className="space-y-3">
            <div className={`rounded-[24px] p-4 ${card}`}>
              <label className="mb-1 block text-xs font-bold">شماره موبایل مشتری</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} inputMode="tel" placeholder="0912..." className={inputClass} />
            </div>
            <div className={`rounded-[24px] p-4 ${card}`}>
              <label className="mb-1 block text-xs font-bold">مبلغ فاکتور (تومان)</label>
              <input value={amount} onChange={e => setAmount(formatInput(e.target.value))} inputMode="numeric" placeholder="مثلاً 250,000" className={inputClass} />
              <p className="mt-2 text-[11px] text-gray-400">
                تخفیف فوری {faNum(discountPct)}٪ · کش‌بک {faNum(cashbackPct)}٪
              </p>
            </div>
            {dash.package.specific_title && (
              <div className={`rounded-[24px] p-4 ${card}`}>
                <label className="flex items-center justify-between text-xs font-bold">
                  تخفیف اختصاصی ({dash.package.specific_title})
                  <input type="checkbox" checked={useSpecial} onChange={e => setUseSpecial(e.target.checked)} />
                </label>
                {useSpecial && (
                  <input
                    value={specialAmount}
                    onChange={e => setSpecialAmount(formatInput(e.target.value))}
                    inputMode="numeric"
                    placeholder="مبلغ مشمول تخفیف اختصاصی"
                    className={`${inputClass} mt-3`}
                  />
                )}
              </div>
            )}
            <div className={`rounded-[24px] p-4 ${card}`}>
              <label className="mb-1 block text-xs font-bold">یادداشت (اختیاری)</label>
              <input value={note} onChange={e => setNote(e.target.value)} className={inputClass} />
            </div>
            <div className={`rounded-[24px] p-4 ${card}`}>
              <div className="flex items-center justify-between text-sm">
                <span>مبلغ نهایی</span>
                <span className="font-black text-[#7C5CFC]">{formatToman(finalAmount)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[12px] text-gray-400">
                <span>کش‌بک مشتری</span>
                <span>{formatToman(cashback)}</span>
              </div>
            </div>
            {error && <p className="text-sm text-rose-500">{error}</p>}
            {success && <p className="text-sm text-emerald-500">{success}</p>}
            <button
              disabled={!canSubmit}
              onClick={submit}
              className="w-full rounded-2xl bg-[#7C5CFC] py-3.5 text-sm font-bold text-white disabled:opacity-50"
            >
              {loading ? 'در حال ثبت...' : 'ثبت و تایید تراکنش'}
            </button>
          </div>
        )}
      </div>
    </BusinessScreen>
  )
}
