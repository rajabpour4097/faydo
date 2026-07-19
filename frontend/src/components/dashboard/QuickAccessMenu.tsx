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

const MENU_ITEMS: QuickAccessItem[] = [
  {
    id: 'qr-scan',
    title: 'اسکن QR',
    subtitle: 'سریع و هوشمند',
    icon: qrScanIcon,
    href: '/qr-scan',
    bg: '#e8f8f6',
    bgDark: 'rgba(20, 184, 166, 0.12)',
    isActive: true,
  },
  {
    id: 'clubs',
    title: 'باشگاه‌ها',
    subtitle: 'مکان‌های ویژه',
    icon: clubsIcon,
    href: '/clubs',
    bg: '#fdecee',
    bgDark: 'rgba(239, 68, 68, 0.12)',
    isActive: true,
  },
  {
    id: 'favorites',
    title: 'علاقه‌مندی‌ها',
    subtitle: 'لیست مورد علاقه',
    icon: heartIcon,
    href: '/favorites',
    bg: '#f3eefc',
    bgDark: 'rgba(139, 92, 246, 0.14)',
    isActive: false,
  },
  {
    id: 'wallet',
    title: 'کیف پول',
    subtitle: 'مدیریت موجودی',
    icon: walletIcon,
    href: '/wallet',
    bg: '#eaf7f1',
    bgDark: 'rgba(16, 185, 129, 0.12)',
    isActive: false,
  },
]

function ArrowButton({ disabled }: { disabled?: boolean }) {
  return (
    <span
      className={`inline-flex items-center justify-center w-7 h-7 rounded-full bg-white shadow-sm ${
        disabled ? 'opacity-60' : ''
      }`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M14 6L8 12L14 18"
          stroke="#94a3b8"
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
      <div className="flex items-center gap-2 mb-3 px-0.5">
        <span className="w-2 h-2 rounded-full bg-teal-400" />
        <h3
          className={`text-[15px] font-bold ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}
        >
          دسترسی سریع
        </h3>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {MENU_ITEMS.map((item) => {
          const style = {
            backgroundColor: isDark ? item.bgDark : item.bg,
          }

          const body = (
            <div
              className={`relative h-[132px] rounded-[22px] p-3.5 flex flex-col transition-transform duration-200 ${
                item.isActive ? 'hover:-translate-y-0.5 active:scale-[0.98]' : 'opacity-80'
              }`}
              style={style}
            >
              <img
                src={item.icon}
                alt=""
                className="w-11 h-11 object-contain mb-2"
                draggable={false}
              />
              <div className="mt-auto">
                <p
                  className={`text-[14px] font-extrabold leading-tight ${
                    isDark ? 'text-white' : 'text-gray-800'
                  }`}
                >
                  {item.title}
                </p>
                <p
                  className={`text-[11px] mt-0.5 ${
                    isDark ? 'text-slate-400' : 'text-gray-400'
                  }`}
                >
                  {item.subtitle}
                </p>
              </div>
              <div className="absolute bottom-3 left-3">
                <ArrowButton disabled={!item.isActive} />
              </div>
            </div>
          )

          if (!item.isActive) {
            return (
              <div key={item.id} title="به زودی" className="cursor-not-allowed">
                {body}
              </div>
            )
          }

          return (
            <Link key={item.id} to={item.href} className="block">
              {body}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
