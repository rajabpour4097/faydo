import React, { useState } from 'react'

interface Props {
  open: boolean
  onClose: ()=>void
  onSubmit: (reason:string)=>Promise<void>
}

export const DiscountReportModal: React.FC<Props> = ({open,onClose,onSubmit}) => {
  const [reason,setReason] = useState('')
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState<string|null>(null)
  if(!open) return null

  const submit = async (e:React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null)
    try {
      await onSubmit(reason)
      onClose()
    } catch(err:any){
      setError(err?.message || 'خطا')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white max-w-md w-full rounded-xl p-6 shadow">
        <h2 className="text-lg font-bold mb-4">گزارش تخلف تخفیف</h2>
        {error && <div className="bg-red-100 text-red-700 text-sm p-2 rounded mb-3">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          <textarea className="w-full border rounded p-2 text-sm" placeholder="دلیل گزارش" value={reason} onChange={e=>setReason(e.target.value)} required />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded border">انصراف</button>
            <button disabled={loading} className="px-4 py-2 text-sm rounded bg-red-600 text-white disabled:opacity-50">{loading?'ارسال...':'ارسال گزارش'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
