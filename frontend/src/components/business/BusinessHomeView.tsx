import { Link } from 'react-router-dom'
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { BusinessDashboardData } from '../../services/api'
import { useTheme } from '../../contexts/ThemeContext'
import {
  HOME_PURPLE,
  faNum,
  faSignedPct,
  formatCompact,
  formatToman,
  todayLabel,
} from './businessHomeUtils'

function HealthRing({ score }: { score: number }) {
  const angle = Math.max(0, Math.min(100, score)) * 3.6
  return (
    <div className="relative h-[72px] w-[72px] shrink-0">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(#2DD4BF 0deg, #7C5CFC ${angle * 0.35}deg, #F472B6 ${angle * 0.7}deg, #FB923C ${angle}deg, #E8ECF7 ${angle}deg 360deg)`,
          mask: 'radial-gradient(farthest-side, transparent calc(100% - 8px), #000 calc(100% - 7.5px))',
          WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 8px), #000 calc(100% - 7.5px))',
        }}
      />
      <div className="absolute inset-[9px] flex flex-col items-center justify-center rounded-full bg-white">
        <span className="text-[22px] font-black leading-none text-gray-900">{faNum(score)}</span>
        <span className="mt-0.5 text-[8px] text-gray-400">از ۱۰۰</span>
      </div>
    </div>
  )
}

function ChangePill({ value, className = '' }: { value: number; className?: string }) {
  const positive = value >= 0
  return (
    <span className={`text-[11px] font-bold ${positive ? 'text-emerald-500' : 'text-rose-500'} ${className}`}>
      {faSignedPct(value)}
    </span>
  )
}

const healthTone: Record<string, string> = {
  tenure: 'bg-[#FDE8F1] text-[#E11D8F]',
  engagement: 'bg-[#FFF4D6] text-[#D97706]',
  retention: 'bg-[#FFE8EC] text-[#FB7185]',
  sales: 'bg-[#EDE7FF] text-[#7C5CFC]',
}

