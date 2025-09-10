import React, { useState } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  onCreate: (payload: any) => Promise<void>
}

export const DiscountCreateModal: React.FC<Props> = ({open,onClose,onCreate}) => {
  const [form, setForm] = useState({title:'',description:'',percentage:10,start_date:'',end_date:''})
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState<string|null>(null)

  if(!open) return null

  const submit = async (e:React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      await onCreate(form)
      onClose()
    } catch(err:any){
      setError(err?.message || 'خطا')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-xl shadow p-6">
        <h2 className="text-lg font-bold mb-4">ایجاد تخفیف جدید</h2>
        {error && <div className="bg-red-100 text-red-700 text-sm p-2 rounded mb-3">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          <input className="w-full border rounded p-2 text-sm" placeholder="عنوان" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required />
          <textarea className="w-full border rounded p-2 text-sm" placeholder="توضیحات" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
          <input type="number" min={1} max={100} className="w-full border rounded p-2 text-sm" placeholder="درصد" value={form.percentage} onChange={e=>setForm({...form,percentage:Number(e.target.value)})} required />
          <div className="flex gap-2">
            <input type="datetime-local" className="flex-1 border rounded p-2 text-sm" value={form.start_date} onChange={e=>setForm({...form,start_date:e.target.value})} required />
            <input type="datetime-local" className="flex-1 border rounded p-2 text-sm" value={form.end_date} onChange={e=>setForm({...form,end_date:e.target.value})} required />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded border">انصراف</button>
            <button disabled={loading} className="px-4 py-2 text-sm rounded bg-blue-600 text-white disabled:opacity-50">{loading?'در حال ثبت...':'ثبت'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
