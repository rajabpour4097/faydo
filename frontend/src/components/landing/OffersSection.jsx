import React, { useState, useEffect } from 'react';
import { offerService, categoryService } from '../../services/api.js';
import DiscountCard from '../dashboard/DiscountCard.jsx';

export default function OffersSection() {
  const [filter, setFilter] = useState('all');
  const [offers, setOffers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadOffers();
  }, [filter]);

  const loadData = async () => {
    try {
      const [offersRes, categoriesRes] = await Promise.all([
        offerService.getAll(),
        categoryService.getAll()
      ]);
      setOffers(offersRes.data.results || offersRes.data || []);
      setCategories(categoriesRes.data.results || categoriesRes.data || []);
    } catch (error) {
      console.error('خطا در بارگذاری داده‌ها:', error);
      // داده‌های نمونه در صورت خطا
      setOffers([
        { id: 1, business: { name: 'Cafe Rio', category: { slug: 'food', name: 'کافه' } }, percent: 25, title: 'تخفیف منوی کافه' },
        { id: 2, business: { name: 'FitGym', category: { slug: 'fitness', name: 'فیتنس' } }, percent: 40, title: 'تخفیف باشگاه' },
        { id: 3, business: { name: 'MegaShop', category: { slug: 'shopping', name: 'فروشگاه' } }, percent: 15, title: 'تخفیف خرید' },
        { id: 4, business: { name: 'GameZone', category: { slug: 'entertainment', name: 'سرگرمی' } }, percent: 30, title: 'تخفیف بازی' }
      ]);
      setCategories([
        { slug: 'food', name: 'کافه و رستوران' },
        { slug: 'fitness', name: 'فیتنس' },
        { slug: 'shopping', name: 'فروشگاه' },
        { slug: 'entertainment', name: 'سرگرمی' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadOffers = async () => {
    if (filter === 'all') return;
    
    try {
      const response = await offerService.getByCategory(filter);
      setOffers(response.data.results || response.data || []);
    } catch (error) {
      console.error('خطا در فیلتر تخفیف‌ها:', error);
    }
  };

  const filteredOffers = filter === 'all' 
    ? offers 
    : offers.filter(o => o.business?.category?.slug === filter);

  return (
    <section className="py-20 bg-gray-50" id="offers">
      <div className="container-responsive">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h2 className="text-2xl font-bold">تخفیف‌ها</h2>
          <div className="flex gap-2 text-xs">
            <button 
              onClick={() => setFilter('all')} 
              className={`rounded px-3 py-1 border ${filter === 'all' ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}
            >
              همه
            </button>
            {categories.map(cat => (
              <button 
                key={cat.slug} 
                onClick={() => setFilter(cat.slug)} 
                className={`rounded px-3 py-1 border ${filter === cat.slug ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">در حال بارگذاری...</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredOffers.length > 0 ? (
              filteredOffers.map(offer => (
                <DiscountCard 
                  key={offer.id} 
                  offer={{
                    id: offer.id,
                    brand: offer.business?.name || 'نامشخص',
                    category: offer.business?.category?.name || 'عمومی',
                    percent: offer.percent,
                    title: offer.title
                  }} 
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500 text-sm">
                هیچ تخفیفی یافت نشد
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
