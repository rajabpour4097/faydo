import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { discountService } from '../services/discountService'
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
		try {
			const d = await discountService.get(Number(id))
			setData(d)
			setRating(d.user_score || 0)
			const cm = await discountService.comments(Number(id))
			setComments(cm)
		} catch(e:any){ setError(e.message) } finally { setLoading(false) }
	}
	useEffect(()=>{ load() },[id])

	const submitRating = async (val:number) => {
		if(!id) return
		try { await discountService.rate(Number(id), val); setRating(val); await load() } catch(e){ alert('خطا در ثبت امتیاز') }
	}

	const submitComment = async (e:React.FormEvent) => {
		e.preventDefault(); if(!id) return
		if(!newComment.trim()) return
		try { await discountService.addComment(Number(id), newComment); setNewComment(''); await load() } catch(e){ alert('خطا در ثبت نظر') }
	}

	const submitReport = async (reason:string) => {
		if(!id) return
		await discountService.report(Number(id), reason)
	}

	return (
		<Layout>
			<div className="max-w-4xl mx-auto py-10 px-4">
				{loading && <div>در حال بارگذاری...</div>}
				{error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</div>}
				{data && (
					<div className="space-y-6">
						<div className="flex justify-between items-center">
							<h1 className="text-2xl font-bold">{data.title}</h1>
							<button onClick={()=>setReportOpen(true)} className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded">گزارش تخلف</button>
						</div>
						<DiscountCard data={data} />
						<div className="bg-white p-4 rounded-xl shadow space-y-4">
							<h2 className="font-semibold">امتیاز شما</h2>
							<StarRating value={rating} onChange={submitRating} />
							<div className="text-sm text-gray-600">میانگین: {data.avg_score?.toFixed(1) || '0.0'} / ({data.score_count || 0} رأی)</div>
						</div>
						<div className="bg-white p-4 rounded-xl shadow space-y-4">
							<h2 className="font-semibold">نظرات</h2>
							<form onSubmit={submitComment} className="flex gap-2">
								<input value={newComment} onChange={e=>setNewComment(e.target.value)} placeholder="نظر شما" className="flex-1 border rounded p-2 text-sm" />
								<button className="bg-blue-600 text-white text-sm px-4 rounded">ارسال</button>
							</form>
							<div className="space-y-3">
								{comments.map(c => (
									<div key={c.id} className="border rounded p-3 text-sm">
										<div className="font-medium mb-1">{c.user?.username || 'کاربر'}</div>
										<p className="text-gray-700 whitespace-pre-wrap">{c.comment}</p>
									</div>
								))}
								{comments.length===0 && <div className="text-xs text-gray-500">نظری ثبت نشده.</div>}
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
