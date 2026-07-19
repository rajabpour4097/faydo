import { useAuth } from '../../contexts/AuthContext'
import waveHand from '../../assets/dashboard/wave-hand.png'

export const CustomerHeroSection = () => {
  const { user } = useAuth()
  const firstName = user?.first_name || user?.name?.split(' ')[0] || 'کاربر'

  return (
    <div
      className="relative overflow-hidden rounded-[22px] px-4 py-4 text-white"
      style={{
        background:
          'linear-gradient(115deg, #7c3aed 0%, #c026d3 42%, #e11d48 100%)',
        boxShadow: '0 12px 28px rgba(190, 24, 93, 0.22)',
      }}
    >
      <div
        className="pointer-events-none absolute -top-10 -left-8 w-36 h-36 rounded-full opacity-30"
        style={{
          background:
            'radial-gradient(circle, rgba(255,255,255,0.55) 0%, transparent 70%)',
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-12 -right-6 w-40 h-40 rounded-full opacity-25"
        style={{
          background:
            'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)',
        }}
      />

      <div className="relative flex items-center gap-2">
        <img
          src={waveHand}
          alt=""
          className="w-8 h-8 object-contain select-none flex-shrink-0"
          draggable={false}
        />
        <div className="min-w-0">
          <h2 className="text-[17px] sm:text-lg font-extrabold leading-snug">
            سلام {firstName} عزیز!
          </h2>
          <p className="text-[12px] sm:text-[13px] mt-0.5 text-white/85">
            به داشبورد خود خوش آمدید
          </p>
        </div>
      </div>
    </div>
  )
}
