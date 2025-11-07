import React, { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { useTheme } from '../../contexts/ThemeContext'
import { loyaltyService, BusinessInfo } from '../../services/loyalty'
import { BusinessOptionsModal } from './BusinessOptionsModal'

interface QRScannerModalProps {
  isOpen: boolean
  onClose: () => void
  onScanSuccess: (decodedText: string) => void
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess
}) => {
  const { isDark } = useTheme()
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const isInitializedRef = useRef(false)
  const qrCodeRegionId = 'qr-reader'
  
  // States for manual code entry
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const [isLoadingBusiness, setIsLoadingBusiness] = useState(false)
  
  // States for business info
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null)
  const [showBusinessOptions, setShowBusinessOptions] = useState(false)

  useEffect(() => {
    if (isOpen && !isInitializedRef.current) {
      isInitializedRef.current = true
      startScanner()
    }
    
    if (!isOpen) {
      isInitializedRef.current = false
    }

    return () => {
      // Cleanup: حتماً اسکنر را stop و پاک کنید
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(console.error)
          }
          scannerRef.current.clear()
          scannerRef.current = null
        } catch (err) {
          console.error('Cleanup error:', err)
        }
      }
    }
  }, [isOpen])

  const startScanner = async () => {
    try {
      setError(null)
      
      // اگر اسکنر در حال اجرا است، نیازی به راه‌اندازی دوباره نیست
      if (scannerRef.current && scannerRef.current.isScanning) {
        return
      }
      
      // اگر اسکنر قبلی وجود دارد، ابتدا آن را پاک کنید
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            await scannerRef.current.stop()
          }
          scannerRef.current.clear()
          scannerRef.current = null
        } catch (err) {
          console.error('Error clearing previous scanner:', err)
        }
      }
      
      setIsScanning(true)

      // Create scanner instance
      scannerRef.current = new Html5Qrcode(qrCodeRegionId)

      // Get cameras
      const cameras = await Html5Qrcode.getCameras()
      
      if (cameras && cameras.length > 0) {
        // Try to use back camera if available
        const backCamera = cameras.find(camera => 
          camera.label.toLowerCase().includes('back') || 
          camera.label.toLowerCase().includes('rear')
        )
        const cameraId = backCamera ? backCamera.id : cameras[0].id

        // Start scanning
        await scannerRef.current.start(
          cameraId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          (decodedText) => {
            handleScanSuccess(decodedText)
          },
          (errorMessage) => {
            // Ignore error messages during scanning
            console.log('Scan error:', errorMessage)
          }
        )
      } else {
        setError('دوربینی یافت نشد')
        setIsScanning(false)
      }
    } catch (err: any) {
      console.error('Scanner error:', err)
      if (err.name === 'NotAllowedError') {
        setError('لطفاً دسترسی به دوربین را اجازه دهید')
      } else {
        setError('خطا در راه‌اندازی اسکنر')
      }
      setIsScanning(false)
      // پاک کردن reference در صورت خطا
      if (scannerRef.current) {
        try {
          scannerRef.current.clear()
        } catch (e) {
          console.error('Error clearing scanner after error:', e)
        }
        scannerRef.current = null
      }
    }
  }

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop()
        }
        scannerRef.current.clear()
      } catch (err) {
        console.error('Error stopping scanner:', err)
      } finally {
        scannerRef.current = null
      }
    }
    setIsScanning(false)
  }

  const handleScanSuccess = async (decodedText: string) => {
    await stopScanner()
    
    // فرض می‌کنیم QR Code حاوی unique_code است
    const uniqueCode = decodedText.trim()
    await fetchBusinessInfo(uniqueCode)
    
    onScanSuccess(decodedText)
  }
  
  const fetchBusinessInfo = async (code: string) => {
    setIsLoadingBusiness(true)
    setError(null)
    
    try {
      const info = await loyaltyService.getBusinessByCode(code)
      
      // بررسی اینکه کسب‌وکار پکیج فعال دارد یا نه
      if (!info.has_active_package) {
        setError(`متأسفانه "${info.business_name}" در حال حاضر پکیج فعالی ندارد و امکان استفاده از تخفیف‌ها وجود ندارد`)
        setBusinessInfo(null)
        setShowBusinessOptions(false)
        return
      }
      
      setBusinessInfo(info)
      setShowBusinessOptions(true)
    } catch (err: any) {
      console.error('Error fetching business info:', err)
      setError(err.error || err.response?.data?.error || 'کسب‌وکاری با این کد یافت نشد')
    } finally {
      setIsLoadingBusiness(false)
    }
  }

  const handleManualCodeSubmit = async () => {
    if (!manualCode.trim()) {
      setError('لطفاً کد یکتا را وارد کنید')
      return
    }
    
    await fetchBusinessInfo(manualCode.trim())
  }
  
  const resetScanner = async () => {
    // ابتدا اسکنر فعلی را متوقف کنید
    await stopScanner()
    
    // پاک کردن تمام state ها
    setError(null)
    setShowManualEntry(false)
    setManualCode('')
    setIsLoadingBusiness(false)
    
    // Reset flag و راه‌اندازی مجدد
    isInitializedRef.current = false
    
    // راه‌اندازی مجدد اسکنر با تأخیر کوتاه
    setTimeout(async () => {
      isInitializedRef.current = true
      await startScanner()
    }, 200)
  }

  const handleClose = async () => {
    await stopScanner()
    // Reset کردن تمام state ها
    setShowBusinessOptions(false)
    setBusinessInfo(null)
    setManualCode('')
    setShowManualEntry(false)
    setError(null)
    setIsLoadingBusiness(false)
    isInitializedRef.current = false
    onClose()
  }
  
  const handleBusinessOptionsClose = () => {
    setShowBusinessOptions(false)
    setBusinessInfo(null)
    // Reset کردن state های دیگر
    setManualCode('')
    setShowManualEntry(false)
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  // نمایش Business Options Modal
  if (showBusinessOptions && businessInfo) {
    return (
      <BusinessOptionsModal
        isOpen={true}
        onClose={handleBusinessOptionsClose}
        businessInfo={businessInfo}
      />
    )
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div 
        className={`relative w-full max-w-md mx-4 rounded-2xl overflow-hidden ${
          isDark ? 'bg-slate-800' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{ direction: 'rtl' }}
      >
        {/* Header */}
        <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              اسکن QR Code
            </h3>
            <button
              onClick={handleClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark 
                  ? 'hover:bg-slate-700 text-slate-400' 
                  : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scanner Area */}
        <div className="p-4">
          {error ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                خطا
              </p>
              <p className="text-red-500 mb-6 px-4">{error}</p>
              <button
                onClick={resetScanner}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
              >
                تلاش مجدد
              </button>
            </div>
          ) : (
            <>
              {/* QR Scanner */}
              <div className="relative">
                <div 
                  id={qrCodeRegionId} 
                  className="rounded-xl overflow-hidden"
                  style={{ 
                    width: '100%',
                    minHeight: '300px'
                  }}
                />
                
                {/* Scanning Frame Overlay */}
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative w-64 h-64">
                      {/* Corner decorations */}
                      <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-blue-500 rounded-tl-2xl"></div>
                      <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-blue-500 rounded-tr-2xl"></div>
                      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-blue-500 rounded-bl-2xl"></div>
                      <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-blue-500 rounded-br-2xl"></div>
                      
                      {/* Scanning line animation */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-1 bg-blue-500 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="mt-4 text-center">
                <p className={`text-sm mb-3 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  QR Code را در مقابل دوربین قرار دهید
                </p>
                
                {/* Manual Entry Toggle */}
                {!showManualEntry ? (
                  <button
                    onClick={() => setShowManualEntry(true)}
                    className={`text-sm font-medium underline ${
                      isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                    }`}
                  >
                    وارد کردن کد یکتا به صورت دستی
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-gray-100'}`}>
                      <label className={`block text-sm font-medium mb-2 text-right ${
                        isDark ? 'text-slate-300' : 'text-gray-700'
                      }`}>
                        کد یکتای کسب‌وکار
                      </label>
                      <input
                        type="text"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        placeholder="مثال: 111111"
                        className={`w-full px-4 py-2 rounded-lg text-center text-lg font-bold border-2 transition-colors ${
                          isDark
                            ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-500 focus:border-blue-500'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                        } focus:outline-none`}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleManualCodeSubmit()
                          }
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleManualCodeSubmit}
                        disabled={isLoadingBusiness || !manualCode.trim()}
                        className={`flex-1 px-4 py-2 rounded-lg font-bold transition-colors ${
                          isLoadingBusiness || !manualCode.trim()
                            ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {isLoadingBusiness ? 'در حال بررسی...' : 'تایید'}
                      </button>
                      <button
                        onClick={() => {
                          setShowManualEntry(false)
                          setManualCode('')
                          setError(null)
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          isDark
                            ? 'bg-slate-600 hover:bg-slate-500 text-white'
                            : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                        }`}
                      >
                        انصراف
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
          <button
            onClick={handleClose}
            className="w-full px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-xl transition-colors"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  )
}
