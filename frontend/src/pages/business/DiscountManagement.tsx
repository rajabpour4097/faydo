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

  if (loading) return (
    <DashboardLayout>
      <LoadingSpinner />
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">مدیریت تخفیفات</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          ایجاد تخفیف جدید
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {discounts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">هنوز تخفیفی ایجاد نکرده‌اید</div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
          >
            ایجاد اولین تخفیف
          </button>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تخفیف
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    درصد
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    وضعیت
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    امتیاز
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاریخ پایان
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {discounts.map((discount) => (
                  <tr key={discount.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{discount.title}</div>
                        {discount.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {discount.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-bold text-green-600">{discount.percentage}%</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(discount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <StarRating rating={discount.average_score} size="sm" />
                        <span className="text-sm text-gray-600">
                          ({discount.total_scores})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(discount.end_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedDiscount(discount)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          نمایش
                        </button>
                        <button
                          onClick={() => handleDeleteDiscount(discount.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
      </div>
    </DashboardLayout>
  );
};
