import React, { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { BusinessInfo, loyaltyService, TransactionCreate } from '../../services/loyalty'
import { getFullImageUrl } from '../../services/api'
import { MEMBERSHIP_TIERS } from '../../constants/membershipTiers'
import { EliteGiftClaimModal } from './EliteGiftClaimModal'
import { normalizeDigits } from '../../utils/digits'
import {
  FLOW_NAVY,
  FLOW_PURPLE,
  calcPurchase,
  formatTomanFa,
  formatTomanInput,
  parseToman,
} from './purchaseFlowUtils'

type Step = 'scan' | 'business' | 'amount' | 'calc' | 'cashback' | 'review'

interface CustomerPurchaseFlowProps {
  isOpen: boolean
  onClose: () => void
}

const QR_REGION_ID = 'customer-purchase-qr-reader'

export const CustomerPurchaseFlow: React.FC<CustomerPurchaseFlowProps> = ({
  isOpen,
  onClose,
}) => {
  const [step, setStep] = useState<Step>('scan')
  const [error, setError] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [isLoadingBusiness, setIsLoadingBusiness] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null)
  const [amountDigits, setAmountDigits] = useState('')
  const [useCashback, setUseCashback] = useState(false)
  const [cashbackInput, setCashbackInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [showEliteGift, setShowEliteGift] = useState(false)

  const scannerRef = useRef<Html5Qrcode | null>(null)
  const initializedRef = useRef(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const original = parseToman(amountDigits)
  const availableCashback = businessInfo ? parseToman(businessInfo.available_cashback || 0) : 0
  const requestedCashback = useCashback ? parseToman(cashbackInput) : 0
  const totals = businessInfo
    ? calcPurchase(original, businessInfo, requestedCashback)
    : null

  const resetAll = () => {
    setStep('scan')
    setError(null)
    setShowGuide(false)
    setShowManualEntry(false)
    setManualCode('')
    setBusinessInfo(null)
    setAmountDigits('')
    setUseCashback(false)
    setCashbackInput('')
    setIsSubmitting(false)
    setSent(false)
    setShowEliteGift(false)
    initializedRef.current = false
  }

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop()
        }
        scannerRef.current.clear()
      } catch {
        /* ignore */
      } finally {
        scannerRef.current = null
      }
    }
    setIsScanning(false)
  }

  const startScanner = async () => {
    try {
      setError(null)
      if (scannerRef.current?.isScanning) return
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) await scannerRef.current.stop()
          scannerRef.current.clear()
        } catch {
          /* ignore */
        }
        scannerRef.current = null
      }
      setIsScanning(true)
      scannerRef.current = new Html5Qrcode(QR_REGION_ID)
      const cameras = await Html5Qrcode.getCameras()
      if (!cameras?.length) {
        setError('دوربینی یافت نشد. می‌توانید از گالری یا ورود کد استفاده کنید.')
        setIsScanning(false)
        return
      }
      const backCamera = cameras.find(camera =>
        camera.label.toLowerCase().includes('back') ||
        camera.label.toLowerCase().includes('rear')
      )
      await scannerRef.current.start(
        backCamera ? backCamera.id : cameras[0].id,
        { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1 },
        decodedText => {
          void fetchBusiness(decodedText.trim())
        },
        () => undefined,
      )
    } catch (err: any) {
      if (err?.name === 'NotAllowedError') {
        setError('لطفاً دسترسی به دوربین را اجازه دهید')
      } else {
        setError('خطا در راه‌اندازی اسکنر')
      }
      setIsScanning(false)
    }
  }

  useEffect(() => {
    if (isOpen && step === 'scan' && !initializedRef.current) {
      initializedRef.current = true
      const timer = setTimeout(() => {
        void startScanner()
      }, 120)
      return () => clearTimeout(timer)
    }
    if (!isOpen) {
      void stopScanner()
      resetAll()
    }
    return () => {
      if (!isOpen) void stopScanner()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, step])

  const fetchBusiness = async (code: string) => {
    if (!code || isLoadingBusiness) return
    setIsLoadingBusiness(true)
    setError(null)
    await stopScanner()
    try {
      const info = await loyaltyService.getBusinessByCode(code)
      if (!info.has_active_package) {
        setError(`متأسفانه «${info.business_name}» پکیج فعالی ندارد`)
        initializedRef.current = false
        setTimeout(() => {
          initializedRef.current = true
          void startScanner()
        }, 400)
        return
      }
      setBusinessInfo(info)
      setStep('business')
    } catch (err: any) {
      setError(err.error || err.response?.data?.error || 'کسب‌وکاری با این کد یافت نشد')
      initializedRef.current = false
      setTimeout(() => {
        initializedRef.current = true
        void startScanner()
      }, 400)
    } finally {
      setIsLoadingBusiness(false)
    }
  }

  const handleGallery = async (file?: File) => {
    if (!file) return
    setError(null)
    try {
      await stopScanner()
      const scanner = new Html5Qrcode(QR_REGION_ID)
      const decoded = await scanner.scanFile(file, true)
      scanner.clear()
      await fetchBusiness(decoded.trim())
    } catch {
      setError('QR معتبری در تصویر پیدا نشد')
      initializedRef.current = false
      setTimeout(() => void startScanner(), 200)
    }
  }

  const submitManualCode = async () => {
    const code = normalizeDigits(manualCode)
    if (!code) {
      setError('لطفاً کد یکتای کسب‌وکار را وارد کنید')
      return
    }
    setError(null)
    await fetchBusiness(code)
  }

  const handleClose = async () => {
    await stopScanner()
    resetAll()
    onClose()
  }

  const handleKeypad = (key: string) => {
    if (key === 'back') {
      setAmountDigits(prev => prev.slice(0, -1))
      return
    }
    if (amountDigits.length >= 12) return
    setAmountDigits(prev => (prev === '0' ? key : prev + key))
  }

  const maxUsableCashback = totals
    ? Math.min(availableCashback, totals.afterDiscount)
    : availableCashback

  const handleCashbackChange = (raw: string) => {
    const next = parseToman(raw)
    const capped = Math.min(next, maxUsableCashback)
    setCashbackInput(capped ? formatTomanInput(capped) : '')
  }

  const handleSubmit = async () => {
    if (!businessInfo || !totals || original <= 0) return
    if (useCashback && requestedCashback <= 0) {
      setError('مبلغ کش‌بک را وارد کنید یا گزینه را خاموش کنید')
      return
    }
    if (requestedCashback > maxUsableCashback) {
      setError(`حداکثر کش‌بک قابل استفاده ${formatTomanFa(maxUsableCashback)} تومان است`)
      return
    }
    setIsSubmitting(true)
    setError(null)
    try {
      const payload: TransactionCreate = {
        business: businessInfo.business_id,
        original_amount: original,
        has_special_discount: false,
        cashback_used_amount: requestedCashback,
      }
      await loyaltyService.createTransaction(payload)
      setSent(true)
      setTimeout(() => {
        void handleClose()
      }, 1600)
    } catch (err: any) {
      let errorMsg = 'خطا در ارسال تراکنش'
      const data = err?.response?.data || err
      if (data?.error) errorMsg = data.error
      else if (data?.cashback_used_amount) {
        errorMsg = Array.isArray(data.cashback_used_amount)
          ? data.cashback_used_amount[0]
          : String(data.cashback_used_amount)
      } else if (typeof data === 'string') errorMsg = data
      setError(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  if (showEliteGift && businessInfo) {
    return (
      <EliteGiftClaimModal
        isOpen
        businessInfo={businessInfo}
        onClose={() => {
          setShowEliteGift(false)
          void handleClose()
        }}
      />
    )
  }

  if (sent) {
    return (
      <Shell>
        <div className="flex min-h-full flex-col items-center justify-center px-8 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-violet-100">
            <svg className="h-10 w-10 text-[#7C5CFC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-black text-gray-900">برای کسب‌وکار ارسال شد</h3>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            پس از مشاهده و تایید کسب‌وکار، نتیجه برای شما ارسال می‌شود.
          </p>
        </div>
      </Shell>
    )
  }

  if (step === 'scan') {
    return (
      <div className="fixed inset-0 z-[80]" style={{ background: FLOW_NAVY }} dir="rtl">
        <div className="mx-auto flex h-full max-w-md flex-col px-5 pb-6 pt-5 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black">اسکن QR code کسب‌وکار</h2>
            <button onClick={() => void handleClose()} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10" aria-label="بستن">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="relative mx-auto mt-8 w-full max-w-[280px] flex-1">
            <style>{`
              #${QR_REGION_ID} video {
                width: 100% !important;
                height: 100% !important;
                object-fit: cover;
                border-radius: 28px;
              }
              #${QR_REGION_ID} img { display: none; }
            `}</style>
            <div id={QR_REGION_ID} className="h-full min-h-[280px] overflow-hidden rounded-[28px] bg-black/40" />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="relative h-56 w-56">
                <span className="absolute right-0 top-0 h-10 w-10 rounded-tr-2xl border-t-[3px] border-r-[3px] border-white" />
                <span className="absolute left-0 top-0 h-10 w-10 rounded-tl-2xl border-t-[3px] border-l-[3px] border-white" />
                <span className="absolute bottom-0 right-0 h-10 w-10 rounded-br-2xl border-b-[3px] border-r-[3px] border-white" />
                <span className="absolute bottom-0 left-0 h-10 w-10 rounded-bl-2xl border-b-[3px] border-l-[3px] border-white" />
                {isScanning && <div className="absolute inset-x-4 top-1/2 h-0.5 bg-white/80" />}
              </div>
            </div>
          </div>

          {isLoadingBusiness ? (
            <p className="mt-4 text-center text-sm text-white/80">در حال دریافت اطلاعات کسب‌وکار...</p>
          ) : error ? (
            <p className="mt-4 text-center text-sm text-rose-300">{error}</p>
          ) : (
            <p className="mt-4 text-center text-sm text-white/75">QR را داخل کادر قرار دهید</p>
          )}

          <button
            type="button"
            onClick={() => {
              setError(null)
              setShowManualEntry(true)
            }}
            className="mt-3 text-center text-[12px] font-bold text-white/90 underline decoration-white/40 underline-offset-4"
          >
            وارد کردن دستی کد کسب‌وکار
          </button>

          <div className="mt-6 flex items-center justify-center gap-8">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-1 text-[11px] text-white/80"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </span>
              گالری
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null)
                setShowManualEntry(true)
              }}
              className="flex flex-col items-center gap-1 text-[11px] text-white/80"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 8h10M7 12h6m-8 8h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </span>
              ورود کد
            </button>
            <button
              type="button"
              onClick={() => setShowGuide(true)}
              className="flex flex-col items-center gap-1 text-[11px] text-white/80"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              راهنما
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={event => {
              const file = event.target.files?.[0]
              event.target.value = ''
              void handleGallery(file)
            }}
          />
        </div>

        {showManualEntry && (
          <div className="absolute inset-0 z-10 flex items-end bg-black/50" onClick={() => setShowManualEntry(false)}>
            <div className="w-full rounded-t-3xl bg-white p-5 text-gray-900" onClick={event => event.stopPropagation()} dir="rtl">
              <h3 className="text-base font-black">ورود دستی کد کسب‌وکار</h3>
              <p className="mt-2 text-sm leading-7 text-gray-500">
                کد یکتای چاپ‌شده روی QR کسب‌وکار را وارد کنید.
              </p>
              <input
                value={manualCode}
                onChange={event => setManualCode(normalizeDigits(event.target.value, 12))}
                inputMode="numeric"
                autoFocus
                placeholder="مثال: ۱۱۱۱۱۱"
                className="mt-3 w-full rounded-2xl border border-gray-200 px-4 py-3 text-center text-lg font-bold tracking-widest"
                onKeyDown={event => {
                  if (event.key === 'Enter') void submitManualCode()
                }}
              />
              {error && <p className="mt-2 text-center text-sm text-rose-500">{error}</p>}
              <button
                onClick={() => void submitManualCode()}
                disabled={isLoadingBusiness || !manualCode.trim()}
                className="mt-3 w-full rounded-2xl py-3 text-sm font-black text-white disabled:opacity-40"
                style={{ background: FLOW_PURPLE }}
              >
                {isLoadingBusiness ? 'در حال بررسی...' : 'تایید کد'}
              </button>
              <button
                type="button"
                onClick={() => setShowManualEntry(false)}
                className="mt-2 w-full py-2 text-sm font-medium text-gray-400"
              >
                انصراف
              </button>
            </div>
          </div>
        )}

        {showGuide && (
          <div className="absolute inset-0 z-10 flex items-end bg-black/50" onClick={() => setShowGuide(false)}>
            <div className="w-full rounded-t-3xl bg-white p-5 text-gray-900" onClick={event => event.stopPropagation()} dir="rtl">
              <h3 className="text-base font-black">راهنمای اسکن</h3>
              <p className="mt-2 text-sm leading-7 text-gray-500">
                QR کسب‌وکار را در کادر قرار دهید. اگر دوربین در دسترس نبود، از گالری عکس بگیرید یا کد یکتا را دستی وارد کنید.
              </p>
              <button
                onClick={() => {
                  setShowGuide(false)
                  setShowManualEntry(true)
                }}
                className="mt-3 w-full rounded-2xl py-3 text-sm font-black text-white"
                style={{ background: FLOW_PURPLE }}
              >
                ورود دستی کد کسب‌وکار
              </button>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="mt-2 w-full py-2 text-sm font-medium text-gray-400"
              >
                بستن
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (!businessInfo || !totals) return null

  const logo = getFullImageUrl(businessInfo.business_logo)
  const membership = MEMBERSHIP_TIERS[businessInfo.customer_membership_level || 'bronze']
  const rating = Number(businessInfo.average_rating || 0)

  return (
    <Shell>
      <header className="flex items-center justify-between px-5 pt-5">
        <h2 className="text-base font-black text-gray-900">
          {step === 'business' && 'تایید کسب‌وکار'}
          {step === 'amount' && 'ثبت مبلغ فاکتور'}
          {step === 'calc' && 'خلاصه خرید'}
          {step === 'cashback' && 'استفاده از کش‌بک قبلی'}
          {step === 'review' && 'بررسی نهایی'}
        </h2>
        <button onClick={() => void handleClose()} className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500" aria-label="بستن">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-4">
        {step === 'business' && (
          <div className="flex flex-col items-center text-center">
            <div className="h-24 w-24 overflow-hidden rounded-full bg-gray-100 ring-4 ring-violet-100">
              {logo ? (
                <img src={logo} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-black text-[#7C5CFC]">
                  {(businessInfo.business_name || 'ک').charAt(0)}
                </div>
              )}
            </div>
            <h3 className="mt-4 text-xl font-black text-gray-900">{businessInfo.business_name}</h3>
            <div className="mt-1 flex items-center gap-1 text-amber-500">
              {[1, 2, 3, 4, 5].map(star => (
                <svg key={star} className={`h-4 w-4 ${star <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="mr-1 text-sm font-bold text-gray-700">{rating ? rating.toFixed(1) : '—'}</span>
            </div>
            <div className={`mt-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold ring-1 ${membership.badgeBg} ${membership.badgeText} ${membership.ring}`}>
              <img src={membership.icon} alt="" className="h-4 w-4 object-contain" />
              عضو باشگاه {membership.label}
            </div>

            <div className="mt-6 w-full rounded-3xl bg-[#F7F4FF] p-4 text-right">
              <p className="mb-3 text-sm font-black text-gray-800">مزایای شما در این کسب‌وکار</p>
              <BenefitRow
                label={`${formatTomanFa(totals.discountPct)}٪ تخفیف آنی از خرید جاری`}
                tone="violet"
              />
              <BenefitRow
                label={`${formatTomanFa(totals.cashbackPct)}٪ کش‌بک از خرید جاری`}
                tone="teal"
              />
            </div>

            <button
              onClick={() => setStep('amount')}
              className="mt-6 w-full rounded-2xl py-3.5 text-sm font-black text-white"
              style={{ background: FLOW_PURPLE }}
            >
              ثبت خرید
            </button>
            {businessInfo.can_use_elite_gift && (
              <button
                onClick={() => setShowEliteGift(true)}
                className="mt-3 text-sm font-bold text-[#7C5CFC]"
              >
                استفاده از هدیه الیت
              </button>
            )}
            <button onClick={() => void handleClose()} className="mt-3 text-sm font-medium text-gray-400">
              انصراف
            </button>
          </div>
        )}

        {step === 'amount' && (
          <div>
            <p className="text-center text-sm text-gray-500">مبلغ فاکتور را به تومان وارد کنید</p>
            <div className="mt-6 text-center">
              <div className="text-3xl font-black tracking-tight text-gray-900">
                {original ? formatTomanInput(original) : '0'}
              </div>
              <div className="mt-1 text-sm text-gray-400">تومان</div>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-3" dir="ltr">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'].map((key, index) => (
                key === '' ? (
                  <div key={index} />
                ) : (
                  <button
                    key={key}
                    onClick={() => handleKeypad(key)}
                    className="h-14 rounded-2xl bg-gray-50 text-xl font-bold text-gray-800 active:bg-gray-100"
                  >
                    {key === 'back' ? '⌫' : key}
                  </button>
                )
              ))}
            </div>
            <button
              disabled={original <= 0}
              onClick={() => setStep('calc')}
              className="mt-6 w-full rounded-2xl py-3.5 text-sm font-black text-white disabled:opacity-40"
              style={{ background: FLOW_PURPLE }}
            >
              ادامه
            </button>
          </div>
        )}

        {step === 'calc' && (
          <div>
            <SummaryRow label="مبلغ فاکتور" value={`${formatTomanInput(original)} تومان`} />
            <SummaryRow
              label={`تخفیف (${formatTomanFa(totals.discountPct)}٪)`}
              value={`−${formatTomanInput(totals.discountAmount)} تومان`}
              valueClass="text-rose-500"
            />
            <SummaryRow
              label="مبلغ بعد از تخفیف"
              value={`${formatTomanInput(totals.afterDiscount)} تومان`}
              bold
            />
            <div className="mt-4 rounded-2xl bg-[#F7F4FF] p-4">
              <SummaryRow label="امتیاز این خرید" value={`${formatTomanFa(totals.points)} امتیاز`} valueClass="text-[#7C5CFC]" />
              <SummaryRow
                label="کش‌بک این خرید"
                value={`+${formatTomanInput(totals.cashbackEarned)} تومان`}
                valueClass="text-teal-500"
              />
            </div>
            <button
              onClick={() => setStep('cashback')}
              className="mt-6 w-full rounded-2xl py-3.5 text-sm font-black text-white"
              style={{ background: FLOW_PURPLE }}
            >
              ادامه
            </button>
          </div>
        )}

        {step === 'cashback' && (
          <div>
            <div className="rounded-3xl bg-[#F4FBFA] p-4">
              <p className="text-sm text-gray-500">کش‌بک قابل استفاده در این کسب‌وکار</p>
              <p className="mt-1 text-xl font-black text-teal-600">
                {formatTomanInput(availableCashback)} تومان
              </p>
              {availableCashback <= 0 && (
                <p className="mt-1 text-[11px] text-gray-400">
                  هنوز کش‌بک تاییدشده‌ای در این کسب‌وکار ندارید
                </p>
              )}
            </div>

            <label className={`mt-4 flex cursor-pointer items-start gap-3 rounded-3xl border p-4 ${useCashback ? 'border-[#7C5CFC] bg-[#F7F4FF]' : 'border-gray-200'} ${availableCashback <= 0 ? 'opacity-60' : ''}`}>
              <span
                className={`mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                  useCashback ? 'border-[#7C5CFC]' : 'border-gray-300'
                }`}
              >
                {useCashback && <span className="h-2.5 w-2.5 rounded-full bg-[#7C5CFC]" />}
              </span>
              <input
                type="checkbox"
                className="sr-only"
                checked={useCashback}
                disabled={availableCashback <= 0}
                onChange={event => {
                  setUseCashback(event.target.checked)
                  if (!event.target.checked) setCashbackInput('')
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-gray-900">استفاده از کش‌بک</p>
                <p className="mt-1 text-[11px] text-gray-400">مبلغ را به تومان وارد کنید</p>
                <input
                  disabled={!useCashback}
                  value={cashbackInput}
                  onChange={event => handleCashbackChange(event.target.value)}
                  inputMode="numeric"
                  placeholder="100,000"
                  className="mt-3 w-full rounded-2xl border border-gray-200 px-3 py-2.5 text-left text-lg font-bold disabled:bg-gray-50"
                  dir="ltr"
                />
              </div>
            </label>

            <div className="mt-5 rounded-3xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">قیمت نهایی پرداختی (جمع)</p>
              <p className="mt-1 text-2xl font-black text-gray-900">
                {formatTomanInput(totals.payable)} تومان
              </p>
            </div>

            {error && <p className="mt-3 text-center text-sm text-rose-500">{error}</p>}

            <button
              onClick={() => {
                if (useCashback && parseToman(cashbackInput) <= 0) {
                  setError('مبلغ کش‌بک را وارد کنید یا گزینه را خاموش کنید')
                  return
                }
                setError(null)
                setStep('review')
              }}
              className="mt-6 w-full rounded-2xl py-3.5 text-sm font-black text-white"
              style={{ background: FLOW_PURPLE }}
            >
              ادامه و ارسال
            </button>
          </div>
        )}

        {step === 'review' && (
          <div>
            <SummaryRow label="مبلغ پس از تخفیف" value={`${formatTomanInput(totals.afterDiscount)} تومان`} />
            <SummaryRow
              label="کش‌بک استفاده‌شده"
              value={requestedCashback ? `−${formatTomanInput(requestedCashback)} تومان` : '۰ تومان'}
              valueClass="text-rose-500"
            />
            <SummaryRow
              label="مبلغ قابل پرداخت"
              value={`${formatTomanInput(totals.payable)} تومان`}
              bold
            />
            <div className="mt-4 rounded-2xl bg-[#F7F4FF] p-4">
              <SummaryRow label="امتیاز این خرید" value={`${formatTomanFa(totals.points)} امتیاز`} valueClass="text-[#7C5CFC]" />
              <SummaryRow
                label="کش‌بک این خرید"
                value={`+${formatTomanInput(totals.cashbackEarned)} تومان`}
                valueClass="text-teal-500"
              />
            </div>
            {error && <p className="mt-3 text-center text-sm text-rose-500">{error}</p>}
            <button
              disabled={isSubmitting}
              onClick={() => void handleSubmit()}
              className="mt-6 w-full rounded-2xl py-3.5 text-sm font-black text-white disabled:opacity-50"
              style={{ background: FLOW_PURPLE }}
            >
              {isSubmitting ? 'در حال ارسال...' : 'تایید و ارسال برای کسب‌وکار'}
            </button>
            <button onClick={() => setStep('cashback')} className="mt-3 w-full text-sm font-medium text-gray-400">
              بازگشت
            </button>
          </div>
        )}
      </div>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[80] bg-black/50" dir="rtl">
      <div className="mx-auto flex h-full max-w-md flex-col bg-white shadow-2xl">
        {children}
      </div>
    </div>
  )
}

function BenefitRow({ label, tone }: { label: string; tone: 'violet' | 'teal' }) {
  const color = tone === 'teal' ? 'text-teal-600 bg-teal-50' : 'text-[#7C5CFC] bg-white'
  return (
    <div className="mb-2 flex items-center gap-2 last:mb-0">
      <span className={`flex h-7 w-7 items-center justify-center rounded-full ${color}`}>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 13l4 4L19 7" />
        </svg>
      </span>
      <span className="text-sm font-bold text-gray-700">{label}</span>
    </div>
  )
}

function SummaryRow({
  label,
  value,
  valueClass = 'text-gray-900',
  bold = false,
}: {
  label: string
  value: string
  valueClass?: string
  bold?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-2.5 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`${bold ? 'text-base font-black' : 'font-bold'} ${valueClass}`}>{value}</span>
    </div>
  )
}
