import React, { useState, useEffect } from 'react';
import { Discount, DiscountCreate } from '../../types/discount';
import discountService from '../../services/discountService';
import { CreateDiscountModal } from '../../components/discounts/CreateDiscountModal';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [discountToDelete, setDiscountToDelete] = useState<Discount | null>(null);

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

  const handleDeleteDiscount = (discount: Discount) => {
    setDiscountToDelete(discount);
    setShowDeleteModal(true);
  };

  const confirmDeleteDiscount = async () => {
    if (!discountToDelete) return;
    
    try {
      await discountService.deleteDiscount(discountToDelete.id);
      await loadDiscounts();
      setShowDeleteModal(false);
      setDiscountToDelete(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const cancelDeleteDiscount = () => {
    setShowDeleteModal(false);
    setDiscountToDelete(null);
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
  <div className="min-h-[calc(100vh-4rem)] p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
      <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">مدیریت تخفیفات</h1>
        <p className="text-white/70 text-sm sm:text-base">تخفیف‌های خود را ایجاد و مدیریت کنید.</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium hover:from-purple-500 hover:to-blue-500 transition-colors border border-white/10 shadow-soft text-sm sm:text-base w-full sm:w-auto"
              >
                + ایجاد تخفیف جدید
              </button>
            </div>
          </div>

          {error && (
    <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-lg mb-4 sm:mb-6 text-sm sm:text-base">
              {error}
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
    <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-2 sm:mb-0">
      <p className="text-xs sm:text-sm text-white/70">کل تخفیف‌ها</p>
      <p className="text-lg sm:text-2xl font-bold text-lavender">{discountStats.totalDiscounts}</p>
                </div>
                <div className="text-xl sm:text-3xl self-end sm:self-auto">🎯</div>
              </div>
            </div>

    <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-2 sm:mb-0">
      <p className="text-xs sm:text-sm text-white/70">تخفیف‌های فعال</p>
      <p className="text-lg sm:text-2xl font-bold text-mint">{discountStats.activeDiscounts}</p>
                </div>
                <div className="text-xl sm:text-3xl self-end sm:self-auto">✅</div>
              </div>
            </div>

    <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-2 sm:mb-0">
      <p className="text-xs sm:text-sm text-white/70">استفاده شده</p>
      <p className="text-lg sm:text-2xl font-bold text-lilac">{discountStats.totalUsage}</p>
                </div>
                <div className="text-xl sm:text-3xl self-end sm:self-auto">📊</div>
              </div>
            </div>

    <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-2 sm:mb-0">
      <p className="text-xs sm:text-sm text-white/70">امتیاز میانگین</p>
      <p className="text-lg sm:text-2xl font-bold text-limeSoft">{discountStats.averageRating.toFixed(1)}</p>
                </div>
                <div className="text-xl sm:text-3xl self-end sm:self-auto">⭐</div>
              </div>
            </div>

    <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white col-span-2 sm:col-span-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-2 sm:mb-0">
      <p className="text-xs sm:text-sm text-white/70">منقضی شده</p>
      <p className="text-lg sm:text-2xl font-bold text-red-300">{discountStats.expiredDiscounts}</p>
                </div>
                <div className="text-xl sm:text-3xl self-end sm:self-auto">⏰</div>
              </div>
            </div>
          </div>

          {discounts.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl shadow-soft p-8 sm:p-12 text-center text-white">
              <div className="text-4xl sm:text-6xl mb-4">🎯</div>
              <div className="text-white/70 text-base sm:text-lg mb-4">هنوز تخفیفی ایجاد نکرده‌اید</div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-colors border border-white/10 w-full sm:w-auto"
              >
                ایجاد اولین تخفیف
              </button>
            </div>
          ) : (
            /* Active Discounts */
            <div className="bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl shadow-soft p-4 sm:p-6 text-white">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
                <h2 className="text-lg sm:text-xl font-bold text-white">تخفیف‌های شما</h2>
                <div className="flex gap-2 sm:space-x-2 sm:space-x-reverse">
                  <button className="flex-1 sm:flex-none px-3 py-2 text-xs sm:text-sm border border-white/10 rounded-lg hover:bg-white/5">
                    فیلتر
                  </button>
                  <button className="flex-1 sm:flex-none px-3 py-2 text-xs sm:text-sm border border-white/10 rounded-lg hover:bg-white/5">
                    مرتب‌سازی
                  </button>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {discounts.map((discount) => (
                  <div key={discount.id} className="border border-white/10 bg-white/5 rounded-lg sm:rounded-xl p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                          <h3 className="text-base sm:text-lg font-semibold text-white">{discount.title}</h3>
                          {getStatusBadge(discount)}
                        </div>
                        {discount.description && (
                          <p className="text-white/70 mb-3 text-sm sm:text-base">{discount.description}</p>
                        )}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-white/60">
                          <span>شروع: {formatDate(discount.start_date)}</span>
                          <span className="hidden sm:inline">•</span>
                          <span>پایان: {formatDate(discount.end_date)}</span>
                          <span className="hidden sm:inline">•</span>
                          <div className="flex items-center gap-1">
                            <StarRating rating={discount.average_score} size="sm" />
                            <span>({discount.total_scores} نظر)</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-0">
                        <div className="bg-green-500/20 text-green-300 text-lg sm:text-xl font-bold px-3 py-2 sm:px-4 rounded-lg mb-0 sm:mb-4">
                          {discount.percentage}%
                        </div>
                        <div className="flex gap-2 sm:gap-1 sm:flex-col lg:flex-row lg:gap-2">
                          <button
                            onClick={() => setSelectedDiscount(discount)}
                            className="text-lavender hover:text-white text-xs sm:text-sm font-medium px-2 py-1"
                          >
                            مشاهده
                          </button>
                          <button className="text-white/70 hover:text-white text-xs sm:text-sm font-medium px-2 py-1">
                            ویرایش
                          </button>
                          <button
                            onClick={() => handleDeleteDiscount(discount)}
                            className="text-red-300 hover:text-red-400 text-xs sm:text-sm font-medium px-2 py-1"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar for time remaining */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs sm:text-sm text-white/70 mb-1">
                        <span>زمان باقی‌مانده</span>
                        <span>{discount.time_remaining}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
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
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setSelectedDiscount(null)}
              />
              <div className="relative bg-night-900/70 border border-white/10 text-white rounded-2xl shadow-glass w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <h3 className="text-xl font-semibold">جزئیات تخفیف</h3>
                  <button
                    onClick={() => setSelectedDiscount(null)}
                    className="text-white/60 hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="p-6 space-y-6">
                  <div>
                    <h4 className="text-lg font-medium mb-2 text-white">{selectedDiscount.title}</h4>
                    <p className="text-white/70">{selectedDiscount.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/70">درصد تخفیف</label>
                      <div className="text-2xl font-bold text-green-300">{selectedDiscount.percentage}%</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70">امتیاز میانگین</label>
                      <div className="flex items-center space-x-1">
                        <StarRating rating={selectedDiscount.average_score} />
                        <span className="text-sm text-white/60">({selectedDiscount.total_scores} نظر)</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">زمان باقی‌مانده</label>
                    <ProgressBar 
                      percentage={selectedDiscount.time_remaining}
                      color={selectedDiscount.time_remaining > 50 ? 'green' : selectedDiscount.time_remaining > 20 ? 'yellow' : 'red'}
                    />
                    <div className="flex justify-between text-sm text-white/60 mt-1">
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

          <ConfirmationModal
            isOpen={showDeleteModal}
            onClose={cancelDeleteDiscount}
            onConfirm={confirmDeleteDiscount}
            title="حذف تخفیف"
            message={`آیا از حذف تخفیف "${discountToDelete?.title}" اطمینان دارید؟ این عمل قابل بازگشت نیست.`}
            confirmText="حذف کردن"
            cancelText="انصراف"
            type="danger"
          />
        </div>
      </div>
    </DashboardLayout>
  );
};
