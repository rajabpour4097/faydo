import React from 'react'

export interface ReviewItem {
  id: number
  user_name: string
  content: string
  likes_count: number
  is_liked: boolean
  created_at: string
  category?: string
}

interface AllReviewsModalProps {
  reviews: ReviewItem[]
  totalCount?: number
  onClose: () => void
  onLike: (id: number) => void
}

function formatRelativeDate(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'امروز'
  if (days === 1) return 'دیروز'
  return `${days} روز پیش`
}

export const AllReviewsModal: React.FC<AllReviewsModalProps> = ({
  reviews,
  totalCount,
  onClose,
  onLike,
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
                        {formatRelativeDate(review.created_at)}
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
