import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MobileDashboardLayout } from '../../components/layout/MobileDashboardLayout'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import { apiService, BusinessTransaction, BusinessLoyalty, Package } from '../../services/api'

// ─── Helpers ─────────────────────────────────────────────────────

const farsiNum = (n: number) => n.toLocaleString('fa-IR')

const statusLabel = (s: string) =>
  s === 'pending' ? 'در انتظار' : s === 'approved' ? 'تأیید شده' : 'رد شده'

const statusBadge = (s: string) =>
  s === 'pending'
    ? 'bg-amber-100 text-amber-700 border border-amber-200'
    : s === 'approved'
    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
    : 'bg-red-100 text-red-600 border border-red-200'

// ─── Mobile Stat Card ─────────────────────────────────────────────

const MobileStatCard = ({
  icon, title, value, gradient,
}: {
  icon: string; title: string; value: string; gradient: string
}) => (
  <div className={`rounded-2xl p-4 text-white shadow-md bg-gradient-to-br ${gradient} relative overflow-hidden`}>
    <div className="absolute -bottom-3 -left-3 w-14 h-14 bg-white bg-opacity-10 rounded-full" />
    <div className="text-2xl mb-1">{icon}</div>
    <div className="text-xl font-extrabold">{value}</div>
    <div className="text-xs opacity-80 font-medium mt-0.5">{title}</div>
  </div>
)

// ─── Transaction Row ──────────────────────────────────────────────

const TxRow = ({
  tx, isDark, onApprove, onReject,
}: {
  tx: BusinessTransaction
  isDark: boolean
  onApprove: (id: number) => void
  onReject: (id: number) => void
}) => (
  <div className={`rounded-xl p-3 ${isDark ? 'bg-slate-700' : 'bg-gray-50'} space-y-2`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
          {tx.customer_name?.charAt(0) || '؟'}
        </div>
        <div>
          <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {tx.customer_name || 'مشتری'}
          </div>
          <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            {new Date(tx.created_at).toLocaleDateString('fa-IR')}
          </div>
        </div>
      </div>
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(tx.status)}`}>
        {statusLabel(tx.status)}
      </span>
    </div>
    <div className="flex items-center justify-between">
      <div className={`text-sm font-bold ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
        {Number(tx.final_amount).toLocaleString('fa-IR')} تومان
      </div>
      {tx.status === 'pending' && (
        <div className="flex gap-1.5">
          <button
            onClick={() => onApprove(tx.id)}
            className="px-3 py-1 text-xs bg-emerald-500 text-white rounded-lg font-medium">
            تأیید
          </button>
          <button
            onClick={() => onReject(tx.id)}
            className="px-3 py-1 text-xs bg-red-500 text-white rounded-lg font-medium">
            رد
          </button>
        </div>
      )}
    </div>
  </div>
)

// ─── Quick Action ─────────────────────────────────────────────────

const MobileAction = ({
  icon, label, href, badge, color,
}: { icon: string; label: string; href: string; badge?: number; color: string }) => (
  <Link to={href}
    className={`relative flex flex-col items-center gap-1.5 p-3 rounded-2xl text-white shadow-md bg-gradient-to-br ${color} active:scale-95 transition-transform`}>
    {badge && badge > 0 && (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center z-10">
        {badge}
      </span>
    )}
    <span className="text-xl">{icon}</span>
    <span className="text-xs font-semibold text-center leading-tight">{label}</span>
  </Link>
)

// ─── Business Score Mini ──────────────────────────────────────────

