import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext.jsx';

const DASHBOARD_PREFIXES = ['/dashboard','/business-dashboard','/customer-dashboard','/offers','/analytics','/search','/profile','/support'];

export default function Header() {
  const { user, level, logout } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const inDashboard = DASHBOARD_PREFIXES.some(p => location.pathname.startsWith(p));

  if (inDashboard) {
    return (
      <div className="h-14 flex items-center justify-between px-4 md:px-6 border-b border-surface-300 bg-white/70 dark:bg-surface-100/60 backdrop-blur z-30 sticky top-0">
        <div className="flex items-center gap-3 flex-1">
          <div className="hidden md:flex relative flex-1">
            <input
              placeholder="جستجو..."
              className="w-full bg-gray-100 dark:bg-surface-50/60 border border-surface-300 rounded-lg py-2 pl-3 pr-10 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user && user.userType === 'customer' && (
            <span className="text-xs bg-brand-500/20 text-brand-300 px-3 py-1 rounded-full">{level?.name || 'برنزی'} · {user.points} امتیاز</span>
          )}
          {user && user.userType === 'business' && (
            <span className="text-xs bg-green-500/20 text-green-300 px-3 py-1 rounded-full">کسب‌وکار</span>
          )}
          {user && (
            <button onClick={()=> { logout(); navigate('/'); }} className="text-[11px] px-3 py-1 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition">خروج</button>
          )}
        </div>
      </div>
    );
  }

  // Public header
  const nav = [
    { to: '/', label: 'خانه' },
    { to: '/about', label: 'درباره ما' },
    { to: '/contact', label: 'ارتباط با ما' }
  ];

  return (
    <header className="h-16 flex items-center px-6 md:px-10 bg-white/80 dark:bg-surface-100/70 backdrop-blur border-b border-gray-200 dark:border-surface-300 sticky top-0 z-40">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto gap-8">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-bold text-lg text-brand-600 dark:text-brand-400">Faydo</Link>
          <nav className="hidden md:flex items-center gap-2 text-sm">
            {nav.map(item => (
              <Link key={item.to} to={item.to} className={`px-3 py-2 rounded-md hover:text-brand-600 dark:hover:text-brand-400 transition ${location.pathname===item.to ? 'text-brand-600 dark:text-brand-400 font-medium' : 'text-gray-600 dark:text-gray-300'}`}>{item.label}</Link>
            ))}
            {user ? (
              <Link to={user.userType==='business'? '/business-dashboard':'/customer-dashboard'} className="px-3 py-2 rounded-md bg-brand-600 hover:bg-brand-500 text-white transition">داشبورد</Link>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 rounded-md bg-brand-600 hover:bg-brand-500 text-white transition">ورود</Link>
                <Link to="/register" className="px-3 py-2 rounded-md border border-brand-600 text-brand-600 hover:bg-brand-50 dark:hover:bg-surface-50 rounded-md transition">ثبت نام</Link>
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          {!user && (
            <>
              <Link to="/login" className="md:hidden px-3 py-1.5 text-xs rounded-md bg-brand-600 text-white">ورود</Link>
              <Link to="/register" className="md:hidden px-3 py-1.5 text-xs rounded-md border border-brand-600 text-brand-600">ثبت نام</Link>
            </>
          )}
          {user && (
            <Link to={user.userType==='business'? '/business-dashboard':'/customer-dashboard'} className="md:hidden px-3 py-1.5 text-xs rounded-md bg-brand-600 text-white">داشبورد</Link>
          )}
        </div>
      </div>
    </header>
  );
}

