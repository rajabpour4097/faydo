import React, { useEffect, useState } from 'react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import discountService from '../../services/discountService'
import { DiscountCard } from '../../components/discounts/DiscountCard'
import { DiscountCreateModal } from '../../components/discounts/DiscountCreateModal'
import { Discount, DiscountCreate } from '../../types/discount'

export const BusinessDiscounts: React.FC = () => {
  const [discounts,setDiscounts] = useState<Discount[]>([])
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState<string|null>(null)
  const [openCreate,setOpenCreate] = useState(false)

  const load = async ()=>{
    setLoading(true); setError(null)
    try {
      const data = await discountService.getDiscounts({ mine: true })
      setDiscounts(data)
    } catch(err:any){ setError(err.message) } finally { setLoading(false) }
  }
  useEffect(()=>{ load() },[])

  const create = async (payload: DiscountCreate) => {
    await discountService.createDiscount(payload)
    await load()
  }

  const del = async (id:number) => {
    if(!confirm('حذف تخفیف؟')) return
    try { await discountService.deleteDiscount(id); await load() } catch(e){ alert('خطا') }
  }

  const handleViewDetails = (id: number) => {
    // Placeholder for viewing discount details
    console.log('View details for discount:', id)
  }

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 min-h-[calc(100vh-4rem)] bg-gray-50">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">مدیریت تخفیف‌ها</h1>
          <button onClick={()=>setOpenCreate(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">+ تخفیف جدید</button>
        </div>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</div>}
        {loading ? <div>در حال بارگذاری...</div> : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {discounts.map(d => (
              <div key={d.id} className="relative group">
                <DiscountCard discount={d} onViewDetails={handleViewDetails} />
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition flex gap-2">
                  <button onClick={()=>del(d.id)} className="text-xs bg-red-600 text-white px-2 py-1 rounded">حذف</button>
                </div>
              </div>
            ))}
            {discounts.length===0 && <div className="text-sm text-gray-600">هیچ تخفیفی ثبت نشده.</div>}
          </div>
        )}
      </div>
      <DiscountCreateModal open={openCreate} onClose={()=>setOpenCreate(false)} onCreate={create} />
    </DashboardLayout>
  )
}
