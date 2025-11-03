import React, { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { useTheme } from '../../contexts/ThemeContext'

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
  const qrCodeRegionId = 'qr-reader'

  useEffect(() => {
    if (isOpen && !isScanning) {
      startScanner()
    }

    return () => {
      stopScanner()
    }
  }, [isOpen])

  const startScanner = async () => {
    try {
      setError(null)
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
    }
  }

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
      } catch (err) {
        console.error('Error stopping scanner:', err)
      }
    }
    setIsScanning(false)
  }

  const handleScanSuccess = async (decodedText: string) => {
    await stopScanner()
    onScanSuccess(decodedText)
    onClose()
  }

  const handleClose = async () => {
    await stopScanner()
    onClose()
  }

  if (!isOpen) return null

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
              <div className="text-6xl mb-4">📷</div>
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={startScanner}
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
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  QR Code را در مقابل دوربین قرار دهید
                </p>
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
