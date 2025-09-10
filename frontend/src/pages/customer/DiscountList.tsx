import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Discount } from '../../types/discount';
import discountService from '../../services/discountService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Search, Tag, Calendar, Store } from 'lucide-react';

export const DiscountList: React.FC = () => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [filteredDiscounts, setFilteredDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
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

  // Filter discounts based on search term and category
  useEffect(() => {
    let filtered = discounts;
    
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(discount =>
        discount.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (discount.description && discount.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (discount.business_name && discount.business_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (selectedCategory !== '') {
      filtered = filtered.filter(discount =>
        discount.business_name && discount.business_name.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }
    
    setFilteredDiscounts(filtered);
  }, [searchTerm, selectedCategory, discounts]);

  // Get unique categories for filter
  const categories = Array.from(new Set(discounts.map(d => d.business_name).filter(Boolean)));

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
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">تخفیفات</h1>
        <p className="text-gray-600">از بهترین تخفیفات کسب‌وکارها استفاده کنید.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">تخفیفات موجود</p>
              <p className="text-2xl font-bold text-blue-600">{filteredDiscounts.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Tag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">کسب‌وکارها</p>
              <p className="text-2xl font-bold text-green-600">{categories.length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Store className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">بیشترین تخفیف</p>
              <p className="text-2xl font-bold text-purple-600">
                {Math.max(...discounts.map(d => d.percentage || 0))}%
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="جستجو در تخفیفات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full md:w-64">
            <select
              className="block w-full px-3 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">همه کسب‌وکارها</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-8">
          {error}
        </div>
      )}

      {/* Discounts List */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">تخفیفات موجود</h2>
        {filteredDiscounts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedCategory ? 'نتیجه‌ای یافت نشد' : 'تخفیفی موجود نیست'}
            </h3>
            <p className="text-gray-500">
              {searchTerm || selectedCategory ? 'فیلترهای خود را تغییر دهید.' : 'در حال حاضر تخفیف فعالی وجود ندارد.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredDiscounts.map((discount) => (
              <div key={discount.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Tag className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{discount.title}</h3>
                      <p className="text-sm text-gray-600">{discount.business_name}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="bg-red-100 text-red-800 text-lg font-bold px-3 py-2 rounded-lg">
                      {discount.percentage}%
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4">{discount.description || 'تخفیف ویژه برای شما'}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>کسب‌وکار: {discount.business_name}</span>
                  <span>اعتبار تا: {new Date(discount.end_date).toLocaleDateString('fa-IR')}</span>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800">ℹ️ برای استفاده از این تخفیف با کسب‌وکار تماس بگیرید</p>
                </div>
                
                <button 
                  onClick={() => handleViewDetails(discount.id)}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  مشاهده جزئیات
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
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
