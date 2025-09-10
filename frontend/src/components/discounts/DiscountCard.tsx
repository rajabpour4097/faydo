import React from 'react';
import { Discount } from '../../types/discount';
import { ProgressBar } from '../ui/ProgressBar';
import { StarRating } from '../ui/StarRating';

interface DiscountCardProps {
  discount: Discount;
  onViewDetails: (id: number) => void;
}

export const DiscountCard: React.FC<DiscountCardProps> = ({ discount, onViewDetails }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  const getProgressColor = (percentage: number) => {
    if (percentage > 50) return 'green';
    if (percentage > 20) return 'yellow';
    return 'red';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-900">{discount.title}</h3>
        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {discount.percentage}% تخفیف
        </span>
      </div>
      
      {discount.description && (
        <p className="text-gray-600 mb-4 line-clamp-2">{discount.description}</p>
      )}
      
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>تاریخ شروع: {formatDate(discount.start_date)}</span>
          <span>تاریخ پایان: {formatDate(discount.end_date)}</span>
        </div>
        <ProgressBar 
          percentage={discount.time_remaining} 
          color={getProgressColor(discount.time_remaining)}
        />
        <p className="text-xs text-gray-500 mt-1">
          {discount.time_remaining > 0 ? 'زمان باقی‌مانده' : 'منقضی شده'}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <StarRating rating={discount.average_score} size="sm" />
          <span className="text-sm text-gray-600">
            ({discount.total_scores} نظر)
          </span>
        </div>
        
        <button
          onClick={() => onViewDetails(discount.id)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          جزئیات
        </button>
      </div>
    </div>
  );
};
