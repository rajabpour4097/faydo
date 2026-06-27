import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import { apiService, BusinessTransaction, BusinessLoyalty, Package } from '../../services/api'

// ─── Types ────────────────────────────────────────────────────────

interface DashStats {
  totalCustomers: number
  pendingTransactions: number
  approvedThisMonth: number
  totalRevenue: number
  activePackage: boolean
  businessScore: number
}

// ─── Helpers ─────────────────────────────────────────────────────

const farsiNum = (n: number) => n.toLocaleString('fa-IR')

const statusLabel = (s: string) =>
  s === 'pending' ? 'در انتظار' : s === 'approved' ? 'تأیید شده' : 'رد شده'

const statusColor = (s: string) =>
  s === 'pending'
    ? 'bg-amber-100 text-amber-700'
    : s === 'approved'
    ? 'bg-emerald-100 text-emerald-700'
    : 'bg-red-100 text-red-700'

const vipLabel = (v: string) =>
  v === 'vip' ? 'VIP' : v === 'vip_plus' ? 'VIP+' : '—'

// ─── Stat Card ───────────────────────────────────────────────────

const StatCard = ({
  icon, title, value, sub, gradient, isDark,
}: {
  icon: string; title: string; value: string; sub?: string
  gradient: string; isDark: boolean
}) => (
  <div className={`rounded-2xl p-5 text-white shadow-lg bg-gradient-to-br ${gradient} relative overflow-hidden`}>
    <div className="absolute -top-4 -left-4 w-24 h-24 bg-white bg-opacity-10 rounded-full" />
    <div className="absolute -bottom-6 -right-2 w-20 h-20 bg-white bg-opacity-10 rounded-full" />
    <div className="relative">
      <div className="text-3xl mb-1">{icon}</div>
      <div className="text-2xl font-extrabold">{value}</div>
      <div className="text-sm font-semibold opacity-90">{title}</div>
      {sub && <div className="text-xs opacity-70 mt-0.5">{sub}</div>}
    </div>
  </div>
)

// ─── Business Score ──────────────────────────────────────────────

