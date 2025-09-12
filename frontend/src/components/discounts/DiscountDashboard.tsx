import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardSummary } from '../../types/discount';
import discountService from '../../services/discountService';
import { StarRating } from '../ui/StarRating';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';
import { StatPill } from '../ui/StatPill';

export const DiscountDashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const data = await discountService.getDashboardSummary();
      setSummary(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  if (loading) {
    return (
      <Card>
        <div className="animate-pulse">
          <div className="h-6 bg-white/10 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-white/10 rounded"></div>
            <div className="h-4 bg-white/10 rounded"></div>
            <div className="h-4 bg-white/10 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-danger-400">{error}</div>
      </Card>
    );
  }

  if (!summary) return null;

  return (
    <div className="space-y-6">
      {/* آمار کلی */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <StatPill tone="purple" label="کل تخفیفات" value={summary.total_discounts} />
        <StatPill tone="mint" label="تخفیفات فعال" value={summary.active_discounts} />
        <StatPill tone="pink" label="تخفیفات منقضی" value={summary.expired_discounts} />
      </div>

      {/* تخفیفات اخیر */}
      <Card className="p-0">
        <div className="px-4 sm:px-6 py-4 border-b border-white/10">
          <SectionHeader
            title="تخفیفات اخیر"
            action={(
              <button
                onClick={() => navigate('/dashboard/business/discounts')}
                className="text-primary-300 hover:text-primary-200 text-sm font-medium transition-colors"
              >
                مشاهده همه
              </button>
            )}
          />
        </div>

        {summary.recent_discounts.length === 0 ? (
          <div className="p-6 text-center text-white/60">هنوز تخفیفی ایجاد نکرده‌اید</div>
        ) : (
          <div className="divide-y divide-white/5">
            {summary.recent_discounts.map((discount) => (
              <div key={discount.id} className="p-4 sm:p-6 hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white">{discount.title}</h4>
                    <div className="mt-1 flex items-center space-x-4 space-x-reverse text-xs sm:text-sm text-white/60">
                      <span>{discount.percentage}% تخفیف</span>
                      <span>تا {formatDate(discount.end_date)}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 space-x-reverse">
                    <StarRating rating={discount.average_score} size="sm" />
                    <span className="text-xs sm:text-sm text-white/60">({discount.total_comments} نظر)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
