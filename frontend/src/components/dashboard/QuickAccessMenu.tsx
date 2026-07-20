import { Link } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { useQrScanner } from '../../contexts/QrScannerContext'
import qrScanIcon from '../../assets/dashboard/qr-scan.png'
import clubsIcon from '../../assets/dashboard/clubs-shield.png'
import heartIcon from '../../assets/dashboard/heart.png'
import walletIcon from '../../assets/dashboard/wallet.png'

interface QuickAccessItem {
  id: string
  title: string
  subtitle: string
  icon: string
  href?: string
  action?: 'scan'
  bg: string
  bgDark: string
  isActive: boolean
  iconClassName?: string
}

/** ترتیب بصری چپ→راست مطابق طراحی */
const MENU_ITEMS: QuickAccessItem[] = [
  {
    id: 'qr-scan',
    title: 'اسکن QR',
    subtitle: 'سریع و هوشمند',
    icon: qrScanIcon,
    action: 'scan',
    bg: '#E7F6F8',
    bgDark: 'rgba(20, 184, 166, 0.14)',
    isActive: true,
    iconClassName:
      'w-[37px] h-[37px] drop-shadow-[0_4px_10px_rgba(20,184,166,0.18)]',
  },
  {
    id: 'clubs',
    title: 'باشگاه‌ها',
    subtitle: 'مکان‌های ویژه',
    icon: clubsIcon,
    href: '/dashboard/clubs',
    bg: '#FDECEE',
    bgDark: 'rgba(239, 68, 68, 0.12)',
    isActive: true,
  },
  {
    id: 'favorites',
    title: 'علاقه‌مندی‌ها',
    subtitle: 'لیست مورد علاقه',
    icon: heartIcon,
    href: '/favorites',
    bg: '#F3EEFC',
    bgDark: 'rgba(139, 92, 246, 0.14)',
    isActive: false,
  },
  {
    id: 'wallet',
    title: 'کیف پول',
    subtitle: 'مدیریت موجودی',
    icon: walletIcon,
    href: '/wallet',
    bg: '#EAF7F1',
    bgDark: 'rgba(16, 185, 129, 0.12)',
    isActive: false,
  },
]

const DEFAULT_ICON =
  'w-8 h-8 drop-shadow-[0_3px_8px_rgba(15,23,42,0.1)]'

function ArrowButton() {
  return (
    <span className="inline-flex items-center justify-center w-[13px] h-[13px] rounded-full bg-white shadow-[0_1px_4px_rgba(15,23,42,0.08)]">
      <svg width="6" height="6" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M9 6L15 12L9 18"
          stroke="#C0C6D0"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

function QuickAccessCard({
  item,
  isDark,
}: {
  item: QuickAccessItem
  isDark: boolean
}) {
  const qrScanner = useQrScanner()

  const card = (
    <div
      dir="rtl"
      className={`relative flex flex-col items-center rounded-[16px] px-1 pt-2 pb-1.5 transition-transform duration-200 ${
        item.isActive
          ? 'hover:-translate-y-0.5 active:scale-[0.98]'
          : 'opacity-70 cursor-not-allowed'
      }`}
      style={{
        backgroundColor: isDark ? item.bgDark : item.bg,
        minHeight: '104px',
      }}
    >
      <img
        src={item.icon}
        alt=""
        className={`object-contain mb-1 ${
          item.iconClassName ?? DEFAULT_ICON
        }`}
        draggable={false}
      />

      <div className="text-center w-full flex-1 px-0.5 pb-4 pl-4">
        <p
          className={`text-[10px] font-extrabold leading-tight ${
            isDark ? 'text-white' : 'text-[#1F2937]'
          }`}
        >
          {item.title}
        </p>
        <p
          className={`text-[7.5px] mt-0.5 leading-[1.35] ${
            isDark ? 'text-slate-400' : 'text-[#9CA3AF]'
          }`}
        >
          {item.subtitle}
        </p>
      </div>

      <div className="absolute bottom-1.5 left-1.5">
        <ArrowButton />
      </div>
    </div>
  )

  if (!item.isActive) {
    return (
      <div title="به زودی" className="min-w-0">
        {card}
      </div>
    )
  }

  if (item.action === 'scan') {
    return (
      <button
        type="button"
        onClick={() => qrScanner?.openScanner()}
        className="block min-w-0 w-full text-right"
      >
        {card}
      </button>
    )
  }

  return (
    <Link to={item.href!} className="block min-w-0">
      {card}
    </Link>
  )
}

export const QuickAccessMenu = () => {
  const { isDark } = useTheme()

  return (
    <section>
      <div className="flex items-center gap-2 mb-2.5">
        <span className="w-2 h-2 rounded-full bg-[#2DD4BF] flex-shrink-0" />
        <h3
          className={`text-[15px] font-extrabold ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}
        >
          دسترسی سریع
        </h3>
      </div>

      <div
        className={`rounded-[20px] p-2 ${
          isDark ? 'bg-slate-800' : 'bg-white'
        }`}
        style={{
          boxShadow: isDark
            ? '0 8px 24px rgba(0,0,0,0.25)'
            : '0 8px 22px rgba(15, 23, 42, 0.05)',
        }}
      >
        <div className="grid grid-cols-4 gap-1.5" dir="ltr">
          {MENU_ITEMS.map((item) => (
            <QuickAccessCard key={item.id} item={item} isDark={isDark} />
          ))}
        </div>
      </div>
    </section>
  )
}
