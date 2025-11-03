import React, { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'

export const BusinessQRCode: React.FC = () => {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [qrGenerated, setQrGenerated] = useState(false)
  const [uniqueCode, setUniqueCode] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBusinessProfile = async () => {
      if (user?.type === 'business') {
        try {
          setLoading(true)
          // Import API service dynamically
          const { apiService } = await import('../../services/api')
          
          // Get current profile
          const response = await apiService.getProfile()
          
          if (response.data && response.data.profile) {
            const businessProfile = response.data.profile as any
            const code = businessProfile.unique_code || '111111'
            setUniqueCode(code)
            generateQRCode(code)
          } else {
            setError('پروفایل کسب‌وکار یافت نشد')
          }
        } catch (err) {
          console.error('Error fetching business profile:', err)
          setError('خطا در دریافت اطلاعات')
        } finally {
          setLoading(false)
        }
      }
    }

    fetchBusinessProfile()
  }, [user])

  const generateQRCode = async (code: string) => {
    if (canvasRef.current) {
      try {
        await QRCode.toCanvas(canvasRef.current, code, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        })
        setQrGenerated(true)
      } catch (error) {
        console.error('Error generating QR code:', error)
      }
    }
  }

  const downloadQRCode = () => {
    if (canvasRef.current) {
      const url = canvasRef.current.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `faydo-qr-${uniqueCode}.png`
      link.href = url
      link.click()
    }
  }

  if (user?.type !== 'business') {
    return null
  }

  return (
    <div
      className={`p-6 rounded-2xl ${
        isDark ? 'bg-slate-800' : 'bg-white'
      } shadow-lg`}
      style={{ direction: 'rtl' }}
    >
      <h2
        className={`text-2xl font-bold mb-4 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}
      >
        QR Code کسب‌وکار شما
      </h2>

      {loading ? (
        <div className="flex flex-col items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className={`mt-4 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            در حال بارگذاری...
          </p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center py-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
        {/* QR Code Canvas */}
        <div className="bg-white p-4 rounded-xl mb-4">
          <canvas ref={canvasRef} />
        </div>

        {/* Unique Code Display */}
        <div className="mb-4 text-center">
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            کد یکتا:
          </p>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {uniqueCode}
          </p>
        </div>

        {/* Instructions */}
        <div
          className={`mb-4 p-4 rounded-lg ${
            isDark ? 'bg-slate-700' : 'bg-gray-100'
          }`}
        >
          <h3 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            راهنما:
          </h3>
          <ul className={`text-sm space-y-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
            <li className="flex items-start">
              <span className="ml-2">۱.</span>
              <span>این QR Code را دانلود و چاپ کنید</span>
            </li>
            <li className="flex items-start">
              <span className="ml-2">۲.</span>
              <span>در محل کسب‌وکار خود نصب کنید</span>
            </li>
            <li className="flex items-start">
              <span className="ml-2">۳.</span>
              <span>مشتریان با اسکن این کد، به صفحه شما دسترسی پیدا می‌کنند</span>
            </li>
          </ul>
        </div>

        {/* Download Button */}
        {qrGenerated && (
          <button
            onClick={downloadQRCode}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            دانلود QR Code
          </button>
        )}
        </div>
      )}
    </div>
  )
}
