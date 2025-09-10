import React, { useState } from 'react';
import { Modal } from '../ui/Modal';

interface ReportDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
  discountTitle: string;
}

export const ReportDiscountModal: React.FC<ReportDiscountModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  discountTitle 
}) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const commonReasons = [
    'محتوای نامناسب',
    'تخفیف کاذب',
    'شرایط غیرمنطقی',
    'کلاهبرداری',
    'نقض قوانین سایت',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('لطفاً دلیل گزارش را وارد کنید');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit(reason);
      setReason('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت گزارش');
    } finally {
      setLoading(false);
    }
  };

  const handleReasonSelect = (selectedReason: string) => {
    setReason(selectedReason);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="گزارش تخلف" maxWidth="md">
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <p className="text-sm text-yellow-800">
            شما در حال گزارش تخفیف "{discountTitle}" هستید
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              دلایل متداول:
            </label>
            <div className="space-y-2">
              {commonReasons.map((commonReason) => (
                <button
                  key={commonReason}
                  type="button"
                  onClick={() => handleReasonSelect(commonReason)}
                  className={`w-full text-left px-3 py-2 rounded-md border transition-colors ${
                    reason === commonReason
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {commonReason}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
              توضیحات تکمیلی:
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="لطفاً دلیل گزارش خود را به تفصیل بیان کنید..."
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              disabled={loading}
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={loading || !reason.trim()}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-50"
            >
              {loading ? 'در حال ارسال...' : 'ثبت گزارش'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
