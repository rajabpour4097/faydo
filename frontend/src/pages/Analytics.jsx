import React, { useState } from 'react';

// کامپوننت چارت ساده
function SimpleChart({ data, title, color = 'blue' }) {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="card-dark p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-100">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-20 text-sm text-gray-500">{item.label}</div>
            <div className="flex-1 bg-surface-400/40 rounded-full h-3">
              <div className={`h-3 rounded-full transition-all duration-500 ${color === 'blue' ? 'bg-brand-500' : color === 'purple' ? 'bg-purple-500' : 'bg-green-500'}`} style={{ width: `${(item.value / maxValue) * 100}%` }} />
            </div>
            <div className="w-16 text-sm font-medium text-left text-gray-300">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// کامپوننت کارت KPI
function KPICard({ title, value, subtitle, trend, icon, color = 'blue' }) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500'
  };

  return (
    <div className="card-dark p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${colorClasses[color]} rounded-lg flex items-center justify-center text-white/90 text-xl`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs px-2 py-1 rounded ${trend.type === 'positive' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
            {trend.type === 'positive' ? '↗' : '↘'} {trend.value}%
          </span>
        )}
      </div>
      <div>
        <p className="text-sm text-gray-400 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-100">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

// کامپوننت جدول تحلیلی
function AnalyticsTable({ title, data, columns }) {
  return (
    <div className="card-dark p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-100">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              {columns.map((col, index) => (
                <th key={index} className="text-right p-3 text-sm font-medium text-gray-500">
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className="border-b border-surface-300 last:border-b-0 hover:bg-surface-100">
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="p-3 text-sm text-gray-300">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('30days');

  // داده‌های نمونه
  const salesByCategory = [
    { label: 'غذا', value: 145 },
    { label: 'کافه', value: 89 },
    { label: 'خرید', value: 67 },
    { label: 'آموزش', value: 43 },
    { label: 'ورزش', value: 21 }
  ];

  const topOffers = [
    {
      title: 'تخفیف ویژه پاییز',
      category: 'رستوران',
      usage: 145,
      revenue: '2,890,000',
      satisfaction: 4.8
    },
    {
      title: 'مشاوره رایگان',
      category: 'آموزش',
      usage: 89,
      revenue: '0',
      satisfaction: 4.9
    },
    {
      title: 'تخفیف VIP',
      category: 'خرید',
      usage: 67,
      revenue: '1,340,000',
      satisfaction: 4.7
    }
  ];

  const customerSegments = [
    { label: 'برنزی', value: 234 },
    { label: 'نقره‌ای', value: 156 },
    { label: 'طلایی', value: 89 },
    { label: 'VIP', value: 34 }
  ];

  const offersColumns = [
    { key: 'title', title: 'عنوان تخفیف' },
    { key: 'category', title: 'دسته‌بندی' },
    { 
      key: 'usage', 
      title: 'تعداد استفاده',
      render: (value) => <span className="font-medium">{value}</span>
    },
    { 
      key: 'revenue', 
      title: 'درآمد (تومان)',
      render: (value) => <span className="text-green-600 font-medium">{value}</span>
    },
    { 
      key: 'satisfaction', 
      title: 'رضایت',
      render: (value) => (
        <div className="flex items-center gap-1">
          <span>⭐</span>
          <span className="font-medium">{value}</span>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-100 mb-1">تحلیلات و گزارش‌ها</h1>
          <p className="text-xs md:text-sm text-gray-500">آمار و عملکرد کسب‌وکار شما</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-surface-300 bg-surface-100 rounded-lg px-3 py-2 text-sm text-gray-300"
          >
            <option value="7days">۷ روز گذشته</option>
            <option value="30days">۳۰ روز گذشته</option>
            <option value="3months">۳ ماه گذشته</option>
            <option value="1year">سال جاری</option>
          </select>
          <button className="bg-brand-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-400">
            📊 تولید گزارش
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="کل درآمد"
            value="۱۲.۳M"
            subtitle="تومان"
            trend={{ type: 'positive', value: 12.5 }}
            icon="💰"
            color="green"
          />
          <KPICard
            title="تعداد مشتری"
            value="۱,۲۸۹"
            subtitle="نفر"
            trend={{ type: 'positive', value: 8.2 }}
            icon="👥"
            color="blue"
          />
          <KPICard
            title="نرخ استفاده از تخفیف"
            value="۶۸%"
            subtitle="از کل تخفیف‌ها"
            trend={{ type: 'positive', value: 5.4 }}
            icon="🎫"
            color="purple"
          />
          <KPICard
            title="میانگین رضایت"
            value="۴.۷"
            subtitle="از ۵"
            trend={{ type: 'negative', value: 1.2 }}
            icon="⭐"
            color="orange"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SimpleChart
            title="فروش بر اساس دسته‌بندی"
            data={salesByCategory}
            color="blue"
          />
          <SimpleChart
            title="تقسیم‌بندی مشتریان"
            data={customerSegments}
            color="purple"
          />
        </div>

        {/* Revenue Chart */}
        <div className="card-dark p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-100">روند درآمد</h3>
            <div className="flex gap-2 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-brand-500 rounded" />
                <span>درآمد</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded" />
                <span>تخفیف استفاده شده</span>
              </div>
            </div>
          </div>
          
          {/* نمودار ساده - در پروژه واقعی از Chart.js استفاده کنید */}
          <div className="h-48 bg-surface-100 rounded-lg flex items-end justify-center gap-1 p-4">
            {[
              { revenue: 60, discount: 40 },
              { revenue: 75, discount: 55 },
              { revenue: 45, discount: 30 },
              { revenue: 90, discount: 70 },
              { revenue: 65, discount: 45 },
              { revenue: 80, discount: 60 },
              { revenue: 95, discount: 75 }
            ].map((day, index) => (
              <div key={index} className="flex flex-col items-center gap-1 flex-1">
        <div className="bg-brand-500 rounded-t w-full" style={{ height: `${day.revenue}%` }} />
        <div className="bg-green-500 rounded-t w-full" style={{ height: `${day.discount}%` }} />
              </div>
            ))}
          </div>
          
      <div className="grid grid-cols-7 gap-1 mt-2 text-xs text-gray-500 text-center">
            {['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'].map((day, index) => (
              <div key={index}>{day}</div>
            ))}
          </div>
        </div>

        {/* Top Offers Table */}
        <AnalyticsTable
          title="بهترین تخفیف‌ها"
          data={topOffers}
          columns={offersColumns}
        />

        {/* Customer Activity */}
        <div className="card-dark p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-100">فعالیت مشتریان</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-brand-500/10 rounded-lg">
              <div className="text-2xl font-bold text-brand-400">۸۷%</div>
              <div className="text-sm text-gray-500">نرخ بازگشت مشتریان</div>
            </div>
            <div className="text-center p-4 bg-green-500/10 rounded-lg">
              <div className="text-2xl font-bold text-green-400">۴.۲</div>
              <div className="text-sm text-gray-500">میانگین استفاده ماهانه</div>
            </div>
            <div className="text-center p-4 bg-purple-500/10 rounded-lg">
              <div className="text-2xl font-bold text-purple-300">۹۲%</div>
              <div className="text-sm text-gray-500">رضایت از خدمات</div>
            </div>
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="card-dark p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-100">فعالیت‌های اخیر</h3>
          <div className="space-y-4">
            {[
              { time: '۲ ساعت پیش', event: 'علی محمدی از تخفیف ۲۰٪ استفاده کرد', type: 'usage' },
              { time: '۴ ساعت پیش', event: 'نظر جدید: ۵ ستاره برای خدمات', type: 'review' },
              { time: '۶ ساعت پیش', event: 'مشتری جدید: مریم احمدی ثبت‌نام کرد', type: 'signup' },
              { time: '۱ روز پیش', event: 'تخفیف "ویژه پاییز" به ۱۰۰ استفاده رسید', type: 'milestone' }
            ].map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-surface-100 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'usage' ? 'bg-blue-500' :
                  activity.type === 'review' ? 'bg-green-500' :
                  activity.type === 'signup' ? 'bg-purple-500' :
                  'bg-orange-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-300">{activity.event}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
