import React, { useState } from 'react';
import { offerService } from '../../services/api.js';

export default function DiscountCard({ offer }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleSave = async () => {
    try {
      setLoading(true);
      await offerService.saveOffer(offer.id);
      setStatus('ذخیره شد!');
      setTimeout(() => setStatus(''), 2000);
    } catch (error) {
      console.error('خطا در ذخیره تخفیف:', error);
      setStatus('خطا در ذخیره');
      setTimeout(() => setStatus(''), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleUse = async () => {
    try {
      setLoading(true);
      await offerService.useOffer(offer.id);
      setStatus('استفاده شد!');
      setTimeout(() => setStatus(''), 2000);
    } catch (error) {
      console.error('خطا در استفاده از تخفیف:', error);
      if (error.response?.data?.error) {
        setStatus(error.response.data.error);
      } else {
        setStatus('خطا در استفاده');
      }
      setTimeout(() => setStatus(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border bg-white p-4 flex flex-col gap-2 text-xs hover:shadow">
      <div className="flex justify-between items-baseline">
        <h4 className="font-semibold text-sm">{offer.brand}</h4>
        <span className="text-brand-600 font-bold">%{offer.percent}</span>
      </div>
      <p className="text-gray-500">دسته: {offer.category}</p>
      {offer.title && <p className="text-gray-600 text-[11px]">{offer.title}</p>}
      
      {status && (
        <p className={`text-[11px] ${status.includes('خطا') ? 'text-red-500' : 'text-green-600'}`}>
          {status}
        </p>
      )}
      
      <div className="mt-auto flex gap-2">
        <button 
          onClick={handleUse}
          disabled={loading}
          className="flex-1 rounded bg-brand-600 text-white px-3 py-1 text-[11px] hover:bg-brand-500 disabled:opacity-50"
        >
          {loading ? '...' : 'استفاده'}
        </button>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="rounded border border-brand-600 text-brand-600 px-3 py-1 text-[11px] hover:bg-brand-50 disabled:opacity-50"
        >
          ذخیره
        </button>
      </div>
    </div>
  );
}
