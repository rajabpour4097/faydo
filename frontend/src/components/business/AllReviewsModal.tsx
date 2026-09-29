import React from 'react'
import { formatRelativeShamsi } from '../../utils/shamsiDate'

export interface ReviewReply {
  id: number
  business_name: string
  content: string
  likes_count: number
  is_liked: boolean
  created_at: string
}

export interface ReviewItem {
  id: number
  user_name: string
  content: string
  likes_count: number
  is_liked: boolean
  created_at: string
  category?: string
  reply?: ReviewReply | null
}

export function ReviewReplyBlock({
  reply,
  onLike,
  compact = false,
}: {
  reply: ReviewReply
  onLike: () => void
  compact?: boolean
}) {
  return (
    <div className={`mt-2 rounded-xl border-r-2 border-[#7C5CFC]/50 bg-[#F6F3FF] dark:bg-slate-800/80 ${compact ? 'px-2 py-1.5' : 'px-3 py-2'}`}>
      <div className={`font-bold text-[#7C5CFC] ${compact ? 'text-[10px]' : 'text-xs'}`}>
        پاسخ {reply.business_name}
      </div>
      <p className={`text-gray-600 dark:text-slate-300 leading-relaxed ${compact ? 'text-[11px] line-clamp-2 mt-0.5' : 'text-sm mt-1'}`}>
        {reply.content}
      </p>
      <button
        type="button"
        onClick={onLike}
        className={`mt-1 flex items-center gap-1 ${compact ? 'text-[10px]' : 'text-xs'} ${reply.is_liked ? 'text-red-500' : 'text-gray-400'}`}
      >
        <svg className={compact ? 'w-3 h-3' : 'w-4 h-4'} fill={reply.is_liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        {reply.likes_count}
      </button>
    </div>
  )
}

interface AllReviewsModalProps {
  reviews: ReviewItem[]
  totalCount?: number
  onClose: () => void
  onLike: (id: number) => void
  onLikeReply?: (commentId: number) => void
}

export const AllReviewsModal: React.FC<AllReviewsModalProps> = ({
  reviews,
  totalCount,
  onClose,
  onLike,
  onLikeReply,
}) => {
  return (
    <div className="fixed inset-0 z-[1100] bg-black/50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-800 w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-700">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            نظرات کاربران {totalCount != null ? `(${totalCount})` : ''}
          </h3>
          <button type="button" onClick={onClose} className="text-gray-500 text-xl leading-none">✕</button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-3">
          {reviews.length === 0 ? (
            <p className="text-center text-gray-500 py-8 text-sm">هنوز نظری ثبت نشده است.</p>
          ) : (
            reviews.map(review => (
              <div key={review.id} className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">{review.user_name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {review.user_name}
                      </span>
                      <span className="text-[10px] text-gray-400 shrink-0">
                        {formatRelativeShamsi(review.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed mb-2">
                      {review.content}
                    </p>
                    <button
                      type="button"
                      onClick={() => onLike(review.id)}
                      className={`flex items-center gap-1 text-xs ${review.is_liked ? 'text-red-500' : 'text-gray-400'}`}
                    >
                      <svg className="w-4 h-4" fill={review.is_liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {review.likes_count}
                    </button>
                    {review.reply && onLikeReply && (
                      <ReviewReplyBlock reply={review.reply} onLike={() => onLikeReply(review.id)} />
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
