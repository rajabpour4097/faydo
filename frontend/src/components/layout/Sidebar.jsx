import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext.jsx';

// آیکون ساده
const Icon = ({ children }) => <span className="text-lg">{children}</span>;

export default function Sidebar() {
  const { user, logout } = useUser();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  // تم اکنون توسط App بر اساس مسیر کنترل می‌شود

  const common = [
    { to: user?.userType === 'business' ? '/business-dashboard' : '/customer-dashboard', label: 'داشبورد', icon: '📊' },
  ];
  const business = [
    { to: '/offers', label: 'تخفیف‌ها', icon: '🎫' },
    { to: '/analytics', label: 'تحلیل', icon: '📈' },
  ];
  const customer = [
    { to: '/search', label: 'جستجو', icon: '🔍' },
  ];
  const sharedBottom = [
    { to: '/profile', label: 'پروفایل', icon: '👤' },
    { to: '/support', label: 'پشتیبانی', icon: '❓' }
  ];

  const nav = [
    ...common,
    ...(user?.userType === 'business' ? business : customer),
    ...sharedBottom
  ];

  return (
    <aside className={`h-screen sticky top-0 bg-surface-100 text-gray-200 border-l border-surface-300 flex flex-col transition-all duration-200 ${collapsed ? 'w-20' : 'w-60'}`} dir="rtl">
      <div className="flex items-center justify-between px-4 h-16 border-b border-surface-300">
        <div className="flex items-center gap-2 font-semibold text-white">
          <span className="bg-brand-500/20 text-brand-300 rounded-lg p-2">⚡</span>
          {!collapsed && <span>Faydo</span>}
        </div>
        <button onClick={() => setCollapsed(c => !c)} className="text-xs text-gray-400 hover:text-gray-200">{collapsed ? '»' : '«'}</button>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 space-y-1">
        {nav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `mx-3 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-brand-500/20 text-white' : 'text-gray-300 hover:bg-surface-400/40 hover:text-white'}`}
          >
            <Icon>{item.icon}</Icon>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-surface-300 space-y-3">
        {!collapsed && (
          <div className="bg-surface-50 rounded-lg p-3 text-xs text-gray-400 leading-relaxed">
            {user ? (
              <>وضعیت: {user.userType === 'business' ? 'کسب‌وکار' : 'مشتری'}<br/>امتیاز: {user.points}</>
            ) : 'وارد شوید'}
          </div>
        )}
  {/* دکمه تغییر تم حذف شد: فقط صفحات داشبورد تیره هستند */}
        {user && (
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg py-2"
          >
            خروج
          </button>
        )}
      </div>
    </aside>
  );
}
