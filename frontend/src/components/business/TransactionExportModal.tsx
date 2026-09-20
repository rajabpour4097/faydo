import { useState } from 'react'
import { apiService, BusinessTransactionQuery } from '../../services/api'
import { useTheme } from '../../contexts/ThemeContext'
import { PersianDateTimePicker, nowDateTimeValue, startOfTodayValue } from '../PersianDateTimePicker'
import {
  PERIOD_OPTIONS,
  STATUS_TABS,
  TYPE_OPTIONS,
  TxPeriod,
  TxStatus,
  downloadBlob,
} from './businessTransactionUtils'

interface Props {
  open: boolean
  onClose: () => void
  initial: BusinessTransactionQuery
}

const FORMATS: { id: 'xlsx' | 'pdf' | 'csv'; label: string; hint: string }[] = [
  { id: 'xlsx', label: 'اکسل', hint: 'Excel' },
  { id: 'pdf', label: 'PDF', hint: 'چاپ / ذخیره' },
  { id: 'csv', label: 'CSV', hint: 'جدول متنی' },
]

export function TransactionExportModal({ open, onClose, initial }: Props) {
  const { isDark } = useTheme()
  const [period, setPeriod] = useState<TxPeriod>((initial.period as TxPeriod) || 'today')
  const [dateFrom, setDateFrom] = useState(initial.date_from || '')
  const [dateTo, setDateTo] = useState(initial.date_to || '')
  const [status, setStatus] = useState<TxStatus>((initial.status as TxStatus) || 'all')
  const [transactionType, setTransactionType] = useState(initial.transaction_type || 'all')
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const card = isDark ? 'bg-slate-800 text-white' : 'bg-white text-gray-900'

  const query = (): BusinessTransactionQuery => ({
    period,
    date_from: period === 'custom' ? dateFrom : undefined,
    date_to: period === 'custom' ? dateTo : undefined,
    status,
    transaction_type: transactionType,
    search: initial.search,
  })

  const exportAs = async (format: 'xlsx' | 'pdf' | 'csv') => {
    setError(null)
    setBusy(format)
    const result = await apiService.exportBusinessTransactions({ ...query(), format })
    setBusy(null)
    if (result.error || !result.blob) {
      setError(result.error || 'خطا در تهیه گزارش')
      return
    }
    if (format === 'pdf') {
      const url = URL.createObjectURL(result.blob)
      window.open(url, '_blank')
      return
    }
    downloadBlob(result.blob, result.filename || `faydo-transactions.${format}`)
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div className={`w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl p-5 sm:rounded-3xl ${card}`} dir="rtl" onClick={event => event.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-black">خروجی گزارش</h2>
          <button onClick={onClose} className="text-sm text-gray-400">بستن</button>
        </div>
        <p className="mb-4 text-[12px] leading-6 text-gray-400">
          قبل از دریافت فایل، بازه زمانی، وضعیت و نوع تراکنش را مشخص کنید.
        </p>

        <label className="mb-1 block text-xs font-bold">بازه زمانی</label>
        <div className="mb-3 grid grid-cols-3 gap-2">
          {PERIOD_OPTIONS.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setPeriod(item.id)
                if (item.id === 'custom') {
                  setDateFrom(current => current || startOfTodayValue())
                  setDateTo(current => current || nowDateTimeValue())
                }
              }}
              className={`rounded-2xl px-2 py-2 text-[11px] font-bold ${
                period === item.id ? 'bg-[#7C5CFC] text-white' : isDark ? 'bg-slate-700 text-slate-300' : 'bg-[#F4F6FB] text-gray-600'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        {period === 'custom' && (
          <div className="mb-3 space-y-2">
            <PersianDateTimePicker
              label="از تاریخ و ساعت"
              value={dateFrom}
              onChange={setDateFrom}
              isDark={isDark}
              fallback="start"
              placeholder="شروع بازه"
            />
            <PersianDateTimePicker
              label="تا تاریخ و ساعت"
              value={dateTo}
              onChange={setDateTo}
              isDark={isDark}
              fallback="now"
              placeholder="پایان بازه"
            />
          </div>
        )}

        <label className="mb-1 block text-xs font-bold">وضعیت تراکنش</label>
        <div className="mb-3 flex flex-wrap gap-2">
          {STATUS_TABS.map(item => (
            <button
              key={item.id}
              onClick={() => setStatus(item.id)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${
                status === item.id ? 'bg-[#7C5CFC] text-white' : isDark ? 'bg-slate-700 text-slate-300' : 'bg-[#F4F6FB] text-gray-600'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <label className="mb-1 block text-xs font-bold">نوع تراکنش</label>
        <div className="mb-4 flex flex-wrap gap-2">
          {TYPE_OPTIONS.map(item => (
            <button
              key={item.id}
              onClick={() => setTransactionType(item.id)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${
                transactionType === item.id ? 'bg-[#7C5CFC] text-white' : isDark ? 'bg-slate-700 text-slate-300' : 'bg-[#F4F6FB] text-gray-600'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {error && <p className="mb-3 text-center text-sm text-rose-500">{error}</p>}

        <div className="grid grid-cols-3 gap-2">
          {FORMATS.map(item => (
            <button
              key={item.id}
              disabled={!!busy}
              onClick={() => exportAs(item.id)}
              className="rounded-2xl bg-[#7C5CFC] px-2 py-3 text-white disabled:opacity-60"
            >
              <div className="text-sm font-black">{busy === item.id ? '...' : item.label}</div>
              <div className="mt-0.5 text-[10px] text-white/80">{item.hint}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
