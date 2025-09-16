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
    <div className="bg-white/5 border border-white/10 text-white rounded-lg shadow-soft p-4 lg:p-6 hover:shadow-lg transition-shadow overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white flex-1 ml-2 truncate">{discount.title}</h3>
        <span className="bg-green-500/20 text-green-300 text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap">
          {discount.percentage}% تخفیف
        </span>
      </div>
      
      {discount.description && (
        <p className="text-white/80 mb-4 text-sm sm:text-base line-clamp-2 break-words">{discount.description}</p>
      )}
      
      <div className="mb-4">
        <div className="flex justify-between text-sm text-white/60 mb-2">
          <span>تاریخ شروع: {formatDate(discount.start_date)}</span>
          <span>تاریخ پایان: {formatDate(discount.end_date)}</span>
        </div>
        <ProgressBar 
          percentage={discount.time_remaining} 
          color={getProgressColor(discount.time_remaining)}
        />
        <p className="text-xs text-white/60 mt-1">
          {discount.time_remaining > 0 ? 'زمان باقی‌مانده' : 'منقضی شده'}
        </p>
      </div>

    <div className="flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <StarRating rating={discount.average_score} size="sm" />
          <span className="text-sm text-white/70">
            ({discount.total_scores} نظر)
          </span>
        </div>
        
        <button
          onClick={() => onViewDetails(discount.id)}
      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors border border-white/10"
        >
          جزئیات
        </button>
      </div>
    </div>
  );
};
