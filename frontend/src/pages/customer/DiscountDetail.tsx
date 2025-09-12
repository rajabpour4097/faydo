import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Discount, DiscountComment } from '../../types/discount';
import discountService from '../../services/discountService';
import { StarRating } from '../../components/ui/StarRating';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { ReportDiscountModal } from '../../components/discounts/ReportDiscountModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import { DashboardLayout } from '../../components/layout/DashboardLayout';

export const DiscountDetail: React.FC = () => {
  console.log('=== DiscountDetail component mounted ===');
  
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');
  
  console.log('Component params:', { id, pathname: location.pathname, isDashboard });
  
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [comments, setComments] = useState<DiscountComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [likingComment, setLikingComment] = useState<number | null>(null);

  console.log('=== DiscountDetail component mounted ===');

  useEffect(() => {
    console.log('=== useEffect called ===');
    console.log('ID from useParams:', id);
    if (id) {
      console.log('ID exists, calling loadDiscountDetails');
      loadDiscountDetails();
    } else {
      console.log('No ID found in params');
    }
  }, [id]);

  const loadDiscountDetails = async () => {
    try {
      console.log('=== loadDiscountDetails called ===');
      console.log('ID parameter:', id);
      console.log('Number(id):', Number(id));
      
      setLoading(true);
      setError('');
      
      console.log('Calling discountService.getDiscount...');
      const discountData = await discountService.getDiscount(Number(id));
      console.log('Discount data received:', discountData);
      
      // Set discount data first, regardless of comments
      setDiscount(discountData);
      setUserRating(discountData.user_score || 0);
      
      // Try to get comments, but don't fail if it doesn't work
      try {
        console.log('Calling discountService.getComments...');
        const commentsData = await discountService.getComments(Number(id));
        console.log('Comments data received:', commentsData);
        setComments(commentsData);
      } catch (commentsErr: any) {
        console.warn('Failed to load comments:', commentsErr);
        setComments([]); // Set empty array if comments fail
      }
      
      console.log('Discount data loaded successfully');
    } catch (err: any) {
      console.error('Error in loadDiscountDetails:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      console.log('Loading set to false');
    }
  };

  const handleRating = async (rating: number) => {
    try {
      await discountService.rateDiscount(Number(id), rating);
      setUserRating(rating);
      // بارگذاری مجدد اطلاعات برای بروزرسانی میانگین امتیاز
      await loadDiscountDetails();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      await discountService.addComment(Number(id), newComment);
      setNewComment('');
      await loadDiscountDetails();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReport = async (reason: string) => {
    await discountService.reportDiscount(Number(id), reason);
  };

  const handleLikeComment = async (commentId: number) => {
    try {
      setLikingComment(commentId);
      const result = await discountService.likeComment(commentId);
      
      // به‌روزرسانی state کامنت‌ها
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { 
              ...comment, 
              likes_count: result.likes_count,
              user_liked: result.liked 
            }
          : comment
      ));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLikingComment(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getProgressColor = (percentage: number) => {
    if (percentage > 50) return 'green';
    if (percentage > 20) return 'yellow';
    return 'red';
  };

  console.log('=== Render cycle ===');
  console.log('Current state:', { discount, loading, error, id });
  
  // Test component is working
  console.log('DiscountDetail component is rendering correctly');

  if (loading) {
    console.log('Rendering loading state');
    return isDashboard ? (
      <DashboardLayout>
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            <LoadingSpinner />
          </div>
        </div>
      </DashboardLayout>
    ) : (
      <LoadingSpinner />
    );
  }
  
  if (!discount) {
    console.log('Rendering not found state. Discount value:', discount);
    console.log('Error value:', error);
    return isDashboard ? (
      <DashboardLayout>
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12 text-gray-500">تخفیف یافت نشد</div>
          </div>
        </div>
      </DashboardLayout>
    ) : (
      <div className="text-center py-12 text-gray-500">تخفیف یافت نشد</div>
    );
  }

  const content = (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* هدر */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>بازگشت</span>
        </button>

        <button
          onClick={() => setShowReportModal(true)}
          className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
        >
          گزارش تخلف
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* اطلاعات اصلی تخفیف */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{discount.title}</h1>
            <p className="text-gray-600 text-lg">{discount.business_name}</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-green-600 mb-2">{discount.percentage}%</div>
            <div className="text-sm text-gray-500">تخفیف</div>
          </div>
        </div>

        {discount.description && (
          <div className="mb-6">
            <p className="text-gray-700 leading-relaxed">{discount.description}</p>
          </div>
        )}

        {/* زمان‌بندی */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">مدت زمان تخفیف</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>شروع: {formatDate(discount.start_date)}</span>
              <span>پایان: {formatDate(discount.end_date)}</span>
            </div>
            <ProgressBar
              percentage={discount.time_remaining}
              color={getProgressColor(discount.time_remaining)}
            />
            <p className="text-xs text-gray-500">
              {discount.time_remaining > 0 ? `${Math.round(discount.time_remaining)}% زمان باقی‌مانده` : 'منقضی شده'}
            </p>
          </div>
        </div>

        {/* امتیازدهی */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">امتیازدهی</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <StarRating rating={discount.average_score} size="lg" />
                <div>
                  <div className="text-xl font-bold text-gray-900">{discount.average_score}</div>
                  <div className="text-sm text-gray-500">از {discount.total_scores} نظر</div>
                </div>
              </div>
            </div>
            
            {discount.can_comment && (
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-2">امتیاز شما:</p>
                <StarRating
                  rating={userRating}
                  interactive={true}
                  onRate={handleRating}
                  size="lg"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* نظرات */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">نظرات کاربران</h3>

        {/* فرم ثبت نظر جدید */}
        {discount.can_comment && !discount.user_comment && (
          <form onSubmit={handleAddComment} className="mb-8">
            <div className="mb-4">
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                نظر شما:
              </label>
              <textarea
                id="comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="نظر خود را در مورد این تخفیف بنویسید..."
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50"
            >
              {submitting ? 'در حال ارسال...' : 'ثبت نظر'}
            </button>
          </form>
        )}

        {/* نمایش نظر کاربر فعلی */}
        {discount.user_comment && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <h4 className="font-medium text-blue-900 mb-2">نظر شما:</h4>
            <p className="text-blue-800">{discount.user_comment}</p>
          </div>
        )}

        {/* لیست نظرات */}
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            هنوز نظری ثبت نشده است
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {comment.user_avatar ? (
                      <img
                        src={comment.user_avatar}
                        alt={comment.user_name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {comment.user_name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">{comment.user_name}</h4>
                        <span className="text-sm text-gray-500">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      
                      {/* دکمه لایک */}
                      {comment.can_like && (
                        <button
                          onClick={() => handleLikeComment(comment.id)}
                          disabled={likingComment === comment.id}
                          className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors ${
                            comment.user_liked
                              ? 'bg-red-100 text-red-600 hover:bg-red-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          } ${likingComment === comment.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <svg
                            className={`w-4 h-4 ${comment.user_liked ? 'fill-current' : 'stroke-current'}`}
                            viewBox="0 0 24 24"
                            fill={comment.user_liked ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                          <span>{comment.likes_count}</span>
                        </button>
                      )}
                      
                      {/* نمایش تعداد لایک برای business */}
                      {!comment.can_like && comment.likes_count > 0 && (
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <svg className="w-4 h-4 fill-current text-red-500" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                          <span>{comment.likes_count}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-700 leading-relaxed">{comment.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* مودال گزارش */}
      <ReportDiscountModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReport}
        discountTitle={discount.title}
      />
    </div>
  );

  return isDashboard ? (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          {content}
        </div>
      </div>
    </DashboardLayout>
  ) : content;
};
