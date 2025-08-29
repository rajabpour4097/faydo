import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// کامپوننت کارت آمار کلی
function StatsCard({ title, value, change, changeType, icon, color = 'blue' }) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  };

  return (
    <div className="card-dark p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-100">{value}</p>
          <div className="flex items-center mt-2">
            <span className={`text-xs px-2 py-1 rounded ${changeType === 'positive' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
              {changeType === 'positive' ? '+' : ''}{change}%
            </span>
            <span className="text-xs text-gray-500 mr-2">از ماه قبل</span>
          </div>
        </div>
        <div className={`w-12 h-12 ${colorClasses[color]} rounded-lg flex items-center justify-center text-white/90 shadow-inner`}> 
          {icon}
        </div>
      </div>
    </div>
  );
}

// کامپوننت چارت فروش
function SalesChart() {
  return (
    <div className="card-dark p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-100">آمار فروش</h3>
        <div className="flex gap-2">
          <select className="text-sm border border-surface-300 bg-surface-100 rounded px-3 py-1 text-gray-300">
            <option>30 روز گذشته</option>
            <option>3 ماه گذشته</option>
            <option>سال جاری</option>
          </select>
        </div>
      </div>
      
      {/* چارت ساده - در پروژه واقعی از کتابخانه Chart.js استفاده کنید */}
  <div className="h-64 bg-surface-100 rounded-lg flex items-end justify-center gap-2 p-4">
        {[40, 60, 45, 80, 65, 90, 75].map((height, index) => (
          <div
            key={index}
    className="bg-brand-500 rounded-t"
            style={{ height: `${height}%`, width: '12%' }}
          />
        ))}
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-sm text-gray-400">کل فروش</p>
          <p className="font-semibold text-gray-100">۱۲,۳۴۵,۰۰۰ تومان</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">تعداد سفارش</p>
          <p className="font-semibold text-gray-100">۲۸۷ سفارش</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">میانگین سفارش</p>
          <p className="font-semibold text-gray-100">۴۳,۰۰۰ تومان</p>
        </div>
      </div>
    </div>
  );
}

// کامپوننت مشتریان اخیر
function RecentCustomers() {
  const customers = [
    { name: 'علی محمدی', email: 'ali@example.com', avatar: '👤', level: 'VIP', spent: '۲,۳۰۰,۰۰۰' },
    { name: 'مریم احمدی', email: 'maryam@example.com', avatar: '👤', level: 'طلایی', spent: '۱,۵۰۰,۰۰۰' },
    { name: 'حسن رضایی', email: 'hassan@example.com', avatar: '👤', level: 'نقره‌ای', spent: '۸۰۰,۰۰۰' },
  ];

  return (
    <div className="card-dark p-6 shadow-sm" style={{ fontFamily: 'Vazirmatn FD, sans-serif' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-100">مشتریان فعال</h3>
        <Link to="/customers" className="text-brand-400 text-sm hover:underline">
          مشاهده همه
        </Link>
      </div>
      
      <div className="space-y-4">
        {customers.map((customer, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-surface-100 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-surface-400/40 rounded-full flex items-center justify-center text-gray-200">
                {customer.avatar}
              </div>
              <div>
                <p className="font-medium text-sm text-gray-100">{customer.name}</p>
                <p className="text-xs text-gray-500">{customer.email}</p>
              </div>
            </div>
            <div className="text-left">
              <span className={`text-xs px-2 py-1 rounded ${
                customer.level === 'VIP' ? 'bg-purple-500/20 text-purple-300' :
                customer.level === 'طلایی' ? 'bg-yellow-500/20 text-yellow-300' :
                'bg-gray-500/20 text-gray-300'
              }`}>
                {customer.level}
              </span>
              <p className="text-xs text-gray-500 mt-1">{customer.spent} تومان</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// کامپوننت تخفیف‌های فعال
function ActiveOffers() {
  const offers = [
    { title: 'تخفیف ویژه پاییز', discount: '20%', usage: 45, maxUsage: 100, status: 'active' },
    { title: 'تخفیف VIP', discount: '30%', usage: 12, maxUsage: 50, status: 'active' },
    { title: 'تخفیف مشاوره رایگان', discount: 'رایگان', usage: 28, maxUsage: 30, status: 'ending' },
  ];

  return (
    <div className="card-dark p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-100">تخفیف‌های فعال</h3>
        <Link to="/offers/create" className="bg-brand-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-400">
          + تخفیف جدید
        </Link>
      </div>
      
      <div className="space-y-3">
        {offers.map((offer, index) => (
          <div key={index} className="flex items-center justify-between p-4 border border-surface-300 rounded-lg bg-surface-100">
            <div>
              <p className="font-medium text-sm text-gray-100">{offer.title}</p>
              <p className="text-brand-400 font-bold">{offer.discount}</p>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-20 bg-surface-400/40 rounded-full h-2">
                  <div 
                    className="bg-brand-500 h-2 rounded-full"
                    style={{ width: `${(offer.usage / offer.maxUsage) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">{offer.usage}/{offer.maxUsage}</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${
                offer.status === 'active' ? 'bg-green-500/15 text-green-400' : 'bg-orange-500/15 text-orange-400'
              }`}>
                {offer.status === 'active' ? 'فعال' : 'رو به اتمام'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// کامپوننت نظرات اخیر
function RecentReviews() {
  const reviews = [
    { customer: 'محمد علی‌زاده', rating: 5, comment: 'خدمات عالی و کیفیت بالا', time: '۲ ساعت پیش' },
    { customer: 'فاطمه کریمی', rating: 4, comment: 'راضی هستم، توصیه می‌کنم', time: '۵ ساعت پیش' },
    { customer: 'امیر حسینی', rating: 5, comment: 'تجربه فوق‌العاده‌ای داشتم', time: '۱ روز پیش' },
  ];

  return (
    <div className="card-dark p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-100">نظرات اخیر</h3>
        <Link to="/reviews" className="text-brand-400 text-sm hover:underline">
          مشاهده همه
        </Link>
      </div>
      
      <div className="space-y-4">
        {reviews.map((review, index) => (
      <div key={index} className="p-3 bg-surface-100 rounded-lg">
            <div className="flex items-center justify-between mb-2">
        <p className="font-medium text-sm text-gray-100">{review.customer}</p>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
          <span key={i} className={`text-xs ${i < review.rating ? 'text-yellow-400' : 'text-gray-600'}`}>
                    ⭐
                  </span>
                ))}
              </div>
            </div>
      <p className="text-xs text-gray-400 mb-1">{review.comment}</p>
      <p className="text-xs text-gray-500">{review.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BusinessDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-100 mb-1">داشبورد کسب‌وکار</h1>
          <p className="text-xs md:text-sm text-gray-500">مدیریت عملکرد و تحلیل داده‌ها</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-lg bg-surface-50 hover:bg-surface-400 text-gray-300">
            🔔
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">3</span>
          </button>
          <div className="w-9 h-9 bg-brand-500/30 rounded-full flex items-center justify-center text-brand-300 font-medium">
            B
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* آمار کلی */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="کل مشتریان"
            value="۱,۲۸۹"
            change="+۱۲.۵"
            changeType="positive"
            icon="👥"
            color="blue"
          />
          <StatsCard
            title="فروش امروز"
            value="۴.۵M"
            change="+۸.۲"
            changeType="positive"
            icon="💰"
            color="green"
          />
          <StatsCard
            title="میانگین رضایت"
            value="۴.۸"
            change="+۰.۳"
            changeType="positive"
            icon="⭐"
            color="orange"
          />
          <StatsCard
            title="تخفیف‌های فعال"
            value="۱۲"
            change="-۲"
            changeType="negative"
            icon="🎫"
            color="purple"
          />
        </div>

        {/* چارت + مشتریان */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <SalesChart />
          <RecentCustomers />
        </div>

        {/* تخفیف + نظرات */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ActiveOffers />
          <RecentReviews />
        </div>

        {/* منوی سریع */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/offers" className="card-dark p-4 hover-card-dark text-center">
            <div className="text-2xl mb-2">🎫</div>
            <p className="font-medium text-sm text-gray-200">مدیریت تخفیف‌ها</p>
          </Link>
          <Link to="/customers" className="card-dark p-4 hover-card-dark text-center">
            <div className="text-2xl mb-2">👥</div>
            <p className="font-medium text-sm text-gray-200">مشتریان</p>
          </Link>
          <Link to="/analytics" className="card-dark p-4 hover-card-dark text-center">
            <div className="text-2xl mb-2">📊</div>
            <p className="font-medium text-sm text-gray-200">تحلیل و گزارش</p>
          </Link>
          <Link to="/settings" className="card-dark p-4 hover-card-dark text-center">
            <div className="text-2xl mb-2">⚙️</div>
            <p className="font-medium text-sm text-gray-200">تنظیمات</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