const ScoreMini = ({ score, isDark }: { score: number; isDark: boolean }) => {
  const color =
    score >= 80 ? 'text-emerald-500' :
    score >= 60 ? 'text-teal-500' :
    score >= 40 ? 'text-amber-500' : 'text-red-500'
  const barColor =
    score >= 80 ? 'bg-emerald-500' :
    score >= 60 ? 'bg-teal-500' :
    score >= 40 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div className={`rounded-2xl p-4 ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-md`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          امتیاز کسب‌وکار
        </span>
        <span className={`text-2xl font-extrabold ${color}`}>{farsiNum(score)}</span>
      </div>
      <div className={`w-full h-2.5 rounded-full ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}>
        <div className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${score}%` }} />
      </div>
      <div className="flex justify-between mt-1">
        <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>۰</span>
        <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>۱۰۰</span>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────

export const BusinessDashboardMobile = () => {
  const { isDark } = useTheme()
  const { user } = useAuth()

  const [transactions, setTransactions] = useState<BusinessTransaction[]>([])
  const [loyalties, setLoyalties] = useState<BusinessLoyalty[]>([])
  const [activePackage, setActivePackage] = useState<Package | null>(null)
  const [txLoading, setTxLoading] = useState(true)
  const [loyLoading, setLoyLoading] = useState(true)

  useEffect(() => {
    apiService.getTransactions({ page_size: 6 }).then(r => {
      if (r.data?.results) setTransactions(r.data.results)
    }).finally(() => setTxLoading(false))

    apiService.getLoyalties().then(r => {
      if (r.data) setLoyalties(r.data)
    }).finally(() => setLoyLoading(false))

    apiService.getPackages().then(r => {
      if (r.data) {
        setActivePackage(r.data.find(p => p.is_active) ?? r.data[0] ?? null)
      }
    })
  }, [])

  const handleApprove = async (id: number) => {
    await apiService.approveTransaction(id)
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: 'approved' } : t))
  }
  const handleReject = async (id: number) => {
    await apiService.rejectTransaction(id)
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: 'rejected' } : t))
  }

  const pendingTx = transactions.filter(t => t.status === 'pending').length
  const thisMonth = new Date()
  const approvedThisMonth = transactions.filter(t => {
    if (t.status !== 'approved') return false
    const d = new Date(t.created_at)
    return d.getMonth() === thisMonth.getMonth() && d.getFullYear() === thisMonth.getFullYear()
  }).length

  const businessScore = Math.min(100,
    50 + Math.min(30, loyalties.length * 2) + Math.min(20, approvedThisMonth * 2)
  )

  const businessName = user?.businessProfile?.name || user?.name || 'کسب‌وکار'

  return (
    <MobileDashboardLayout>
      <div className="p-4 space-y-4 pb-8">

        {/* ── Welcome header ── */}
        <div className={`rounded-2xl p-4 ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-md`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-lg font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                سلام، {businessName} 👋
              </h1>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                داشبورد کسب‌وکار فایدو
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg">
              <span className="text-2xl">🏪</span>
            </div>
          </div>

          {/* Package quick status */}
          <div className={`mt-3 flex items-center gap-2 p-2 rounded-xl ${
            isDark ? 'bg-slate-700' : 'bg-gray-50'
          }`}>
            <span className="text-sm">📦</span>
            <span className={`text-xs flex-1 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              {activePackage
                ? activePackage.is_active
                  ? `پکیج فعال: ${activePackage.status === 'approved' ? '✅ تأیید شده' : '⏳ در انتظار'}`
                  : '⏸ پکیج غیرفعال'
                : 'هنوز پکیجی ندارید'}
            </span>
            <Link to="/dashboard/packages"
              className="text-xs text-teal-500 font-medium">
              مدیریت ←
            </Link>
          </div>
        </div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 gap-3">
          <MobileStatCard icon="👥" title="مشتریان وفادار"
            value={loyLoading ? '...' : farsiNum(loyalties.length)}
            gradient="from-teal-500 to-teal-700" />
          <MobileStatCard icon="⏳" title="تراکنش در انتظار"
            value={txLoading ? '...' : farsiNum(pendingTx)}
            gradient={pendingTx > 0 ? 'from-amber-500 to-orange-600' : 'from-slate-400 to-slate-600'} />
          <MobileStatCard icon="✅" title="تأیید این ماه"
            value={txLoading ? '...' : farsiNum(approvedThisMonth)}
            gradient="from-emerald-500 to-emerald-700" />
          <MobileStatCard icon="⭐" title="امتیاز کسب‌وکار"
            value={farsiNum(businessScore)}
            gradient="from-purple-500 to-indigo-700" />
        </div>

        {/* ── Quick Actions ── */}
        <div className={`rounded-2xl p-4 ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-md`}>
          <h3 className={`text-xs font-bold mb-3 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            دسترسی سریع
          </h3>
          <div className="grid grid-cols-4 gap-2">
            <MobileAction icon="📦" label="پکیج‌ها" href="/dashboard/packages"
              color="from-teal-500 to-teal-700" />
            <MobileAction icon="📋" label="تراکنش" href="/dashboard/transactions"
              badge={pendingTx} color="from-amber-500 to-orange-600" />
            <MobileAction icon="🎁" label="هدیه ویژه" href="/dashboard/elite-gift-claims"
              color="from-pink-500 to-rose-600" />
            <MobileAction icon="👤" label="پروفایل" href="/dashboard/profile"
              color="from-blue-500 to-blue-700" />
          </div>
        </div>

        {/* ── Business Score ── */}
        <ScoreMini score={businessScore} isDark={isDark} />

        {/* ── Recent Transactions ── */}
        <div className={`rounded-2xl overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-md`}>
          <div className={`flex items-center justify-between px-4 py-3 border-b ${
            isDark ? 'border-slate-700' : 'border-gray-100'
          }`}>
            <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
              آخرین تراکنش‌ها
            </h3>
            <Link to="/dashboard/transactions"
              className="text-xs text-teal-500 font-medium">
              همه ←
            </Link>
          </div>
          <div className="p-3 space-y-2">
            {txLoading ? (
              [1,2,3].map(i => (
                <div key={i} className={`h-16 rounded-xl animate-pulse ${isDark ? 'bg-slate-700' : 'bg-gray-100'}`} />
              ))
            ) : transactions.length === 0 ? (
              <div className={`py-8 text-center ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                <div className="text-3xl mb-1">📋</div>
                <p className="text-xs">هنوز تراکنشی ثبت نشده</p>
              </div>
            ) : (
              transactions.slice(0, 5).map(tx => (
                <TxRow key={tx.id} tx={tx} isDark={isDark}
                  onApprove={handleApprove} onReject={handleReject} />
              ))
            )}
          </div>
        </div>

        {/* ── Top Customers ── */}
        <div className={`rounded-2xl overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-md`}>
          <div className={`flex items-center justify-between px-4 py-3 border-b ${
            isDark ? 'border-slate-700' : 'border-gray-100'
          }`}>
            <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
              برترین مشتریان
            </h3>
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>
              {farsiNum(loyalties.length)} نفر
            </span>
          </div>
          <div className="p-3 space-y-2">
            {loyLoading ? (
              [1,2,3].map(i => (
                <div key={i} className={`h-12 rounded-xl animate-pulse ${isDark ? 'bg-slate-700' : 'bg-gray-100'}`} />
              ))
            ) : loyalties.length === 0 ? (
              <div className={`py-6 text-center ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                <div className="text-3xl mb-1">👥</div>
                <p className="text-xs">مشتریان وفادار شما اینجا نمایش داده می‌شوند</p>
              </div>
            ) : (
              loyalties.slice(0, 5).map((loy, idx) => (
                <div key={loy.id}
                  className={`flex items-center gap-3 p-2 rounded-xl ${
                    isDark ? 'bg-slate-700' : 'bg-gray-50'
                  }`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                    idx === 1 ? 'bg-gray-300 text-gray-700' :
                    idx === 2 ? 'bg-amber-600 text-white' :
                    isDark ? 'bg-slate-600 text-slate-300' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {loy.customer_name?.charAt(0) || '؟'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {loy.customer_name || 'مشتری'}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      {farsiNum(loy.points)} امتیاز
                    </div>
                  </div>
                  {loy.vip_status !== 'none' && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold">
                      {loy.vip_status === 'vip_plus' ? 'VIP+' : 'VIP'}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Package Info ── */}
        {!activePackage && (
          <div className={`rounded-2xl p-4 ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-md border-2 border-dashed ${
            isDark ? 'border-teal-700' : 'border-teal-300'
          }`}>
            <div className="text-center">
              <div className="text-4xl mb-2">📦</div>
              <h3 className={`font-bold text-sm mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                هنوز پکیج ندارید
              </h3>
              <p className={`text-xs mb-3 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                اولین پکیج خود را ایجاد کنید تا مشتریان VIP جذب کنید
              </p>
              <Link to="/dashboard/packages"
                className="inline-block bg-gradient-to-r from-teal-500 to-teal-700 text-white text-sm px-5 py-2 rounded-xl font-semibold shadow">
                ساخت پکیج +
              </Link>
            </div>
          </div>
        )}

      </div>
    </MobileDashboardLayout>
  )
}
