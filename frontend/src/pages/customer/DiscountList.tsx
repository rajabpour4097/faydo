import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Discount } from '../../types/discount';
import discountService from '../../services/discountService';
import { DiscountCard } from '../../components/discounts/DiscountCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { DashboardLayout } from '../../components/layout/DashboardLayout';

export const DiscountList: React.FC = () => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  
  // تشخیص اینکه آیا در dashboard هستیم یا نه
  const isDashboard = location.pathname.startsWith('/dashboard');

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

  const handleViewDetails = (discountId: number) => {
    if (isDashboard) {
      navigate(`/dashboard/customer/discounts/${discountId}`);
    } else {
      navigate(`/discounts/${discountId}`);
    }
  };

  if (loading) {
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

  const content = (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">تخفیفات ویژه</h1>
        <p className="text-gray-600 text-sm lg:text-base">از بهترین تخفیفات کسب‌وکارها استفاده کنید</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {discounts.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m8-4v2m0 4h.01" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">تخفیفی موجود نیست</h3>
          <p className="mt-1 text-sm text-gray-500">در حال حاضر تخفیف فعالی وجود ندارد.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {discounts.map((discount) => (
            <DiscountCard
              key={discount.id}
              discount={discount}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}
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