export function BusinessHomeView({ data, loading }: { data: BusinessDashboardData | null; loading: boolean }) {
  const { isDark } = useTheme()
  const card = isDark ? 'bg-slate-800' : 'bg-white'
  const page = isDark ? 'bg-slate-900' : 'bg-[#F4F6FB]'
  const muted = isDark ? 'text-slate-400' : 'text-gray-400'
  const title = isDark ? 'text-white' : 'text-gray-900'

  if (loading || !data) {
    return (
      <div className={`min-h-full ${page} px-4 py-5 space-y-4`}>
        {[1, 2, 3, 4].map(item => (
          <div key={item} className={`h-28 animate-pulse rounded-[24px] ${isDark ? 'bg-slate-800' : 'bg-white'}`} />
        ))}
      </div>
    )
  }

  const { health, kpis, actions, customers_summary, sales_series, gift_program, package: pkg } = data
  const maxSales = Math.max(...sales_series.map(item => item.amount), 1)
  const chartData = sales_series.map(item => ({ ...item, amount: item.amount }))
  const ticks = [1, 6, 11, 16, 21, 26, 31].filter(day => day <= (sales_series.at(-1)?.day || 31))

  const days = actions.package_days_remaining
  let packageActionTitle = 'پکیج فعال ندارید'
  let packageActionSubtitle = 'برای جذب مشتری، پکیج خود را ایجاد کنید.'
  if (pkg) {
    if (pkg.status === 'pending') {
      packageActionTitle = 'پکیج شما در حال بررسی است'
      packageActionSubtitle = 'پس از تایید، پکیج برای مشتریان فعال می‌شود.'
    } else if (!pkg.is_active || pkg.status !== 'approved') {
      packageActionTitle = 'پکیج شما هنوز فعال نشده'
      packageActionSubtitle = 'وضعیت پکیج تبلیغاتی خود را مدیریت کنید.'
    } else if (days !== null && days <= 10) {
      packageActionTitle = days < 0 ? 'پکیج شما منقضی شده است' : `پکیج شما ${faNum(days)} روز دیگر منقضی می‌شود`
      packageActionSubtitle = 'برای استفاده بدون وقفه، پکیج خود را تمدید کنید.'
    } else {
      packageActionTitle = days !== null ? `پکیج شما ${faNum(days)} روز اعتبار دارد` : 'پکیج فعال دارید'
      packageActionSubtitle = 'وضعیت پکیج تبلیغاتی خود را مدیریت کنید.'
    }
  }

  const healthBadge =
    health.label === 'عالی'
      ? 'bg-emerald-50 text-emerald-500'
      : health.label === 'خوب'
        ? 'bg-sky-50 text-sky-500'
        : health.label === 'متوسط'
          ? 'bg-amber-50 text-amber-500'
          : 'bg-rose-50 text-rose-500'

  return (
    <div className={`min-h-full ${page} px-4 pb-24 pt-3`} dir="rtl">
      <p className={`mb-3 text-[11px] ${muted}`}>{todayLabel()}</p>

      <section className={`rounded-[28px] p-4 shadow-sm ${card}`}>
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-1.5">
            <h2 className={`text-sm font-black ${title}`}>سلامت کسب‌وکار</h2>
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-100 text-[9px] text-gray-400">i</span>
          </div>
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${healthBadge}`}>
            {health.label}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <HealthRing score={health.score} />
          <div className="grid min-w-0 flex-1 grid-cols-4 gap-1.5">
            {health.metrics.map(metric => (
              <div key={metric.key} className={`rounded-2xl px-1.5 py-2 text-center ${healthTone[metric.key] || 'bg-gray-50'}`}>
                <ChangePill value={metric.change} className="block" />
                <div className={`mt-1 text-[9px] font-bold leading-4 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                  {metric.title}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <Link to="/dashboard/health" className={`flex items-center gap-1 text-[11px] font-bold ${muted}`}>
            جزئیات بیشتر
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </Link>
        </div>
      </section>

      <div className="mt-3 grid grid-cols-4 gap-2">
        {[
          { href: '/dashboard/sales', label: 'فروش این ماه', value: faNum(Math.round(kpis.sales_this_month)), change: kpis.sales_change, bg: 'bg-[#E8FBF4]', icon: 'bars', color: 'text-emerald-500' },
          { href: '/dashboard/customers?segment=all', label: 'مشتریان فعال', value: faNum(kpis.active_customers), change: kpis.active_change, bg: 'bg-[#F3EEFF]', icon: 'users', color: 'text-[#7C5CFC]' },
          { href: '/dashboard/customers?segment=returning', label: 'مشتریان بازگشتی', value: faNum(kpis.returning_customers), change: kpis.returning_change, bg: 'bg-[#FFF4E8]', icon: 'refresh', color: 'text-orange-400' },
          { href: '/dashboard/transactions', label: 'تراکنش‌ها', value: faNum(kpis.transactions_this_month), change: kpis.transactions_change, bg: 'bg-[#EEF5FF]', icon: 'calendar', color: 'text-sky-500' },
        ].map(item => (
          <Link key={item.label} to={item.href} className={`rounded-[22px] px-2 py-3 text-center shadow-sm ${isDark ? 'bg-slate-800' : item.bg}`}>
            <div className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-2xl bg-white/70 ${item.color}`}>
              <KpiIcon name={item.icon} />
            </div>
            <div className={`text-[9px] font-bold ${muted}`}>{item.label}</div>
            <div className={`mt-1 text-[15px] font-black ${title}`}>{item.value}</div>
            <ChangePill value={item.change} />
            <div className={`mt-0.5 text-[8px] ${muted}`}>نسبت به ماه قبل</div>
          </Link>
        ))}
      </div>

      <section className={`mt-3 rounded-[28px] p-4 shadow-sm ${card}`}>
        <h2 className={`mb-3 text-right text-sm font-black ${title}`}>نیاز به اقدام</h2>
        <div className="space-y-2">
          <ActionRow
            to="/dashboard/transactions?status=pending"
            tone="rose"
            title={`${faNum(actions.pending_transactions)} تراکنش در انتظار تایید`}
            subtitle="لطفا در اسرع وقت بررسی و تایید کنید."
            icon="chat"
          />
          <ActionRow
            to="/dashboard/elite-gift-claims"
            tone="orange"
            title={`${faNum(actions.pending_gift_claims)} درخواست هدیه ویژه`}
            subtitle="درخواست‌های جدید مشتریان برای هدیه بررسی شود."
            icon="gift"
          />
          <ActionRow
            to="/dashboard/packages"
            tone="slate"
            title={packageActionTitle}
            subtitle={packageActionSubtitle}
            icon="box"
          />
        </div>
      </section>

      <section className="mt-4">
        <h2 className={`mb-3 text-right text-sm font-black ${title}`}>دسترسی سریع</h2>
        <div className="grid grid-cols-4 gap-2">
          <QuickTile to="/dashboard/elite-gift-claims" bg="bg-[#FDE8F1]" color="text-[#E11D8F]" title="هدیه ویژه" subtitle="مدیریت برنامه‌ها" icon="gift" />
          <QuickTile to="/dashboard/customers" bg="bg-[#FFF1E4]" color="text-[#F97316]" title="مشتریان" subtitle="لیست و مدیریت" icon="people" />
          <QuickTile to="/dashboard/qrcode" bg="bg-[#F3EEFF]" color="text-[#7C5CFC]" title="QR کسب‌وکار" subtitle="نمایش QR من" icon="qr" />
          <QuickTile to="/dashboard/transactions/new" bg="bg-[#E8FBF4]" color="text-emerald-500" title="ثبت تراکنش" subtitle="ثبت خرید مشتری" icon="invoice" />
        </div>
      </section>

      <section className={`mt-4 rounded-[28px] p-4 shadow-sm ${card}`}>
        <div className="mb-2 flex items-start justify-between">
          <div className="text-right">
            <h2 className={`text-sm font-black ${title}`}>عملکرد فروش</h2>
            <div className="mt-0.5">
              <ChangePill value={kpis.sales_change} />
              <span className={`mr-1 text-[10px] ${muted}`}>نسبت به ماه قبل</span>
            </div>
          </div>
          <Link to="/dashboard/sales" className={`flex items-center gap-1 text-[11px] font-bold ${muted}`}>
            مشاهده همه
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </Link>
        </div>
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={HOME_PURPLE} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={HOME_PURPLE} stopOpacity={0} />
                </linearGradient>
              </defs>
              <YAxis
                orientation="right"
                tickFormatter={value => formatCompact(Number(value))}
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                width={28}
                domain={[0, maxSales]}
              />
              <XAxis dataKey="day" ticks={ticks} tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Area type="monotone" dataKey="amount" stroke={HOME_PURPLE} strokeWidth={2.4} fill="url(#salesFill)" dot={false} activeDot={{ r: 5, fill: HOME_PURPLE }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className={`mt-3 rounded-[28px] p-4 shadow-sm ${card}`}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className={`text-sm font-black ${title}`}>مشتریان شما</h2>
          <Link to="/dashboard/customers" className={`flex items-center gap-1 text-[11px] font-bold ${muted}`}>
            مشاهده همه
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          <CustomerStat to="/dashboard/customers?segment=new" value={customers_summary.new} label="جدید" color="text-emerald-500" bg="bg-emerald-50" icon="user" />
          <CustomerStat to="/dashboard/customers?segment=returning" value={customers_summary.returning} label="بازگشتی" color="text-cyan-500" bg="bg-cyan-50" icon="refresh" />
          <CustomerStat to="/dashboard/customers?segment=vip" value={customers_summary.vip} label="VIP" color="text-[#7C5CFC]" bg="bg-[#F3EEFF]" icon="star" />
          <CustomerStat to="/dashboard/customers?segment=churn" value={customers_summary.churn_risk} label="در معرض ریزش" color="text-orange-400" bg="bg-orange-50" icon="warn" />
        </div>
      </section>

      <section className={`mt-3 rounded-[28px] p-4 shadow-sm ${card}`}>
        <div className="mb-3 flex items-center justify-end gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#FDE8F1] text-[#E11D8F]">
            <KpiIcon name="gift" />
          </span>
          <h2 className={`text-sm font-black ${title}`}>برنامه هدیه ویژه فعال</h2>
        </div>
        {gift_program.enabled ? (
          <>
            <div className="flex items-stretch gap-2">
              <div className="w-[72px] rounded-[20px] bg-[#FDE8F1] px-2 py-3 text-center">
                <div className="text-xl font-black text-[#E11D8F]">{faNum(gift_program.new_claims)}</div>
                <div className="mt-1 text-[9px] font-bold leading-4 text-gray-500">درخواست جدید</div>
              </div>
              <div className="w-[72px] rounded-[20px] bg-[#E8FBF4] px-2 py-3 text-center">
                <div className="text-xl font-black text-emerald-500">{faNum(gift_program.customers_on_path)}</div>
                <div className="mt-1 text-[9px] font-bold leading-4 text-gray-500">مشتری در مسیر</div>
              </div>
              <div className="min-w-0 flex-1">
                <div className={`text-[11px] font-bold ${muted}`}>
                  هدف: {gift_program.gift_type === 'count' ? `${faNum(gift_program.target)} مراجعه` : formatToman(gift_program.target)}
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-emerald-100">
                  <div className="h-full rounded-full bg-emerald-400" style={{ width: `${Math.min(100, gift_program.percent)}%` }} />
                </div>
                <div className={`mt-2 text-[10px] ${muted}`}>
                  {gift_program.gift_type === 'count' ? 'مجموع مراجعات مشتریان' : 'مجموع خرید مشتریان'}{' '}
                  {gift_program.gift_type === 'count' ? faNum(gift_program.current) : formatToman(gift_program.current)}{' '}
                  ({faNum(gift_program.percent)}٪)
                </div>
              </div>
            </div>
            <Link to="/dashboard/elite-gift-claims" className={`mt-3 flex items-center justify-end gap-1 text-[11px] font-bold ${muted}`}>
              مشاهده و مدیریت
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </Link>
          </>
        ) : (
          <div className={`text-center text-[12px] ${muted}`}>
            هنوز برنامه هدیه ویژه‌ای فعال نیست.
            <Link to="/dashboard/packages" className="mr-1 font-bold text-[#7C5CFC]">ایجاد در پکیج</Link>
          </div>
        )}
      </section>
    </div>
  )
}

function ActionRow({
  to, tone, title, subtitle, icon,
}: { to: string; tone: 'rose' | 'orange' | 'slate'; title: string; subtitle: string; icon: string }) {
  const tones = {
    rose: 'bg-[#FDECEC]',
    orange: 'bg-[#FFF3E6]',
    slate: 'bg-[#F3F6FB]',
  }
  return (
    <Link to={to} className={`flex items-center gap-3 rounded-[22px] px-3 py-3 ${tones[tone]}`}>
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#7C5CFC] shadow-sm">
        <KpiIcon name={icon} />
      </div>
      <div className="min-w-0 flex-1 text-right">
        <div className="text-[12px] font-black text-gray-800">{title}</div>
        <div className="mt-0.5 text-[10px] leading-4 text-gray-400">{subtitle}</div>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 text-gray-300">
        <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </Link>
  )
}

function QuickTile({
  to, bg, color, title, subtitle, icon,
}: { to: string; bg: string; color: string; title: string; subtitle: string; icon: string }) {
  return (
    <Link to={to} className={`rounded-[22px] px-2 py-4 text-center ${bg}`}>
      <div className={`mx-auto mb-2 flex h-9 w-9 items-center justify-center ${color}`}>
        <KpiIcon name={icon} />
      </div>
      <div className="text-[11px] font-black text-gray-800">{title}</div>
      <div className="mt-0.5 text-[9px] text-gray-400">{subtitle}</div>
    </Link>
  )
}

function CustomerStat({
  to, value, label, color, bg, icon,
}: { to: string; value: number; label: string; color: string; bg: string; icon: string }) {
  return (
    <Link to={to} className="text-center">
      <div className={`mx-auto mb-1 flex h-9 w-9 items-center justify-center rounded-full ${bg} ${color}`}>
        <KpiIcon name={icon} />
      </div>
      <div className={`text-lg font-black ${color}`}>{faNum(value)}</div>
      <div className="text-[10px] text-gray-400">{label}</div>
    </Link>
  )
}

function KpiIcon({ name }: { name: string }) {
  const common = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none' as const }
  if (name === 'bars') return <svg {...common}><path d="M4 19V10M10 19V5M16 19v-7M22 19V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
  if (name === 'users' || name === 'people' || name === 'user') return <svg {...common}><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
  if (name === 'refresh') return <svg {...common}><path d="M3 12a9 9 0 019-9 9.75 9.75 0 016.74 2.74L21 8M21 3v5h-5M21 12a9 9 0 01-9 9 9.75 9.75 0 01-6.74-2.74L3 16M8 16H3v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
  if (name === 'calendar') return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" /><path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
  if (name === 'gift') return <svg {...common}><rect x="3" y="10" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" /><path d="M12 10v11M3 10h18M12 10c0-3 2-5 4.5-5S21 7 21 10M12 10c0-3-2-5-4.5-5S3 7 3 10" stroke="currentColor" strokeWidth="1.8" /></svg>
  if (name === 'qr') return <svg {...common}><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z" stroke="currentColor" strokeWidth="1.6" /></svg>
  if (name === 'invoice') return <svg {...common}><path d="M8 6h8M8 10h8M8 14h5M6 3h12a2 2 0 012 2v16l-3-2-3 2-3-2-3 2-3-2V5a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>
  if (name === 'chat') return <svg {...common}><path d="M21 12a8 8 0 01-8 8H7l-4 3V12a8 8 0 018-8h2a8 8 0 018 5z" stroke="currentColor" strokeWidth="1.8" /></svg>
  if (name === 'box') return <svg {...common}><path d="M21 8l-9-4-9 4 9 4 9-4zM3 8v8l9 4 9-4V8" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
  if (name === 'star') return <svg {...common}><path d="M12 3l2.4 4.9L20 9l-4 3.9.9 5.6L12 16.5 7.1 18.5 8 12.9 4 9l5.6-1.1L12 3z" stroke="currentColor" strokeWidth="1.6" /></svg>
  return <svg {...common}><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" /><path d="M12 8v5M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
}
