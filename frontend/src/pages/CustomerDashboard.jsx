import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DiscountCard from '../components/dashboard/DiscountCard';
import UserLevelCard from '../components/dashboard/UserLevelCard';
import ProgressBar from '../components/dashboard/ProgressBar';

// کامپوننت کارت امتیاز کاربر
function UserScoreCard({ score, level, nextLevel, progress }) {
  return (
    <div className="rounded-xl p-6 relative overflow-hidden card-dark">
      <div className="absolute inset-0 bg-gradient-to-l from-brand-500/20 via-purple-600/10 to-transparent pointer-events-none" />
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-100">امتیاز شما</h3>
          <p className="text-3xl font-bold text-white">{score}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">سطح فعلی</p>
          <p className="font-medium text-gray-100">{level}</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">پیشرفت تا {nextLevel}</span>
          <span className="text-gray-300">{progress}%</span>
        </div>
        <div className="w-full bg-surface-400/40 rounded-full h-2">
          <div 
            className="bg-brand-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// کامپوننت تخفیف‌های ویژه
function SpecialOffers() {
  const offers = [
    { 
      title: 'رستوران سنتی شیراز', 
      discount: '25%', 
      category: 'غذا', 
      image: '🍽️',
      location: 'تهران',
      rating: 4.8,
      vipOnly: false
    },
    { 
      title: 'کافه کتاب', 
      discount: '15%', 
      category: 'کافه', 
      image: '☕',
      location: 'تهران', 
      rating: 4.9,
      vipOnly: false
    },
    { 
      title: 'باشگاه ورزشی اکسیژن', 
      discount: '30%', 
      category: 'ورزش', 
      image: '🏋️',
      location: 'تهران',
      rating: 4.7,
      vipOnly: true
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-100">تخفیف‌های ویژه</h3>
        <Link to="/offers" className="text-brand-400 text-sm hover:underline">
          مشاهده همه
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {offers.map((offer, index) => (
          <div key={index} className="card-dark p-4 hover-card-dark transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="text-3xl">{offer.image}</div>
              {offer.vipOnly && (
                <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded">VIP</span>
              )}
            </div>
            
            <h4 className="font-medium text-sm mb-1 text-gray-100">{offer.title}</h4>
            <p className="text-gray-500 text-xs mb-2">{offer.category} • {offer.location}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span>⭐</span>
                <span>{offer.rating}</span>
              </div>
              <div className="text-left">
                <span className="bg-green-500/15 text-green-400 text-xs px-2 py-1 rounded font-medium">
                  {offer.discount} تخفیف
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// کامپوننت فعالیت‌های اخیر
function RecentActivity() {
  const activities = [
    { 
      type: 'discount_used', 
      title: 'استفاده از تخفیف ۲۰٪ رستوران سنتی', 
      time: '۲ ساعت پیش',
      points: '+۵۰ امتیاز'
    },
    { 
      type: 'review_posted', 
      title: 'نظر شما برای کافه کتاب ثبت شد', 
      time: '۱ روز پیش',
      points: '+۲۰ امتیاز'
    },
    { 
      type: 'level_up', 
      title: 'تبریک! به سطح نقره‌ای رسیدید', 
      time: '۳ روز پیش',
      points: 'مدال جدید'
    },
  ];

  const getActivityIcon = (type) => {
    switch(type) {
      case 'discount_used': return '🎫';
      case 'review_posted': return '⭐';
      case 'level_up': return '🏆';
      default: return '📱';
    }
  };

  return (
    <div className="card-dark p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">فعالیت‌های اخیر</h3>
      
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-surface-100 rounded-lg">
            <div className="text-xl">{getActivityIcon(activity.type)}</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-100">{activity.title}</p>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
            <span className="text-xs bg-brand-500/20 text-brand-300 px-2 py-1 rounded">
              {activity.points}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// کامپوننت مدال‌ها و دستاوردها
function Achievements() {
  const achievements = [
    { title: 'اولین تخفیف', icon: '🎉', earned: true, description: 'اولین تخفیف خود را استفاده کردید' },
    { title: 'داور فعال', icon: '⭐', earned: true, description: '۱۰ نظر مفید ثبت کردید' },
    { title: 'مشتری وفادار', icon: '💎', earned: false, description: 'از ۵ کسب‌وکار مختلف خرید کنید' },
    { title: 'VIP', icon: '👑', earned: false, description: 'به سطح VIP برسید' },
  ];

  return (
    <div className="card-dark p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-100">مدال‌ها و دستاوردها</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {achievements.map((achievement, index) => (
          <div 
            key={index} 
            className={`p-3 rounded-lg text-center border ${achievement.earned ? 'bg-yellow-500/10 border-yellow-400/30' : 'bg-surface-100 border-surface-300'} ${achievement.earned ? '' : 'opacity-70'}`}
          >
            <div className="text-2xl mb-1">{achievement.icon}</div>
            <p className={`font-medium text-xs ${achievement.earned ? 'text-yellow-300' : 'text-gray-500'}`}>
              {achievement.title}
            </p>
            <p className="text-xs text-gray-500 mt-1">{achievement.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// کامپوننت پیشنهادهای شخصی‌سازی شده
function PersonalizedRecommendations() {
  const recommendations = [
    { title: 'کافه نیویورک', category: 'کافه', discount: '20%', match: '95%', reason: 'بر اساس علاقه‌مندی‌های شما' },
    { title: 'آموزشگاه زبان', category: 'آموزش', discount: '15%', match: '87%', reason: 'محبوب در منطقه شما' },
  ];

  return (
    <div className="card-dark p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-100">پیشنهادهای ویژه شما</h3>
      
      <div className="space-y-3">
        {recommendations.map((rec, index) => (
          <div key={index} className="p-3 border border-surface-300 rounded-lg bg-surface-100">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm text-gray-100">{rec.title}</h4>
              <span className="bg-green-500/15 text-green-400 text-xs px-2 py-1 rounded">
                {rec.discount} تخفیف
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-1">{rec.category}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-brand-400">{rec.reason}</span>
              <span className="text-xs font-medium text-green-400">{rec.match} تطبیق</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CustomerDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-100 mb-1">داشبورد من</h1>
          <p className="text-xs md:text-sm text-gray-500">به فایدو خوش آمدید!</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-lg bg-surface-50 hover:bg-surface-400 text-gray-300">
            🔔
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">2</span>
          </button>
          <div className="w-9 h-9 bg-purple-500/30 rounded-full flex items-center justify-center text-purple-200 font-medium">
            م
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* کارت امتیاز کاربر */}
        <UserScoreCard 
          score="۱,۲۸۵"
          level="نقره‌ای"
          nextLevel="طلایی"
          progress={68}
        />

        {/* منوی سریع */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/search" className="card-dark p-4 hover-card-dark text-center">
            <div className="text-2xl mb-2">🔍</div>
            <p className="font-medium text-sm text-gray-200">جستجوی تخفیف</p>
          </Link>
          <Link to="/favorites" className="card-dark p-4 hover-card-dark text-center">
            <div className="text-2xl mb-2">❤️</div>
            <p className="font-medium text-sm text-gray-200">علاقه‌مندی‌ها</p>
          </Link>
          <Link to="/history" className="card-dark p-4 hover-card-dark text-center">
            <div className="text-2xl mb-2">📋</div>
            <p className="font-medium text-sm text-gray-200">تاریخچه استفاده</p>
          </Link>
          <Link to="/invite" className="card-dark p-4 hover-card-dark text-center">
            <div className="text-2xl mb-2">👥</div>
            <p className="font-medium text-sm text-gray-200">دعوت دوستان</p>
          </Link>
        </div>

        {/* ردیف اول */}
        <SpecialOffers />

        {/* ردیف دوم */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivity />
          <Achievements />
        </div>

        {/* ردیف سوم */}
        <PersonalizedRecommendations />

        {/* بنر تشویقی */}
        <div className="rounded-xl p-6 text-center card-dark relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-l from-green-500/10 via-brand-500/10 to-transparent" />
          <h3 className="text-lg font-semibold mb-2 text-gray-100 relative">به دوستان‌تان دعوت دهید!</h3>
          <p className="text-sm text-gray-400 mb-4 relative">برای هر دوست جدید ۱۰۰ امتیاز دریافت کنید</p>
          <Link to="/invite" className="relative bg-brand-500 text-white px-6 py-2 rounded-lg font-medium text-sm hover:bg-brand-400">
            دعوت کردن
          </Link>
        </div>
      </div>
    </div>
  );
}
