import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { DiscountCreate } from '../../types/discount';

interface CreateDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (discount: DiscountCreate) => Promise<void>;
}

export const CreateDiscountModal: React.FC<CreateDiscountModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState<DiscountCreate>({
    title: '',
    description: '',
    percentage: 10,
    start_date: '',
    end_date: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'percentage' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // اعتبارسنجی
      if (new Date(formData.end_date) <= new Date(formData.start_date)) {
        setError('تاریخ پایان باید بعد از تاریخ شروع باشد');
        return;
      }

      if (formData.percentage < 1 || formData.percentage > 100) {
        setError('درصد تخفیف باید بین 1 تا 100 باشد');
        return;
      }

      await onSubmit(formData);
      
      // ریست فرم
      setFormData({
        title: '',
        description: '',
        percentage: 10,
        start_date: '',
        end_date: '',
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'خطا در ایجاد تخفیف');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ایجاد تخفیف جدید" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            عنوان تخفیف *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="مثال: تخفیف ویژه پاییز"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            توضیحات
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="توضیحات اضافی در مورد تخفیف..."
          />
        </div>

        <div>
          <label htmlFor="percentage" className="block text-sm font-medium text-gray-700 mb-1">
            درصد تخفیف * (1-100)
          </label>
          <input
            type="number"
            id="percentage"
            name="percentage"
            value={formData.percentage}
            onChange={handleChange}
            min="1"
            max="100"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
              تاریخ شروع *
            </label>
            <input
              type="datetime-local"
              id="start_date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
              تاریخ پایان *
            </label>
            <input
              type="datetime-local"
              id="end_date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
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
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
          >
            {loading ? 'در حال ایجاد...' : 'ایجاد تخفیف'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
