import React, { useState, useEffect } from 'react';
import { Discount, DiscountCreate } from '../../types/discount';
import discountService from '../../services/discountService';
import { CreateDiscountModal } from '../../components/discounts/CreateDiscountModal';
import { StarRating } from '../../components/ui/StarRating';
import { ProgressBar } from '../../components/ui/ProgressBar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { DashboardLayout } from '../../components/layout/DashboardLayout';

export const DiscountManagement: React.FC = () => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);

  useEffect(() => {
    loadDiscounts();
  }, []);

  const loadDiscounts = async () => {
    try {
      setLoading(true);
      const data = await discountService.getDiscounts();
      setDiscounts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiscount = async (discountData: DiscountCreate) => {
    await discountService.createDiscount(discountData);
    await loadDiscounts();
  };

  const handleDeleteDiscount = async (id: number) => {
    if (window.confirm('آیا از حذف این تخفیف اطمینان دارید؟')) {
      try {
        await discountService.deleteDiscount(id);
        await loadDiscounts();
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (discount: Discount) => {
    const now = new Date();
    const start = new Date(discount.start_date);
    const end = new Date(discount.end_date);

    if (now < start) {
      return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">آینده</span>;
    } else if (now > end) {
      return <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">منقضی</span>;
    } else {
      return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">فعال</span>;
    }
  };

  // Calculate stats from discounts
  const discountStats = {
    totalDiscounts: discounts.length,
    activeDiscounts: discounts.filter(d => {
      const now = new Date();
      const start = new Date(d.start_date);
      const end = new Date(d.end_date);
      return now >= start && now <= end;
    }).length,
    expiredDiscounts: discounts.filter(d => {
      const now = new Date();
      const end = new Date(d.end_date);
      return now > end;
    }).length,
    totalUsage: discounts.reduce((sum, d) => sum + (d.total_scores || 0), 0),
    averageRating: (() => {
      const totalVotes = discounts.reduce((sum, d) => sum + (d.total_scores || 0), 0);
      
      if (totalVotes > 0) {
        // مجموع کل امتیازات = میانگین × تعداد رای
        const totalRatingPoints = discounts.reduce((sum, d) => sum + (d.average_score * (d.total_scores || 0)), 0);
        // میانگین کل = مجموع کل امتیازات ÷ تعداد کل آرا
        return totalRatingPoints / totalVotes;
      } else {
        return 0;
      }
    })()
  };

  if (loading) return (
    <DashboardLayout>
      <LoadingSpinner />
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">مدیریت تخفیفات</h1>
              <p className="text-gray-600">تخفیف‌های خود را ایجاد و مدیریت کنید.</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              + ایجاد تخفیف جدید
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">کل تخفیف‌ها</p>
                  <p className="text-2xl font-bold text-blue-600">{discountStats.totalDiscounts}</p>
                </div>
                <div className="text-3xl">🎯</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">تخفیف‌های فعال</p>
                  <p className="text-2xl font-bold text-green-600">{discountStats.activeDiscounts}</p>
                </div>
                <div className="text-3xl">✅</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">استفاده شده</p>
                  <p className="text-2xl font-bold text-purple-600">{discountStats.totalUsage}</p>
                </div>
                <div className="text-3xl">📊</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">امتیاز میانگین</p>
                  <p className="text-2xl font-bold text-orange-600">{discountStats.averageRating.toFixed(1)}</p>
                </div>
                <div className="text-3xl">⭐</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">منقضی شده</p>
                  <p className="text-2xl font-bold text-red-600">{discountStats.expiredDiscounts}</p>
                </div>
                <div className="text-3xl">⏰</div>
              </div>
            </div>
          </div>

          {discounts.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">🎯</div>
              <div className="text-gray-500 text-lg mb-4">هنوز تخفیفی ایجاد نکرده‌اید</div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                ایجاد اولین تخفیف
              </button>
            </div>
          ) : (
            /* Active Discounts */
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">تخفیف‌های شما</h2>
                <div className="flex space-x-2 space-x-reverse">
                  <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                    فیلتر
                  </button>
                  <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                    مرتب‌سازی
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {discounts.map((discount) => (
                  <div key={discount.id} className="border border-gray-200 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 space-x-reverse mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{discount.title}</h3>
                          {getStatusBadge(discount)}
                        </div>
                        {discount.description && (
                          <p className="text-gray-600 mb-2">{discount.description}</p>
                        )}
                        <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-500">
                          <span>شروع: {formatDate(discount.start_date)}</span>
                          <span>•</span>
                          <span>پایان: {formatDate(discount.end_date)}</span>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            <StarRating rating={discount.average_score} size="sm" />
                            <span>({discount.total_scores} نظر)</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-left ml-6">
                        <div className="bg-green-100 text-green-800 text-xl font-bold px-4 py-2 rounded-lg mb-4">
                          {discount.percentage}%
                        </div>
                        <div className="flex space-x-2 space-x-reverse">
                          <button
                            onClick={() => setSelectedDiscount(discount)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            مشاهده
                          </button>
                          <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                            ویرایش
                          </button>
                          <button
                            onClick={() => handleDeleteDiscount(discount.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar for time remaining */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>زمان باقی‌مانده</span>
                        <span>{discount.time_remaining}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            discount.time_remaining > 50 ? 'bg-green-600' : 
                            discount.time_remaining > 20 ? 'bg-yellow-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${Math.max(discount.time_remaining, 0)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* جزئیات تخفیف */}
          {selectedDiscount && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div 
                className="fixed inset-0 bg-black bg-opacity-50"
                onClick={() => setSelectedDiscount(null)}
              />
              <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                  <h3 className="text-xl font-semibold">جزئیات تخفیف</h3>
                  <button
                    onClick={() => setSelectedDiscount(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="p-6 space-y-6">
                  <div>
                    <h4 className="text-lg font-medium mb-2">{selectedDiscount.title}</h4>
                    <p className="text-gray-600">{selectedDiscount.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">درصد تخفیف</label>
                      <div className="text-2xl font-bold text-green-600">{selectedDiscount.percentage}%</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">امتیاز میانگین</label>
                      <div className="flex items-center space-x-1">
                        <StarRating rating={selectedDiscount.average_score} />
                        <span className="text-sm text-gray-600">({selectedDiscount.total_scores} نظر)</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">زمان باقی‌مانده</label>
                    <ProgressBar 
                      percentage={selectedDiscount.time_remaining}
                      color={selectedDiscount.time_remaining > 50 ? 'green' : selectedDiscount.time_remaining > 20 ? 'yellow' : 'red'}
                    />
                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                      <span>شروع: {formatDate(selectedDiscount.start_date)}</span>
                      <span>پایان: {formatDate(selectedDiscount.end_date)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <CreateDiscountModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateDiscount}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};
