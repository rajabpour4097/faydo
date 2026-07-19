import { Link } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import qrScanIcon from '../../assets/dashboard/qr-scan.png'
import clubsIcon from '../../assets/dashboard/clubs-shield.png'
import heartIcon from '../../assets/dashboard/heart.png'
import walletIcon from '../../assets/dashboard/wallet.png'

interface QuickAccessItem {
  id: string
  title: string
  subtitle: string
  icon: string
  href: string
  bg: string
  bgDark: string
  isActive: boolean
}

/** ترتیب بصری چپ→راست مطابق طراحی */
const MENU_ITEMS: QuickAccessItem[] = [
  {
    id: 'qr-scan',
    title: 'اسکن QR',
    subtitle: 'سریع و هوشمند',
    icon: qrScanIcon,
    href: '/qr-scan',
    bg: '#E7F6F8',
    bgDark: 'rgba(20, 184, 166, 0.14)',
    isActive: true,
  },
  {
    id: 'clubs',
    title: 'باشگاه‌ها',
    subtitle: 'مکان‌های ویژه',
    icon: clubsIcon,
    href: '/clubs',
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

function ArrowButton() {
  return (
    <span className="inline-flex items-center justify-center w-[26px] h-[26px] rounded-full bg-white shadow-[0_2px_8px_rgba(15,23,42,0.1)]">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M9 6L15 12L9 18"
          stroke="#C0C6D0"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

export const QuickAccessMenu = () => {
  const { isDark } = useTheme()

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-[#2DD4BF] flex-shrink-0" />
        <h3
          className={`text-[15px] font-extrabold ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}
        >
          دسترسی سریع
        </h3>
      </div>

      {/* ردیف افقی ۴تایی دقیقاً مطابق طراحی */}
      <div
        className={`rounded-[22px] p-2.5 ${
          isDark ? 'bg-slate-800' : 'bg-white'
        }`}
        style={{
          boxShadow: isDark
            ? '0 8px 24px rgba(0,0,0,0.25)'
            : '0 8px 24px rgba(15, 23, 42, 0.05)',
        }}
      >
        <div className="grid grid-cols-4 gap-2" dir="ltr">
          {MENU_ITEMS.map((item) => {
            const card = (
              <div
                dir="rtl"
                className={`relative flex flex-col items-center min-h-[128px] rounded-[18px] px-1.5 pt-3 pb-2 transition-transform duration-200 ${
                  item.isActive
                    ? 'hover:-translate-y-0.5 active:scale-[0.98]'
                    : 'opacity-70 cursor-not-allowed'
                }`}
                style={{
                  backgroundColor: isDark ? item.bgDark : item.bg,
                }}
              >
                <img
                  src={item.icon}
                  alt=""
                  className="w-10 h-10 object-contain mb-2 drop-shadow-[0_4px_10px_rgba(15,23,42,0.12)]"
                  draggable={false}
                />

                <div className="text-center px-0.5 flex-1 w-full">
                  <p
                    className={`text-[11px] font-extrabold leading-tight ${
                      isDark ? 'text-white' : 'text-[#1F2937]'
                    }`}
                  >
                    {item.title}
                  </p>
                  <p
                    className={`text-[9px] mt-0.5 leading-snug ${
                      isDark ? 'text-slate-400' : 'text-[#9CA3AF]'
                    }`}
                  >
                    {item.subtitle}
                  </p>
                </div>

                <div className="absolute bottom-2 left-2">
                  <ArrowButton />
                </div>
              </div>
            )

            if (!item.isActive) {
              return (
                <div key={item.id} title="به زودی">
                  {card}
                </div>
              )
            }

            return (
              <Link key={item.id} to={item.href} className="block min-w-0">
                {card}
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
