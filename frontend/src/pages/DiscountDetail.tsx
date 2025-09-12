import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import discountService from '../services/discountService'
import { DiscountCard } from '../components/discounts/DiscountCard'
import { StarRating } from '../components/discounts/StarRating'
import { DiscountReportModal } from '../components/discounts/DiscountReportModal'
import { Layout } from '../components/layout/Layout'

export const DiscountDetail: React.FC = () => {
	const { id } = useParams<{id:string}>()
	const [data,setData] = useState<any>(null)
	const [comments,setComments] = useState<any[]>([])
	const [loading,setLoading] = useState(true)
	const [rating,setRating] = useState<number>(0)
	const [newComment,setNewComment] = useState('')
	const [reportOpen,setReportOpen] = useState(false)
	const [error,setError] = useState<string|null>(null)

	const load = async () => {
		if(!id) return
		setLoading(true)
		setError(null)
		try {
			console.log('🔍 Loading discount with ID:', id)
			const d = await discountService.getDiscount(Number(id))
			console.log('✅ Discount loaded:', d)
			setData(d)
			setRating(d.user_score || 0)
			const cm = await discountService.getComments(Number(id))
			console.log('✅ Comments loaded:', cm)
			setComments(cm)
		} catch(e:any){ 
			console.error('❌ Error loading discount:', e)
			setError(e.message) 
		} finally { 
			setLoading(false) 
		}
	}
	useEffect(()=>{ load() },[id])

	const submitRating = async (val:number) => {
		if(!id) return
		try { await discountService.rateDiscount(Number(id), val); setRating(val); await load() } catch(e){ alert('خطا در ثبت امتیاز') }
	}

	const submitComment = async (e:React.FormEvent) => {
		e.preventDefault(); if(!id) return
		if(!newComment.trim()) return
		try { await discountService.addComment(Number(id), newComment); setNewComment(''); await load() } catch(e){ alert('خطا در ثبت نظر') }
	}

	const submitReport = async (reason:string) => {
		if(!id) return
		await discountService.reportDiscount(Number(id), reason)
	}

	return (
		<Layout>
			<div className="max-w-4xl mx-auto py-10 px-4 text-white">
				{loading && <div className="text-center py-8 text-white/80">در حال بارگذاری...</div>}
				{error && (
					<div className="bg-red-500/10 text-red-300 border border-red-500/20 p-4 rounded mb-4">
						<h2 className="font-bold mb-2">خطا در بارگذاری تخفیف</h2>
						<p>{error}</p>
					</div>
				)}
				{!loading && !error && !data && (
					<div className="text-center py-8">
						<h2 className="text-xl font-bold text-white/80">تخفیف یافت نشد</h2>
						<p className="text-white/60 mt-2">تخفیف مورد نظر شما وجود ندارد یا حذف شده است.</p>
					</div>
				)}
				{data && (
					<div className="space-y-6">
						<div className="flex justify-between items-center">
							<h1 className="text-2xl font-bold">{data.title}</h1>
							<button onClick={()=>setReportOpen(true)} className="text-xs bg-red-500/20 text-red-300 px-3 py-1 rounded border border-red-500/20">گزارش تخلف</button>
						</div>
						<DiscountCard discount={data} onViewDetails={() => {}} />
						<div className="bg-white/5 border border-white/10 p-4 rounded-xl shadow-soft space-y-4">
							<h2 className="font-semibold text-white">امتیاز شما</h2>
							<StarRating value={rating} onChange={submitRating} />
							<div className="text-sm text-white/70">میانگین: {data.avg_score?.toFixed(1) || '0.0'} / ({data.score_count || 0} رأی)</div>
						</div>
						<div className="bg-white/5 border border-white/10 p-4 rounded-xl shadow-soft space-y-4">
							<h2 className="font-semibold text-white">نظرات</h2>
							<form onSubmit={submitComment} className="flex gap-2">
								<input value={newComment} onChange={e=>setNewComment(e.target.value)} placeholder="نظر شما" className="flex-1 border border-white/10 bg-white/5 text-white placeholder-white/50 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/20" />
								<button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-sm px-4 rounded border border-white/10">ارسال</button>
							</form>
							<div className="space-y-3">
								{comments.map(c => (
									<div key={c.id} className="border border-white/10 bg-white/5 rounded p-3 text-sm">
										<div className="font-medium mb-1 text-white">{c.user?.username || 'کاربر'}</div>
										<p className="text-white/80 whitespace-pre-wrap">{c.comment}</p>
									</div>
								))}
								{comments.length===0 && <div className="text-xs text-white/60">نظری ثبت نشده.</div>}
							</div>
						</div>
					</div>
				)}
			</div>
			<DiscountReportModal open={reportOpen} onClose={()=>setReportOpen(false)} onSubmit={submitReport} />
		</Layout>
	)
}

export default DiscountDetail
