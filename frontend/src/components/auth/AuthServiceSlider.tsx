import { useEffect, useState } from 'react'

const SLIDES = [
  {
    title: 'باشگاه‌های فایدو',
    subtitle: 'کافه، زیبایی، سبک زندگی — تجربه‌های VIP اختصاصی',
    gradient: 'from-orange-400 via-rose-400 to-red-500',
    emoji: '🍽️',
  },
  {
    title: 'پکیج‌های هوشمند',
    subtitle: 'تخفیف، هدیه وفاداری و امتیاز برای مشتریان',
    gradient: 'from-blue-500 via-indigo-500 to-violet-600',
    emoji: '🎁',
  },
  {
    title: 'کشف کسب‌وکارها',
    subtitle: 'جستجو روی نقشه، فیلتر شهر و دسته‌بندی',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
    emoji: '🗺️',
  },
  {
    title: 'مدیریت آسان',
    subtitle: 'ثبت پکیج، پروفایل و گزارش‌ها در یک پنل',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    emoji: '📊',
  },
]

export const AuthServiceSlider = () => {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % SLIDES.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  const slide = SLIDES[active]

  return (
    <div className="mb-4">
      <div className="flex justify-center mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-blue-900 tracking-tight">فایدو</span>
          <span className="text-xs text-gray-400 font-medium">Faydo</span>
        </div>
      </div>
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${slide.gradient} p-5 min-h-[120px] text-white shadow-lg transition-all duration-500`}
      >
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative flex items-center gap-4">
          <span className="text-4xl shrink-0 drop-shadow">{slide.emoji}</span>
          <div>
            <h3 className="font-bold text-lg leading-tight">{slide.title}</h3>
            <p className="text-sm text-white/90 mt-1 leading-relaxed">{slide.subtitle}</p>
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-1.5 mt-3">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`اسلاید ${i + 1}`}
            onClick={() => setActive(i)}
            className={`h-2 rounded-full transition-all ${
              i === active ? 'w-6 bg-blue-600' : 'w-2 bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
