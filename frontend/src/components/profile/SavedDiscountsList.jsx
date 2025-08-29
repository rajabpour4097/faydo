import React, { useState, useEffect } from 'react';
import { userOfferService } from '../../services/api.js';

export default function SavedDiscountsList() {
  const [savedOffers, setSavedOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedOffers();
  }, []);

  const loadSavedOffers = async () => {
    try {
      const response = await userOfferService.getSaved();
      setSavedOffers(response.data.results || response.data || []);
    } catch (error) {
      console.error('خطا در بارگذاری تخفیف‌های ذخیره‌شده:', error);
      // داده نمونه در صورت خطا
      setSavedOffers([
        { id: 1, offer: { business: { name: 'Cafe Rio' }, percent: 25, title: 'تخفیف منوی کافه' } }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-surface-300 bg-surface-50 p-5 flex flex-col gap-3 text-gray-100">
      <h3 className="text-sm font-semibold text-gray-100">تخفیف‌های ذخیره‌شده</h3>
      
      {loading ? (
        <div className="text-center py-4">
          <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-gray-500">در حال بارگذاری...</p>
        </div>
      ) : savedOffers.length > 0 ? (
        <ul className="space-y-2 text-xs">
          {savedOffers.map(userOffer => (
            <li key={userOffer.id} className="flex justify-between rounded bg-surface-100 px-3 py-2">
              <div>
                <div className="font-medium text-gray-100">{userOffer.offer.business?.name}</div>
                <div className="text-[11px] text-gray-500">{userOffer.offer.title}</div>
              </div>
              <span className="text-brand-400 font-bold">%{userOffer.offer.percent}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-gray-500 py-4 text-center">هیچ تخفیف ذخیره‌شده‌ای ندارید</p>
      )}
    </div>
  );
}
