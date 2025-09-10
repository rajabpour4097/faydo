import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Discount } from '../../types/discount';
import discountService from '../../services/discountService';
import { DiscountCard } from '../../components/discounts/DiscountCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { DashboardLayout } from '../../components/layout/DashboardLayout';

export const DiscountList: React.FC = () => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [filteredDiscounts, setFilteredDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
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
      setFilteredDiscounts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter discounts based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredDiscounts(discounts);
    } else {
      const filtered = discounts.filter(discount =>
        discount.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (discount.description && discount.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (discount.business_name && discount.business_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredDiscounts(filtered);
    }
  }, [searchTerm, discounts]);

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

      {/* Search Bar */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="جستجو در تخفیفات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {filteredDiscounts.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m8-4v2m0 4h.01" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm ? 'نتیجه‌ای یافت نشد' : 'تخفیفی موجود نیست'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'برای عبارت جستجو شده تخفیفی یافت نشد.' : 'در حال حاضر تخفیف فعالی وجود ندارد.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 text-center">
            {searchTerm && `${filteredDiscounts.length} تخفیف یافت شد`}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {filteredDiscounts.map((discount) => (
              <DiscountCard
                key={discount.id}
                discount={discount}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
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
