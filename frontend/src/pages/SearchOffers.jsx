import React, { useState } from 'react';

// کامپوننت فیلتر
function FilterPanel({ filters, onFilterChange, onClearFilters }) {
  return (
    <div className="card-dark p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-100">فیلترها</h3>
        <button 
          onClick={onClearFilters}
          className="text-sm text-gray-500 hover:text-gray-300"
        >
          پاک کردن همه
        </button>
      </div>
      
      <div className="space-y-4">
        {/* دسته‌بندی */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">دسته‌بندی</label>
          <select
            value={filters.category}
            onChange={(e) => onFilterChange('category', e.target.value)}
            className="w-full border border-surface-300 bg-surface-100 text-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">همه دسته‌ها</option>
            <option value="food">رستوران و غذا</option>
            <option value="cafe">کافه و نوشیدنی</option>
            <option value="shopping">خرید و فروش</option>
            <option value="entertainment">سرگرمی</option>
            <option value="education">آموزش</option>
            <option value="beauty">زیبایی و بهداشت</option>
            <option value="sports">ورزش</option>
            <option value="automotive">خدمات خودرو</option>
            <option value="travel">مسافرت</option>
          </select>
        </div>

        {/* محدوده تخفیف */}
        <div>
      <label className="block text-sm font-medium mb-2 text-gray-300">محدوده تخفیف</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="حداقل %"
              value={filters.minDiscount}
              onChange={(e) => onFilterChange('minDiscount', e.target.value)}
        className="border border-surface-300 bg-surface-100 text-gray-200 rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="number"
              placeholder="حداکثر %"
              value={filters.maxDiscount}
              onChange={(e) => onFilterChange('maxDiscount', e.target.value)}
        className="border border-surface-300 bg-surface-100 text-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* امتیاز */}
        <div>
      <label className="block text-sm font-medium mb-2 text-gray-300">حداقل امتیاز</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => onFilterChange('minRating', star)}
        className={`p-1 ${filters.minRating >= star ? 'text-yellow-400' : 'text-gray-600'}`}
              >
                ⭐
              </button>
            ))}
          </div>
        </div>

        {/* موقعیت */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">موقعیت</label>
          <select
            value={filters.location}
            onChange={(e) => onFilterChange('location', e.target.value)}
            className="w-full border border-surface-300 bg-surface-100 text-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">همه مناطق</option>
            <option value="tehran">تهران</option>
            <option value="shiraz">شیراز</option>
            <option value="isfahan">اصفهان</option>
            <option value="mashhad">مشهد</option>
            <option value="tabriz">تبریز</option>
          </select>
        </div>

        {/* نوع تخفیف */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">نوع تخفیف</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-gray-300">
              <input
                type="checkbox"
                checked={filters.vipOnly}
                onChange={(e) => onFilterChange('vipOnly', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">فقط VIP</span>
            </label>
            <label className="flex items-center gap-2 text-gray-300">
              <input
                type="checkbox"
                checked={filters.specialOffers}
                onChange={(e) => onFilterChange('specialOffers', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">تخفیف‌های ویژه</span>
            </label>
            <label className="flex items-center gap-2 text-gray-300">
              <input
                type="checkbox"
                checked={filters.freeOffers}
                onChange={(e) => onFilterChange('freeOffers', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">خدمات رایگان</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

// کامپوننت کارت تخفیف
function OfferCard({ offer, onSave, isSaved }) {
  return (
    <div className="card-dark p-4 hover-card-dark transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="text-3xl">{offer.icon}</div>
        <div className="flex gap-2">
          {offer.isSpecial && (
            <span className="bg-yellow-500/20 text-yellow-300 text-xs px-2 py-1 rounded">ویژه</span>
          )}
          {offer.vipOnly && (
            <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded">VIP</span>
          )}
        </div>
      </div>
      
      <h4 className="font-medium text-sm mb-1 text-gray-100">{offer.title}</h4>
      <p className="text-gray-500 text-xs mb-2">{offer.category} • {offer.location}</p>
      
      <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
        <span>⭐</span>
        <span>{offer.rating}</span>
        <span>•</span>
        <span>{offer.reviewCount} نظر</span>
      </div>
      
      <div className="flex items-center justify-between mb-3">
        <div className="text-left">
          <span className="bg-green-500/15 text-green-400 text-sm px-2 py-1 rounded font-medium">
            {offer.discount}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          تا {offer.validUntil}
        </div>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => onSave(offer.id)}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isSaved ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30' : 'bg-surface-100 text-gray-300 hover:bg-surface-400'}`}
        >
          {isSaved ? '❤️ ذخیره شده' : '🤍 ذخیره'}
        </button>
        <button className="flex-1 bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-400">
          استفاده کنم
        </button>
      </div>
    </div>
  );
}

export default function SearchOffers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    minDiscount: '',
    maxDiscount: '',
    minRating: 0,
    location: '',
    vipOnly: false,
    specialOffers: false,
    freeOffers: false
  });
  const [sortBy, setSortBy] = useState('newest');
  const [savedOffers, setSavedOffers] = useState(new Set([1, 3]));

  // داده‌های نمونه
  const allOffers = [
    {
      id: 1,
      title: 'رستوران سنتی شیراز',
      category: 'رستوران و غذا',
      discount: '25% تخفیف',
      discountValue: 25,
      icon: '🍽️',
      location: 'تهران',
      rating: 4.8,
      reviewCount: 142,
      validUntil: '۱۴۰۳/۰۹/۳۰',
      vipOnly: false,
      isSpecial: true,
      isFree: false
    },
    {
      id: 2,
      title: 'کافه کتاب',
      category: 'کافه و نوشیدنی',
      discount: '15% تخفیف',
      discountValue: 15,
      icon: '☕',
      location: 'تهران',
      rating: 4.9,
      reviewCount: 89,
      validUntil: '۱۴۰۳/۱۰/۱۵',
      vipOnly: false,
      isSpecial: false,
      isFree: false
    },
    {
      id: 3,
      title: 'باشگاه ورزشی اکسیژن',
      category: 'ورزش',
      discount: '30% تخفیف',
      discountValue: 30,
      icon: '🏋️',
      location: 'تهران',
      rating: 4.7,
      reviewCount: 67,
      validUntil: '۱۴۰۳/۱۱/۳۰',
      vipOnly: true,
      isSpecial: false,
      isFree: false
    },
    {
      id: 4,
      title: 'مشاوره رایگان آموزشی',
      category: 'آموزش',
      discount: 'رایگان',
      discountValue: 100,
      icon: '📚',
      location: 'تهران',
      rating: 4.6,
      reviewCount: 234,
      validUntil: '۱۴۰۳/۰۹/۱۵',
      vipOnly: false,
      isSpecial: false,
      isFree: true
    },
    {
      id: 5,
      title: 'آرایشگاه زیبای من',
      category: 'زیبایی و بهداشت',
      discount: '20% تخفیف',
      discountValue: 20,
      icon: '💄',
      location: 'شیراز',
      rating: 4.5,
      reviewCount: 156,
      validUntil: '۱۴۰۳/۱۰/۳۰',
      vipOnly: false,
      isSpecial: true,
      isFree: false
    }
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      category: '',
      minDiscount: '',
      maxDiscount: '',
      minRating: 0,
      location: '',
      vipOnly: false,
      specialOffers: false,
      freeOffers: false
    });
  };

  const handleSaveOffer = (offerId) => {
    setSavedOffers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(offerId)) {
        newSet.delete(offerId);
      } else {
        newSet.add(offerId);
      }
      return newSet;
    });
  };

  // فیلتر کردن تخفیف‌ها
  const filteredOffers = allOffers.filter(offer => {
    // جستجو در عنوان
    if (searchQuery && !offer.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // دسته‌بندی
    if (filters.category && !offer.category.includes(filters.category)) {
      return false;
    }

    // محدوده تخفیف
    if (filters.minDiscount && offer.discountValue < parseInt(filters.minDiscount)) {
      return false;
    }
    if (filters.maxDiscount && offer.discountValue > parseInt(filters.maxDiscount)) {
      return false;
    }

    // امتیاز
    if (filters.minRating && offer.rating < filters.minRating) {
      return false;
    }

    // موقعیت
    if (filters.location && !offer.location.includes(filters.location)) {
      return false;
    }

    // فیلترهای ویژه
    if (filters.vipOnly && !offer.vipOnly) {
      return false;
    }
    if (filters.specialOffers && !offer.isSpecial) {
      return false;
    }
    if (filters.freeOffers && !offer.isFree) {
      return false;
    }

    return true;
  });

  // مرتب‌سازی
  const sortedOffers = [...filteredOffers].sort((a, b) => {
    switch (sortBy) {
      case 'discount': return b.discountValue - a.discountValue;
      case 'rating': return b.rating - a.rating;
      case 'newest': return b.id - a.id;
      default: return 0;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-100">جستجوی تخفیف‌ها</h1>
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در تخفیف‌ها..."
              className="w-full border border-surface-300 bg-surface-100 text-gray-200 rounded-lg px-4 py-3 pr-10 text-sm placeholder-gray-500"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</div>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-surface-300 bg-surface-100 text-gray-300 rounded-lg px-4 py-3 text-sm"
          >
            <option value="newest">جدیدترین</option>
            <option value="discount">بیشترین تخفیف</option>
            <option value="rating">بهترین امتیاز</option>
          </select>
        </div>
      </div>

      <div className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-gray-500">
                {sortedOffers.length} تخفیف یافت شد
              </div>
              <div className="flex gap-2">
                <button className="p-2 border border-surface-300 rounded-lg text-gray-400 hover:bg-surface-100">
                  ⊞
                </button>
                <button className="p-2 border border-surface-300 rounded-lg text-gray-200 hover:bg-surface-100 bg-brand-500/20 text-brand-300">
                  ⊟
                </button>
              </div>
            </div>

            {sortedOffers.length === 0 ? (
              <div className="text-center py-12 card-dark">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-100 mb-2">تخفیفی یافت نشد</h3>
                <p className="text-gray-500 text-sm">لطفاً فیلترهای خود را تغییر دهید</p>
                <button onClick={handleClearFilters} className="mt-4 bg-brand-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-400">پاک کردن فیلترها</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {sortedOffers.map((offer) => (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    onSave={handleSaveOffer}
                    isSaved={savedOffers.has(offer.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