const BusinessScoreCard = ({
  score, isDark,
}: { score: number; isDark: boolean }) => {
  const color =
    score >= 80 ? 'text-emerald-500' :
    score >= 60 ? 'text-teal-500' :
    score >= 40 ? 'text-amber-500' : 'text-red-500'
  const barColor =
    score >= 80 ? 'bg-emerald-500' :
    score >= 60 ? 'bg-teal-500' :
    score >= 40 ? 'bg-amber-500' : 'bg-red-500'
  const tier =
    score >= 80 ? 'Top Partner 🌟' :
    score >= 60 ? 'Partner خوب ✅' :
    score >= 40 ? 'در حال رشد 📈' : 'نیاز به بهبود ⚠️'

  return (
    <div className={`rounded-2xl p-5 ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
          امتیاز کسب‌وکار
        </h3>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'
        }`}>
          {tier}
        </span>
      </div>

      {/* Score circle */}
      <div className="flex items-center gap-4 mb-4">
        <div className={`text-5xl font-extrabold ${color}`}>{farsiNum(score)}</div>
        <div className="flex-1">
          <div className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>از ۱۰۰</div>
          <div className={`w-full h-3 rounded-full ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}>
            <div className={`h-full rounded-full transition-all duration-700 ${barColor}`}
              style={{ width: `${score}%` }} />
          </div>
        </div>
      </div>

      {/* Formula breakdown */}
      <div className="space-y-1.5">
        {[
          { label: 'عملکرد اخیر (۶۰٪)', pct: 60, desc: 'رتبه، بازگشت مشتری، شکایات' },
          { label: 'سوابق (۲۰٪)', pct: 20, desc: 'تاریخچه ۱۲ ماه' },
          { label: 'پکیج فعال (۲۰٪)', pct: 20, desc: 'کیفیت تخفیف، VIP، گیفت' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={`text-xs w-4 h-4 rounded flex items-center justify-center font-bold
              ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'}`}>
              {item.pct}
            </div>
            <div>
              <div className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                {item.label}
              </div>
              <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                {item.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Recent Transactions Table ───────────────────────────────────

const TransactionsTable = ({
  transactions, loading, isDark, onApprove, onReject,
}: {
  transactions: BusinessTransaction[]
  loading: boolean
  isDark: boolean
  onApprove: (id: number) => void
  onReject: (id: number) => void
}) => (
  <div className={`rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-lg overflow-hidden`}>
    <div className={`flex items-center justify-between px-6 py-4 border-b ${
      isDark ? 'border-slate-700' : 'border-gray-100'
    }`}>
      <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
        آخرین تراکنش‌ها
      </h3>
      <Link to="/dashboard/transactions"
        className="text-xs text-teal-500 hover:text-teal-400 font-medium">
        مشاهده همه ←
      </Link>
    </div>

    {loading ? (
      <div className="p-6 space-y-3">
        {[1,2,3].map(i => (
          <div key={i} className={`h-12 rounded-lg animate-pulse ${isDark ? 'bg-slate-700' : 'bg-gray-100'}`} />
        ))}
      </div>
    ) : transactions.length === 0 ? (
      <div className={`p-10 text-center ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
        <div className="text-4xl mb-2">📋</div>
        <p>هنوز تراکنشی ثبت نشده</p>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className={`${isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-50 text-gray-500'} text-xs`}>
              <th className="px-4 py-3 text-right font-medium">مشتری</th>
              <th className="px-4 py-3 text-right font-medium">مبلغ</th>
              <th className="px-4 py-3 text-right font-medium">امتیاز</th>
              <th className="px-4 py-3 text-right font-medium">وضعیت</th>
              <th className="px-4 py-3 text-right font-medium">تاریخ</th>
              <th className="px-4 py-3 text-right font-medium">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
            {transactions.map(tx => (
              <tr key={tx.id}
                className={`transition-colors ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-50'}`}>
                <td className={`px-4 py-3 font-medium ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>
                  {tx.customer_name || '—'}
                </td>
                <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  {Number(tx.final_amount).toLocaleString('fa-IR')} ت
                </td>
                <td className={`px-4 py-3 ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                  {tx.points_earned > 0 ? `+${farsiNum(tx.points_earned)}` : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(tx.status)}`}>
                    {statusLabel(tx.status)}
                  </span>
                </td>
                <td className={`px-4 py-3 text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  {new Date(tx.created_at).toLocaleDateString('fa-IR')}
                </td>
                <td className="px-4 py-3">
                  {tx.status === 'pending' && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => onApprove(tx.id)}
                        className="px-2 py-1 text-xs bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                        تأیید
                      </button>
                      <button
                        onClick={() => onReject(tx.id)}
                        className="px-2 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                        رد
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
)

// ─── Top Customers ───────────────────────────────────────────────

const TopCustomers = ({
  loyalties, loading, isDark,
}: {
  loyalties: BusinessLoyalty[]
  loading: boolean
  isDark: boolean
}) => (
  <div className={`rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
    <div className={`flex items-center justify-between px-6 py-4 border-b ${
      isDark ? 'border-slate-700' : 'border-gray-100'
    }`}>
      <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
        برترین مشتریان
      </h3>
      <span className={`text-xs px-2 py-1 rounded-full ${
        isDark ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-500'
      }`}>
        {farsiNum(loyalties.length)} مشتری
      </span>
    </div>
    <div className="p-4">
      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4].map(i => (
            <div key={i} className={`h-10 rounded-lg animate-pulse ${isDark ? 'bg-slate-700' : 'bg-gray-100'}`} />
          ))}
        </div>
      ) : loyalties.length === 0 ? (
        <div className={`p-6 text-center ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
          <div className="text-3xl mb-1">👥</div>
          <p className="text-sm">مشتریان شما اینجا نمایش داده می‌شوند</p>
        </div>
      ) : (
        <div className="space-y-2">
          {loyalties.slice(0, 8).map((loy, idx) => (
            <div key={loy.id}
              className={`flex items-center gap-3 p-2 rounded-xl ${
                isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-50'
              } transition-colors`}>
              {/* Rank */}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                idx === 1 ? 'bg-gray-300 text-gray-700' :
                idx === 2 ? 'bg-amber-600 text-white' :
                isDark ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-500'
              }`}>
                {idx + 1}
              </div>
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {loy.customer_name?.charAt(0) || '؟'}
              </div>
              {/* Name & Points */}
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium truncate ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>
                  {loy.customer_name || 'مشتری'}
                </div>
                <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  {farsiNum(loy.points)} امتیاز
                </div>
              </div>
              {/* VIP Badge */}
              {loy.vip_status !== 'none' && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold">
                  {vipLabel(loy.vip_status)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)

// ─── Quick Action Button ─────────────────────────────────────────

const QuickBtn = ({
  icon, label, href, badge, color,
}: { icon: string; label: string; href: string; badge?: number; color: string }) => (
  <Link to={href}
    className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 bg-gradient-to-br ${color}`}>
    {badge && badge > 0 && (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
        {badge}
      </span>
    )}
    <span className="text-2xl">{icon}</span>
    <span className="text-xs font-semibold text-center">{label}</span>
  </Link>
)

// ─── Package Status Card ─────────────────────────────────────────

const PackageCard = ({
  pkg, isDark,
}: { pkg: Package | null; isDark: boolean }) => (
  <div className={`rounded-2xl p-5 ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
    <div className="flex items-center justify-between mb-3">
      <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
        وضعیت پکیج
      </h3>
      {pkg ? (
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          pkg.is_active
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-gray-100 text-gray-500'
        }`}>
          {pkg.is_active ? '✅ فعال' : '⏸ غیرفعال'}
        </span>
      ) : (
        <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
          ⚠️ بدون پکیج
        </span>
      )}
    </div>
    {pkg ? (
      <div className="space-y-2">
        <div className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
          <span className={`font-medium ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>
            وضعیت تأیید:{' '}
          </span>
          {pkg.status === 'approved' ? '✅ تأیید شده' :
           pkg.status === 'pending' ? '⏳ در انتظار' :
           pkg.status === 'draft' ? '📝 پیش‌نویس' : '❌ رد شده'}
        </div>
        {pkg.start_date && (
          <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            از {new Date(pkg.start_date).toLocaleDateString('fa-IR')}
            {pkg.end_date ? ` تا ${new Date(pkg.end_date).toLocaleDateString('fa-IR')}` : ''}
          </div>
        )}
      </div>
    ) : (
      <div>
        <p className={`text-sm mb-3 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          برای جذب مشتریان جدید و ارائه تجربه‌های VIP، اولین پکیج خود را ایجاد کنید.
        </p>
        <Link to="/dashboard/packages"
          className="inline-flex items-center gap-1.5 text-sm bg-teal-500 text-white px-4 py-2 rounded-xl hover:bg-teal-600 transition-colors">
          <span>ساخت پکیج</span>
          <span>+</span>
        </Link>
      </div>
    )}
  </div>
)

// ─── Main Component ───────────────────────────────────────────────

export const BusinessDashboard = () => {
  const { isDark } = useTheme()
  const { user } = useAuth()

  const [transactions, setTransactions] = useState<BusinessTransaction[]>([])
  const [loyalties, setLoyalties] = useState<BusinessLoyalty[]>([])
  const [activePackage, setActivePackage] = useState<Package | null>(null)
  const [txLoading, setTxLoading] = useState(true)
  const [loyLoading, setLoyLoading] = useState(true)
  const [pkgLoading, setPkgLoading] = useState(true)

  useEffect(() => {
    // Load recent transactions
    apiService.getTransactions({ page_size: 10 }).then(r => {
      if (r.data?.results) setTransactions(r.data.results)
    }).finally(() => setTxLoading(false))

    // Load loyalties (customers)
    apiService.getLoyalties().then(r => {
      if (r.data) setLoyalties(r.data)
    }).finally(() => setLoyLoading(false))

    // Load active package
    apiService.getPackages().then(r => {
      if (r.data) {
        const active = r.data.find(p => p.is_active) ?? r.data[0] ?? null
        setActivePackage(active)
      }
    }).finally(() => setPkgLoading(false))
  }, [])

  const handleApprove = async (id: number) => {
    await apiService.approveTransaction(id)
    setTransactions(prev =>
      prev.map(tx => tx.id === id ? { ...tx, status: 'approved' } : tx)
    )
  }

  const handleReject = async (id: number) => {
    await apiService.rejectTransaction(id)
    setTransactions(prev =>
      prev.map(tx => tx.id === id ? { ...tx, status: 'rejected' } : tx)
    )
  }

  // Compute stats
  const pendingTx = transactions.filter(t => t.status === 'pending').length
  const thisMonth = new Date()
  const approvedThisMonth = transactions.filter(t => {
    if (t.status !== 'approved') return false
    const d = new Date(t.created_at)
    return d.getMonth() === thisMonth.getMonth() && d.getFullYear() === thisMonth.getFullYear()
  }).length
  const totalRevenue = transactions
    .filter(t => t.status === 'approved')
    .reduce((s, t) => s + Number(t.final_amount), 0)

  // Simplified business score (50 base + activity bonus)
  const businessScore = Math.min(100,
    50 +
    Math.min(30, loyalties.length * 2) +
    Math.min(20, approvedThisMonth * 2)
  )

  const businessName = user?.businessProfile?.name || user?.name || 'کسب‌وکار'

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              سلام، {businessName} 👋
            </h1>
            <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              خلاصه عملکرد کسب‌وکار شما در فایدو
            </p>
          </div>
          <Link to="/dashboard/packages"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all text-sm">
            <span>📦</span>
            <span>مدیریت پکیج</span>
          </Link>
        </div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="👥" title="کل مشتریان" value={farsiNum(loyalties.length)}
            sub="وفادار به کسب‌وکار شما"
            gradient="from-teal-500 to-teal-700" isDark={isDark} />
          <StatCard icon="⏳" title="تراکنش در انتظار" value={farsiNum(pendingTx)}
            sub="نیاز به تأیید دارند"
            gradient={pendingTx > 0 ? 'from-amber-500 to-orange-600' : 'from-slate-500 to-slate-700'} isDark={isDark} />
          <StatCard icon="✅" title="تأیید این ماه" value={farsiNum(approvedThisMonth)}
            sub="تراکنش موفق"
            gradient="from-emerald-500 to-emerald-700" isDark={isDark} />
          <StatCard icon="💰" title="درآمد تأیید شده" value={`${Math.round(totalRevenue / 1000).toLocaleString('fa-IR')}K`}
            sub="تومان این دوره"
            gradient="from-purple-500 to-indigo-700" isDark={isDark} />
        </div>

        {/* ── Quick Actions ── */}
        <div className={`rounded-2xl p-5 ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
          <h3 className={`font-bold text-sm mb-4 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
            دسترسی سریع
          </h3>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
            <QuickBtn icon="📦" label="پکیج‌ها" href="/dashboard/packages"
              color="from-teal-500 to-teal-700" />
            <QuickBtn icon="📋" label="تراکنش‌ها" href="/dashboard/transactions"
              badge={pendingTx} color="from-amber-500 to-orange-600" />
            <QuickBtn icon="🎁" label="هدایای ویژه" href="/dashboard/elite-gift-claims"
              color="from-pink-500 to-rose-600" />
            <QuickBtn icon="👤" label="پروفایل" href="/dashboard/profile"
              color="from-blue-500 to-blue-700" />
            <QuickBtn icon="⚙️" label="تنظیمات" href="/dashboard/settings"
              color="from-slate-500 to-slate-700" />
          </div>
        </div>

        {/* ── Two-column: Transactions + Right panel ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transactions - 2 cols */}
          <div className="lg:col-span-2">
            <TransactionsTable
              transactions={transactions}
              loading={txLoading}
              isDark={isDark}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          </div>

          {/* Right panel - 1 col */}
          <div className="space-y-4">
            {!pkgLoading && <PackageCard pkg={activePackage} isDark={isDark} />}
            <BusinessScoreCard score={businessScore} isDark={isDark} />
          </div>
        </div>

        {/* ── Top Customers ── */}
        <TopCustomers loyalties={loyalties} loading={loyLoading} isDark={isDark} />

      </div>
    </DashboardLayout>
  )
}
