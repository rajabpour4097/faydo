import React, { useState } from 'react';

function CreateOfferModal({ isOpen, onClose, onSave }) {
  const [offerData, setOfferData] = useState({
    title: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    category: '',
    validUntil: '',
    maxUsage: '',
    vipOnly: false,
    isSpecial: false
  });

  const categories = [
    'رستوران و غذا',
    'کافه و نوشیدنی', 
    'خرید و فروش',
    'سرگرمی و تفریح',
    'آموزش',
    'بهداشت و زیبایی',
    'ورزش و تناسب اندام',
    'خدمات خودرو',
    'مسافرت و گردشگری'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(offerData);
    setOfferData({
      title: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      category: '',
      validUntil: '',
      maxUsage: '',
      vipOnly: false,
      isSpecial: false
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="card-dark max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-100">ایجاد تخفیف جدید</h2>
            <button 
              onClick={onClose}
              className="w-8 h-8 bg-surface-100 hover:bg-surface-400 rounded-full flex items-center justify-center text-gray-300"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">عنوان تخفیف</label>
              <input
                type="text"
                value={offerData.title}
                onChange={(e) => setOfferData({...offerData, title: e.target.value})}
                className="w-full border border-surface-300 bg-surface-100 text-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="مثال: تخفیف ویژه پاییز"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">توضیحات</label>
              <textarea
                value={offerData.description}
                onChange={(e) => setOfferData({...offerData, description: e.target.value})}
                className="w-full border border-surface-300 bg-surface-100 text-gray-200 rounded-lg px-3 py-2 text-sm h-20"
                placeholder="توضیح کوتاه درباره تخفیف"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">نوع تخفیف</label>
                <select
                  value={offerData.discountType}
                  onChange={(e) => setOfferData({...offerData, discountType: e.target.value})}
                  className="w-full border border-surface-300 bg-surface-100 text-gray-200 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="percentage">درصدی</option>
                  <option value="fixed">مبلغ ثابت</option>
                  <option value="free">رایگان</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">مقدار تخفیف</label>
                <input
                  type="number"
                  value={offerData.discountValue}
                  onChange={(e) => setOfferData({...offerData, discountValue: e.target.value})}
                  className="w-full border border-surface-300 bg-surface-100 text-gray-200 rounded-lg px-3 py-2 text-sm"
                  placeholder={offerData.discountType === 'percentage' ? '20' : '50000'}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">دسته‌بندی</label>
              <select
                value={offerData.category}
                onChange={(e) => setOfferData({...offerData, category: e.target.value})}
                className="w-full border border-surface-300 bg-surface-100 text-gray-200 rounded-lg px-3 py-2 text-sm"
                required
              >
                <option value="">انتخاب دسته‌بندی</option>
                {categories.map((cat, index) => (
                  <option key={index} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">تاریخ انقضا</label>
                <input
                  type="date"
                  value={offerData.validUntil}
                  onChange={(e) => setOfferData({...offerData, validUntil: e.target.value})}
                  className="w-full border border-surface-300 bg-surface-100 text-gray-200 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">حداکثر استفاده</label>
                <input
                  type="number"
                  value={offerData.maxUsage}
                  onChange={(e) => setOfferData({...offerData, maxUsage: e.target.value})}
                  className="w-full border border-surface-300 bg-surface-100 text-gray-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="100"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="checkbox"
                  checked={offerData.vipOnly}
                  onChange={(e) => setOfferData({...offerData, vipOnly: e.target.checked})}
                  className="rounded"
                />
                <span className="text-sm">فقط برای اعضای VIP</span>
              </label>
              
              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="checkbox"
                  checked={offerData.isSpecial}
                  onChange={(e) => setOfferData({...offerData, isSpecial: e.target.checked})}
                  className="rounded"
                />
                <span className="text-sm">تخفیف ویژه (نمایش در صفحه اصلی)</span>
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-surface-300 rounded-lg text-sm text-gray-300 hover:bg-surface-400"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-brand-500 text-white rounded-lg text-sm hover:bg-brand-400"
              >
                ایجاد تخفیف
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function OffersManagement() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [offers, setOffers] = useState([
    {
      id: 1,
      title: 'تخفیف ویژه پاییز',
      category: 'رستوران و غذا',
      discountType: 'percentage',
      discountValue: 25,
      usage: 45,
      maxUsage: 100,
      validUntil: '۱۴۰۳/۰۹/۳۰',
      status: 'active',
      vipOnly: false,
      isSpecial: true
    },
    {
      id: 2,
      title: 'مشاوره رایگان',
      category: 'آموزش',
      discountType: 'free',
      discountValue: 0,
      usage: 28,
      maxUsage: 30,
      validUntil: '۱۴۰۳/۰۹/۱۵',
      status: 'ending',
      vipOnly: false,
      isSpecial: false
    },
    {
      id: 3,
      title: 'تخفیف VIP',
      category: 'خرید و فروش',
      discountType: 'percentage',
      discountValue: 30,
      usage: 12,
      maxUsage: 50,
      validUntil: '۱۴۰۳/۱۰/۳۰',
      status: 'active',
      vipOnly: true,
      isSpecial: false
    }
  ]);

  const handleCreateOffer = (offerData) => {
    const newOffer = {
      id: offers.length + 1,
      ...offerData,
      usage: 0,
      status: 'active'
    };
    setOffers([...offers, newOffer]);
    setIsCreateModalOpen(false);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'ending': return 'bg-orange-100 text-orange-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'active': return 'فعال';
      case 'ending': return 'رو به اتمام';
      case 'expired': return 'منقضی شده';
      case 'paused': return 'متوقف شده';
      default: return 'نامشخص';
    }
  };

  const formatDiscount = (type, value) => {
    switch(type) {
      case 'percentage': return `${value}%`;
      case 'fixed': return `${value.toLocaleString()} تومان`;
      case 'free': return 'رایگان';
      default: return value;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-100 mb-1">مدیریت تخفیف‌ها</h1>
          <p className="text-xs md:text-sm text-gray-500">ایجاد و مدیریت تخفیف‌های کسب‌وکار</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-400 flex items-center gap-2 text-sm"
        >
          <span>+</span>
          تخفیف جدید
        </button>
      </div>

      <div className="space-y-6">
        {/* آمار کلی */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="card-dark p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">کل تخفیف‌ها</p>
                <p className="text-2xl font-bold text-gray-100">{offers.length}</p>
              </div>
              <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center text-white/90">
                🎫
              </div>
            </div>
          </div>
          
          <div className="card-dark p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">فعال</p>
                <p className="text-2xl font-bold text-green-400">
                  {offers.filter(o => o.status === 'active').length}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white/90">
                ✅
              </div>
            </div>
          </div>
          
          <div className="card-dark p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">کل استفاده</p>
                <p className="text-2xl font-bold text-purple-300">
                  {offers.reduce((sum, offer) => sum + offer.usage, 0)}
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white/90">
                👥
              </div>
            </div>
          </div>
          
          <div className="card-dark p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">تخفیف‌های VIP</p>
                <p className="text-2xl font-bold text-orange-300">
                  {offers.filter(o => o.vipOnly).length}
                </p>
              </div>
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white/90">
                👑
              </div>
            </div>
          </div>
        </div>

        {/* لیست تخفیف‌ها */}
        <div className="card-dark shadow-sm">
          <div className="p-6 border-b border-surface-300">
            <h2 className="text-lg font-semibold text-gray-100">تخفیف‌های شما</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-100">
                <tr>
                  <th className="text-right p-4 text-xs md:text-sm font-medium text-gray-500">عنوان</th>
                  <th className="text-right p-4 text-xs md:text-sm font-medium text-gray-500">دسته‌بندی</th>
                  <th className="text-right p-4 text-xs md:text-sm font-medium text-gray-500">تخفیف</th>
                  <th className="text-right p-4 text-xs md:text-sm font-medium text-gray-500">استفاده</th>
                  <th className="text-right p-4 text-xs md:text-sm font-medium text-gray-500">تاریخ انقضا</th>
                  <th className="text-right p-4 text-xs md:text-sm font-medium text-gray-500">وضعیت</th>
                  <th className="text-right p-4 text-xs md:text-sm font-medium text-gray-500">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((offer) => (
                  <tr key={offer.id} className="border-b border-surface-300 hover:bg-surface-100">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-sm text-gray-100">{offer.title}</p>
                        <div className="flex gap-1 mt-1">
                          {offer.vipOnly && (
                            <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded">VIP</span>
                          )}
                          {offer.isSpecial && (
                            <span className="bg-yellow-500/20 text-yellow-300 text-xs px-2 py-1 rounded">ویژه</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-400">{offer.category}</td>
                    <td className="p-4">
                      <span className="font-medium text-green-400">
                        {formatDiscount(offer.discountType, offer.discountValue)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-surface-400/40 rounded-full h-2">
                          <div 
                            className="bg-brand-500 h-2 rounded-full"
                            style={{ width: `${(offer.usage / offer.maxUsage) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {offer.usage}/{offer.maxUsage}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-400">{offer.validUntil}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(offer.status)} bg-opacity-20` }>
                        {getStatusText(offer.status)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button className="text-brand-400 hover:bg-surface-100 p-1 rounded">
                          ✏️
                        </button>
                        <button className="text-red-400 hover:bg-surface-100 p-1 rounded">
                          🗑️
                        </button>
                        <button className="text-gray-400 hover:bg-surface-100 p-1 rounded">
                          ⏸️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <CreateOfferModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateOffer}
      />
    </div>
  );
}
