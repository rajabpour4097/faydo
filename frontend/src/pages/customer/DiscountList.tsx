import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Discount } from '../../types/discount';
import discountService from '../../services/discountService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Search, Tag, Store, Star } from 'lucide-react';

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
        <div className="min-h-[calc(100vh-4rem)] dashboard-bg p-4 lg:p-6">
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
        <h1 className={`text-3xl font-bold mb-2 ${isDashboard ? 'text-white' : 'text-gray-900'}`}>تخفیفات</h1>
        <p className={`${isDashboard ? 'text-white/60' : 'text-gray-600'}`}>از بهترین تخفیفات کسب‌وکارها استفاده کنید.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={`${isDashboard ? 'rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-lg shadow-black/20' : 'bg-white rounded-2xl shadow-lg p-6'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDashboard ? 'text-white/60' : 'text-gray-600'}`}>تخفیفات موجود</p>
              <p className={`text-2xl font-bold ${isDashboard ? 'text-blue-400' : 'text-blue-600'}`}>{filteredDiscounts.length}</p>
            </div>
            <div className={`p-3 rounded-full ${isDashboard ? 'bg-blue-500/10' : 'bg-blue-100'}`}>
              <Tag className={`w-6 h-6 ${isDashboard ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
          </div>
        </div>

        <div className={`${isDashboard ? 'rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-lg shadow-black/20' : 'bg-white rounded-2xl shadow-lg p-6'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDashboard ? 'text-white/60' : 'text-gray-600'}`}>کسب‌وکارها</p>
              <p className={`text-2xl font-bold ${isDashboard ? 'text-emerald-400' : 'text-green-600'}`}>{categories.length}</p>
            </div>
            <div className={`p-3 rounded-full ${isDashboard ? 'bg-emerald-500/10' : 'bg-green-100'}`}>
              <Store className={`w-6 h-6 ${isDashboard ? 'text-emerald-400' : 'text-green-600'}`} />
            </div>
          </div>
        </div>

        <div className={`${isDashboard ? 'rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-lg shadow-black/20' : 'bg-white rounded-2xl shadow-lg p-6'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDashboard ? 'text-white/60' : 'text-gray-600'}`}>میانگین امتیاز</p>
              <p className={`text-2xl font-bold ${isDashboard ? 'text-purple-400' : 'text-purple-600'}`}>
                {(() => {
                  const totalVotes = discounts.reduce((sum, d) => sum + (d.total_scores || 0), 0);
                  
                  if (totalVotes > 0) {
                    // مجموع کل امتیازات = میانگین × تعداد رای  
                    const totalRatingPoints = discounts.reduce((sum, d) => sum + (d.average_score * (d.total_scores || 0)), 0);
                    // میانگین کل = مجموع کل امتیازات ÷ تعداد کل آرا
                    return (totalRatingPoints / totalVotes).toFixed(1);
                  } else {
                    return '0.0';
                  }
                })()}
              </p>
              <p className={`text-xs ${isDashboard ? 'text-white/50' : 'text-gray-500'}`}>
                از {discounts.reduce((sum, d) => sum + (d.total_scores || 0), 0)} رای
              </p>
            </div>
            <div className={`p-3 rounded-full ${isDashboard ? 'bg-purple-500/10' : 'bg-purple-100'}`}>
              <Star className={`w-6 h-6 ${isDashboard ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className={`${isDashboard ? 'rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-lg shadow-black/20' : 'bg-white rounded-2xl shadow-lg p-6'} mb-8`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className={`h-5 w-5 ${isDashboard ? 'text-white/50' : 'text-gray-400'}`} />
              </div>
              <input
                type="text"
                className={`block w-full pl-10 pr-3 py-3 rounded-lg leading-5 focus:outline-none focus:ring-2 ${
                  isDashboard
                    ? 'border border-white/10 bg-white/10 text-white placeholder-white/60 focus:placeholder-white/50 focus:ring-violet-400 focus:border-violet-400'
                    : 'border border-gray-300 bg-white placeholder-gray-500 focus:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="جستجو در تخفیفات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full md:w-64">
            <select
              className={`block w-full px-3 py-3 rounded-lg focus:outline-none focus:ring-2 ${
                isDashboard
                  ? 'border border-white/10 bg-white/10 text-white placeholder-white/60 focus:ring-violet-400 focus:border-violet-400'
                  : 'border border-gray-300 bg-white focus:ring-blue-500 focus:border-blue-500'
              }`}
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
        <div className={`${isDashboard ? 'bg-red-500/10 border border-red-500/30 text-red-200' : 'bg-red-50 border border-red-200 text-red-700'} px-4 py-3 rounded-md mb-8`}>
          {error}
        </div>
      )}

      {/* Discounts List */}
      <div className={`${isDashboard ? 'rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-lg shadow-black/20' : 'bg-white rounded-2xl shadow-lg p-6'}`}>
        <h2 className={`text-xl font-bold mb-6 ${isDashboard ? 'text-white' : 'text-gray-900'}`}>تخفیفات موجود</h2>
        {filteredDiscounts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className={`text-lg font-medium mb-2 ${isDashboard ? 'text-white' : 'text-gray-900'}`}>
              {searchTerm || selectedCategory ? 'نتیجه‌ای یافت نشد' : 'تخفیفی موجود نیست'}
            </h3>
            <p className={`${isDashboard ? 'text-white/60' : 'text-gray-500'}`}>
              {searchTerm || selectedCategory ? 'فیلترهای خود را تغییر دهید.' : 'در حال حاضر تخفیف فعالی وجود ندارد.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredDiscounts.map((discount) => (
              <div key={discount.id} className={`rounded-xl p-6 transition-all ${isDashboard ? 'border border-white/10 hover:border-white/20 bg-white/5 backdrop-blur shadow-sm shadow-black/10' : 'border border-gray-200 hover:shadow-md bg-white'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className={`p-3 rounded-full ${isDashboard ? 'bg-blue-500/10' : 'bg-blue-100'}`}>
                      <Tag className={`w-6 h-6 ${isDashboard ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${isDashboard ? 'text-white' : 'text-gray-900'}`}>{discount.title}</h3>
                      <p className={`text-sm ${isDashboard ? 'text-white/60' : 'text-gray-600'}`}>{discount.business_name}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className={`${isDashboard ? 'bg-red-500/15 text-red-300 border border-red-400/20' : 'bg-red-100 text-red-800'} text-lg font-bold px-3 py-2 rounded-lg`}>
                      {discount.percentage}%
                    </span>
                  </div>
                </div>
                
                <p className={`${isDashboard ? 'text-white/80' : 'text-gray-700'} mb-4`}>{discount.description || 'تخفیف ویژه برای شما'}</p>
                
                <div className={`flex items-center justify-between text-sm mb-4 ${isDashboard ? 'text-white/60' : 'text-gray-500'}`}>
                  <div className="flex items-center gap-4">
                    <span>کسب‌وکار: {discount.business_name}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span>{discount.average_score ? discount.average_score.toFixed(1) : '0.0'}</span>
                      <span className={`${isDashboard ? 'text-white/40' : 'text-gray-400'}`}>({discount.total_scores || 0} رای)</span>
                    </div>
                  </div>
                  <span>اعتبار تا: {new Date(discount.end_date).toLocaleDateString('fa-IR')}</span>
                </div>
                

                <button 
                  onClick={() => handleViewDetails(discount.id)}
                  className={`w-full text-white py-3 px-4 rounded-lg font-medium transition-colors ${isDashboard ? 'bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-400 hover:to-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
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
      <div className="min-h-[calc(100vh-4rem)] dashboard-bg p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          {content}
        </div>
      </div>
    </DashboardLayout>
  ) : content;
};
