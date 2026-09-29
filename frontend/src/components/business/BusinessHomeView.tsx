import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { BusinessDashboardData, SalesChartSeries } from '../../services/api'
import { useTheme } from '../../contexts/ThemeContext'
import {
  HOME_PURPLE,
  faDigits,
  faNum,
  formatToman,
  todayLabel,
} from './businessHomeUtils'

type SalesRange = '7d' | '30d' | '6m' | '1y'

const RANGE_TABS: { id: SalesRange; label: string }[] = [
  { id: '7d', label: '۷ روز' },
  { id: '30d', label: '۳۰ روز' },
  { id: '6m', label: '۶ ماه' },
  { id: '1y', label: '۱ سال' },
]

function Chevron({ className = '', size = 14 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Trend({ value }: { value: number }) {
  const up = value >= 0
  return (
    <span className={`inline-flex items-center gap-0.5 font-bold ${up ? 'text-emerald-500' : 'text-rose-500'}`}>
      <span aria-hidden>{up ? '↑' : '↓'}</span>
      {faNum(Math.abs(Math.round(value)))}٪
    </span>
  )
}

function axisTick(value: number) {
  if (!Number.isFinite(value)) return ''
  if (Math.abs(value) >= 1_000_000) return `${faNum(Math.round(value / 1_000_000))}M`
  if (Math.abs(value) >= 1_000) return `${faNum(Math.round(value / 1_000))}K`
  return faNum(Math.round(value))
}

function axisTicks(points: { label: string }[]) {
  if (points.length <= 4) return points.map(point => point.label)
  const last = points.length - 1
  const indexes = [0, Math.round(last / 3), Math.round((2 * last) / 3), last]
  return [...new Set(indexes)].map(index => points[index].label)
}

function shortAxisLabel(label: string, range: SalesRange) {
  const text = faDigits(label)
  if (range === '7d' || range === '30d') return text.split(' ')[0] || text
  return text
}

function packageCard(pkg: BusinessDashboardData['package'], days: number | null) {
  if (!pkg) return { count: 0, label: 'پکیج فعال ندارید', needsAction: true }
  if (pkg.status === 'pending') return { count: 1, label: 'پکیج در انتظار بررسی', needsAction: true }
  if (!pkg.is_active || pkg.status !== 'approved') return { count: 1, label: 'پکیج هنوز فعال نشده', needsAction: true }
  if (days !== null && days < 0) return { count: 0, label: 'پکیج منقضی شده', needsAction: true }
  if (days !== null && days <= 10) return { count: Math.max(days, 0), label: 'روز تا انقضای پکیج', needsAction: true }
  return { count: days ?? 0, label: 'روز اعتبار پکیج', needsAction: false }
}

export function BusinessHomeView({ data, loading }: { data: BusinessDashboardData | null; loading: boolean }) {
  const { isDark } = useTheme()
  const [range, setRange] = useState<SalesRange>('30d')
  const card = isDark ? 'bg-slate-800' : 'bg-white'
  const page = isDark ? 'bg-slate-900' : 'bg-[#F4F6FB]'
  const muted = isDark ? 'text-slate-400' : 'text-gray-400'
  const title = isDark ? 'text-white' : 'text-gray-900'
  const soft = isDark ? 'bg-slate-700/70' : 'bg-[#F6F7FB]'

  if (loading || !data) {
    return (
      <div className={`min-h-full ${page} space-y-3 px-4 py-5`}>
        {[1, 2, 3, 4].map(item => (
          <div key={item} className={`h-28 animate-pulse rounded-[24px] ${card}`} />
        ))}
      </div>
    )
  }

  const { kpis, actions, customers_summary, sales_series, gift_program, package: pkg } = data
  const days = actions.package_days_remaining
  const pkgCard = packageCard(pkg, days)
  const clubClaims = actions.pending_club_gift_claims || 0
  const attentionCount = [
    actions.pending_transactions > 0,
    actions.pending_gift_claims > 0,
    pkgCard.needsAction,
    clubClaims > 0,
  ].filter(Boolean).length

  const fallbackChart: SalesChartSeries = {
    total: kpis.sales_this_month,
    change: kpis.sales_change,
    points: sales_series.map(item => ({ label: String(item.label || item.day), amount: item.amount })),
  }
  const chart = data.sales_charts?.[range] || fallbackChart
  const peak = Math.max(...chart.points.map(item => item.amount), 0)
  const yMax = peak <= 0 ? 4 : peak
  const xTicks = axisTicks(chart.points)
  const giftHref = gift_program.enabled ? '/dashboard/elite-gift-claims' : '/dashboard/packages'
  const compareLabel = range === '7d'
    ? 'نسبت به ۷ روز قبل'
    : range === '6m'
      ? 'نسبت به ۶ ماه قبل'
      : range === '1y'
        ? 'نسبت به سال قبل'
        : 'نسبت به ۳۰ روز قبل'

  return (
    <div className={`min-h-full ${page} px-4 pb-24 pt-3`} dir="rtl">
      <div className="mb-3 flex">
        <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] shadow-sm ${card} ${title}`}>
          <span className="font-bold">{todayLabel()}</span>
          <span className={muted}><KpiIcon name="calendar" /></span>
        </div>
      </div>

      <section className={`rounded-[28px] px-4 py-3 shadow-sm ${card}`}>
        <h2 className={`mb-2 text-[15px] font-black ${title}`}>خلاصه عملکرد</h2>
        <div className="flex items-center gap-2">
          <div className={`grid min-w-0 flex-1 grid-cols-3 overflow-hidden rounded-[18px] py-1 ${soft}`}>
            <SummaryStat to="/dashboard/customers?segment=returning" label="مشتریان بازگشتی" value={kpis.returning_customers} icon="refresh" tint="text-teal-500" ink={title} />
            <SummaryStat to="/dashboard/customers?segment=all" label="مشتریان فعال" value={kpis.active_customers} icon="users" tint="text-[#7C5CFC]" ink={title} divided />
            <SummaryStat to="/dashboard/transactions" label="تراکنش‌ها" value={kpis.transactions_this_month} icon="invoice" tint="text-sky-500" ink={title} divided />
          </div>
          <Link to="/dashboard/sales" className="flex shrink-0 items-center gap-1.5">
            <div className="text-right">
              <div className={`text-[18px] font-black leading-none tracking-tight ${title}`}>{faNum(Math.round(kpis.sales_this_month))}</div>
              <div className={`mt-0.5 text-[10px] leading-3 ${muted}`}>تومان</div>
              <div className="mt-0.5 text-[11px] leading-4">
                <Trend value={kpis.sales_change} />
              </div>
              <div className={`text-[9px] leading-3 ${muted}`}>نسبت به ماه قبل</div>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#EDE9FE] text-[#7C5CFC]">
              <KpiIcon name="wallet" size={18} />
            </span>
          </Link>
        </div>
      </section>

      <section className={`mt-3 rounded-[28px] p-4 shadow-sm ${card}`}>
        <div className="mb-3 flex items-center gap-1.5">
          <h2 className={`text-[15px] font-black ${title}`}>نیاز به اقدام</h2>
          {attentionCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-black text-white">
              {faNum(attentionCount)}
            </span>
          )}
          <Chevron className={muted} />
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          <ActionCard to="/dashboard/transactions?status=pending" count={actions.pending_transactions} label="تراکنش در انتظار تأیید" bg={isDark ? 'bg-sky-500/10' : 'bg-[#EEF5FF]'} tint="text-sky-500" icon="card" ink={title} />
          <ActionCard to="/dashboard/elite-gift-claims" count={actions.pending_gift_claims} label="درخواست هدیه ویژه" bg={isDark ? 'bg-rose-500/10' : 'bg-[#FFF0F5]'} tint="text-rose-400" icon="gift" ink={title} />
          <ActionCard to="/dashboard/packages" count={pkgCard.count} label={pkgCard.label} bg={isDark ? 'bg-amber-500/10' : 'bg-[#FFF8E8]'} tint="text-amber-500" icon="calendar" ink={title} />
          <ActionCard count={clubClaims} label="درخواست هدیه باشگاه‌ها" bg={isDark ? 'bg-violet-500/10' : 'bg-[#F6F0FF]'} tint="text-violet-500" icon="gift" ink={title} />
        </div>
      </section>

      <section className={`mt-3 rounded-[28px] p-3 shadow-sm ${card}`}>
        <div className="mb-2 flex items-center gap-1">
          <span className="text-[#7C5CFC]"><KpiIcon name="grid" /></span>
          <h2 className={`text-[14px] font-black ${title}`}>دسترسی سریع</h2>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          <QuickTile to="/dashboard/transactions/new" title="ثبت تراکنش" bg={isDark ? 'bg-rose-500/10' : 'bg-[#FDE8F3]'} tint="text-[#E11D8F]" icon="invoice" />
          <QuickTile to="/dashboard/elite-gift-claims" title="مدیریت هدیه" bg={isDark ? 'bg-emerald-500/10' : 'bg-[#E7FBF3]'} tint="text-emerald-500" icon="gift" />
          <QuickTile to="/dashboard/customers" title="مشتریان" bg={isDark ? 'bg-violet-500/10' : 'bg-[#F3EEFF]'} tint="text-[#7C5CFC]" icon="user" />
          <QuickTile to="/dashboard/qrcode" title="کیوآر کسب‌وکار" bg={isDark ? 'bg-violet-500/10' : 'bg-[#F3EEFF]'} tint="text-[#7C5CFC]" icon="qr" />
        </div>
      </section>

      <section className={`mt-3 min-w-0 rounded-[28px] p-3 shadow-sm ${card}`}>
          <div className="mb-1 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1">
              <span className="shrink-0 text-[#7C5CFC]"><KpiIcon name="bars" /></span>
              <h2 className={`whitespace-nowrap text-[14px] font-black ${title}`}>عملکرد فروش</h2>
            </div>
            <Link to="/dashboard/sales" className="shrink-0 text-[11px] font-bold text-[#7C5CFC]">مشاهده جزئیات</Link>
          </div>
          <div className="mb-2 flex gap-0.5" dir="rtl">
            {RANGE_TABS.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRange(tab.id)}
                className={`whitespace-nowrap rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                  range === tab.id ? 'bg-[#7C5CFC] text-white' : muted
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <Link to="/dashboard/sales" dir="ltr" className="block h-40" aria-label="مشاهده جزئیات فروش">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart.points} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesFillHome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={HOME_PURPLE} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={HOME_PURPLE} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <YAxis
                  orientation="left"
                  tickFormatter={value => axisTick(Number(value))}
                  tick={{ fontSize: 9, fill: '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                  domain={[0, yMax]}
                  allowDecimals={false}
                  tickCount={4}
                />
                <XAxis
                  dataKey="label"
                  ticks={xTicks}
                  interval={0}
                  tickFormatter={value => shortAxisLabel(String(value), range)}
                  tick={{ fontSize: 8, fill: '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value: number) => formatToman(Number(value))}
                  labelFormatter={label => faDigits(String(label))}
                />
                <Area type="monotone" dataKey="amount" stroke={HOME_PURPLE} strokeWidth={2.2} fill="url(#salesFillHome)" dot={false} activeDot={{ r: 4, fill: HOME_PURPLE }} />
              </AreaChart>
            </ResponsiveContainer>
          </Link>
          <div className="mt-1 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Trend value={chart.change} />
              <div className={`text-[10px] leading-4 ${muted}`}>{compareLabel}</div>
            </div>
            <div className="shrink-0 text-left">
              <div className={`text-[10px] ${muted}`}>فروش کل دوره</div>
              <div className={`text-[12px] font-black ${title}`}>{formatToman(chart.total)}</div>
            </div>
          </div>
      </section>

      <section className={`mt-3 rounded-[28px] p-3 shadow-sm ${card}`}>
        <div className="mb-2 flex items-center gap-1">
          <span className="text-[#7C5CFC]"><KpiIcon name="users" /></span>
          <h2 className={`text-[14px] font-black ${title}`}>مشتریان شما</h2>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          <CustomerTile to="/dashboard/customers?segment=new" value={customers_summary.new} label="مشتریان جدید" bg={isDark ? 'bg-emerald-500/10' : 'bg-[#E8FBF3]'} tint="text-emerald-500" icon="user" />
          <CustomerTile to="/dashboard/customers?segment=returning" value={customers_summary.returning} label="مشتریان بازگشتی" bg={isDark ? 'bg-violet-500/10' : 'bg-[#F3EEFF]'} tint="text-[#7C5CFC]" icon="refresh" />
          <CustomerTile to="/dashboard/customers?segment=vip" value={customers_summary.vip} label="VIP" bg={isDark ? 'bg-amber-500/10' : 'bg-[#FFF8E6]'} tint="text-amber-500" icon="crown" />
          <CustomerTile to="/dashboard/customers?segment=all" value={customers_summary.total} label="کل مشتریان" bg={isDark ? 'bg-sky-500/10' : 'bg-[#EEF5FF]'} tint="text-sky-500" icon="users" />
        </div>
      </section>

      <section className={`mt-3 rounded-[28px] p-3.5 shadow-sm ${card}`}>
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F3EEFF] text-[#7C5CFC]">
              <KpiIcon name="gift" size={16} />
            </span>
            <h2 className={`text-[14px] font-black ${title}`}>برنامه هدیه ویژه</h2>
          </div>
          <Link to={giftHref} className="flex items-center gap-1 rounded-full bg-[#F3EEFF] px-3 py-1.5 text-[11px] font-bold text-[#7C5CFC]">
            مشاهده و مدیریت
            <Chevron size={12} />
          </Link>
        </div>
        <div className="flex items-stretch gap-2">
          <Link to={giftHref} className="flex w-[72px] shrink-0 items-center justify-center" aria-label="مشاهده برنامه هدیه">
            <GiftArt />
          </Link>
          <div className={`flex min-w-0 flex-1 flex-col justify-center rounded-[18px] px-2.5 py-2 ${isDark ? 'bg-violet-500/10' : 'bg-[#F3EEFF]'}`}>
            <div className="flex items-center gap-1.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[#7C5CFC]">
                <KpiIcon name="gift" size={14} />
              </span>
              <span className="text-[22px] font-black leading-none text-[#7C5CFC]">{faNum(gift_program.new_claims)}</span>
            </div>
            <p className="mt-1 text-[10px] font-bold leading-[14px] text-gray-500">درخواست جدید برای دریافت هدیه ثبت شده است</p>
          </div>
          <div className={`flex min-w-0 flex-1 flex-col justify-center rounded-[18px] px-2.5 py-2 ${isDark ? 'bg-emerald-500/10' : 'bg-[#E7F8F1]'}`}>
            <div className="flex items-center gap-1.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-emerald-500">
                <KpiIcon name="user" size={14} />
              </span>
              <span className="text-[22px] font-black leading-none text-emerald-500">{faNum(gift_program.customers_on_path)}</span>
            </div>
            <p className="mt-1 text-[10px] font-bold leading-[14px] text-gray-500">مشتریان در مسیر به دریافت هدیه نزدیک می‌شوند</p>
          </div>
        </div>
        {!gift_program.enabled && (
          <p className={`mt-2 text-center text-[11px] ${muted}`}>هنوز برنامه هدیه ویژه‌ای فعال نیست.</p>
        )}
      </section>
    </div>
  )
}

function SummaryStat({
  to, label, value, icon, tint, ink, divided = false,
}: { to: string; label: string; value: number; icon: string; tint: string; ink: string; divided?: boolean }) {
  return (
    <Link to={to} className={`px-1 text-center ${divided ? 'border-r border-gray-200/80' : ''}`}>
      <div className={`mx-auto mb-1 flex h-[26px] w-[26px] items-center justify-center rounded-full bg-white ${tint}`}>
        <KpiIcon name={icon} size={13} />
      </div>
      <div className="min-h-[19px] text-[10px] font-bold leading-3 text-gray-400">{label}</div>
      <div className={`mt-0.5 text-[15px] font-black leading-none ${ink}`}>{faNum(value)}</div>
    </Link>
  )
}

function ActionCard({
  to, count, label, bg, tint, icon, ink,
}: { to?: string; count: number; label: string; bg: string; tint: string; icon: string; ink: string }) {
  const body = (
    <div className={`flex h-full flex-col rounded-[18px] px-1.5 py-2.5 ${bg}`}>
      <div className="flex items-center gap-1">
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white ${tint}`}>
          <KpiIcon name={icon} />
        </span>
        <span className={`text-[15px] font-black leading-none ${ink}`}>{faNum(count)}</span>
      </div>
      <div className="mt-1 line-clamp-2 text-[9px] font-bold leading-[13px] text-gray-500">{label}</div>
    </div>
  )
  if (!to) return body
  return <Link to={to} className="block h-full">{body}</Link>
}

function QuickTile({
  to, title, bg, tint, icon,
}: { to: string; title: string; bg: string; tint: string; icon: string }) {
  return (
    <Link to={to} className={`flex flex-col justify-between rounded-[16px] px-1.5 py-2 ${bg}`}>
      <span className={tint}><KpiIcon name={icon} size={14} /></span>
      <div className="mt-1.5 text-[9px] font-bold leading-[12px] text-gray-500">{title}</div>
    </Link>
  )
}

function CustomerTile({
  to, value, label, bg, tint, icon,
}: { to: string; value: number; label: string; bg: string; tint: string; icon: string }) {
  return (
    <Link to={to} className={`flex flex-col justify-between rounded-[16px] px-1.5 py-2 ${bg}`}>
      <div className="flex items-center justify-between gap-1">
        <span className={tint}><KpiIcon name={icon} size={14} /></span>
        <span className={`text-[16px] font-black leading-none ${tint}`}>{faNum(value)}</span>
      </div>
      <div className="mt-1.5 text-[9px] font-bold leading-[12px] text-gray-500">{label}</div>
    </Link>
  )
}

function GiftArt() {
  return (
    <svg viewBox="0 0 86 96" className="h-[76px] w-[68px]" aria-hidden>
      <path d="M18 28c8-16 28-14 32-2 6-10 22-8 24 4 1 8-6 12-14 12H28c-8-1-14-6-10-14z" fill="#E9D5FF" />
      <rect x="16" y="40" width="54" height="36" rx="8" fill="#7C5CFC" />
      <rect x="38" y="40" width="10" height="36" fill="#C4B5FD" />
      <path d="M43 40c-8-8-18-6-18 2s12 6 18 0c6 6 18 4 18-2s-10-10-18-0z" fill="#F472B6" />
      <circle cx="68" cy="22" r="2" fill="#F9A8D4" />
      <circle cx="14" cy="34" r="1.6" fill="#C4B5FD" />
      <path d="M62 18l2-5 1 5 5 1-5 2-1 5-2-5z" fill="#FDE68A" />
      <circle cx="68" cy="78" r="11" fill="#7C5CFC" />
      <path d="M72 78l-5-4v2.5H63v3h4V82z" fill="white" />
    </svg>
  )
}

function KpiIcon({ name, size = 16 }: { name: string; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none' as const }
  if (name === 'grid') return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" /><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" /><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" /><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" /></svg>
  if (name === 'bars') return <svg {...common}><path d="M4 19V10M9 19V5M14 19v-6M19 19V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
  if (name === 'users') return <svg {...common}><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
  if (name === 'user') return <svg {...common}><circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8" /><path d="M5 19c1.2-3 3.4-4.5 7-4.5S17.8 16 19 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
  if (name === 'refresh') return <svg {...common}><path d="M20 12a8 8 0 11-2.3-5.6M20 4v5h-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
  if (name === 'calendar') return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" /><path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
  if (name === 'gift') return <svg {...common}><rect x="3" y="10" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" /><path d="M12 10v11M3 14h18M12 10c0-3 2-5 4.5-5S21 7 21 10M12 10c0-3-2-5-4.5-5S3 7 3 10" stroke="currentColor" strokeWidth="1.8" /></svg>
  if (name === 'qr') return <svg {...common}><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z" stroke="currentColor" strokeWidth="1.6" /></svg>
  if (name === 'invoice') return <svg {...common}><path d="M7 3h10a1 1 0 011 1v17l-2.5-1.5L13 21l-2.5-1.5L8 21l-2-1.4V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.7" /><path d="M9 8h6M9 12h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
  if (name === 'card') return <svg {...common}><rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" /><path d="M3 10h18" stroke="currentColor" strokeWidth="1.8" /></svg>
  if (name === 'wallet') return <svg {...common}><rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" /><path d="M3 10h18M16 14h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
  if (name === 'crown') return <svg {...common}><path d="M4 16l2-8 6 4 6-4 2 8H4z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><path d="M4 19h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
  return <svg {...common}><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" /></svg>
}
