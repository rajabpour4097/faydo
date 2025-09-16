import React from 'react'

export const ScanQR: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] dashboard-bg p-4 lg:p-6 text-white">
      <div className="max-w-2xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">اسکن کد QR</h1>
        <p className="text-white/70 mb-6">به زودی. این صفحه برای اسکن QR تخفیف‌ها/عضویت است.</p>
        <div className="w-40 h-40 mx-auto rounded-xl bg-gradient-to-br from-purple-600/40 to-blue-600/40 border border-white/10" />
      </div>
    </div>
  )
}

export default ScanQR
