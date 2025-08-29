import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Router from './router.jsx';
import Header from './components/layout/Header.jsx';
import Footer from './components/layout/Footer.jsx';
import Sidebar from './components/layout/Sidebar.jsx';
import { useUser } from './context/UserContext.jsx';

export default function App() {
  const location = useLocation();
  const { user } = useUser();
  const DASHBOARD_PREFIXES = ['/dashboard','/business-dashboard','/customer-dashboard','/offers','/analytics','/search','/profile','/support'];

  // اعمال تم تیره فقط روی مسیرهای داشبورد
  useEffect(() => {
    const isDashboard = DASHBOARD_PREFIXES.some(p => location.pathname.startsWith(p));
    const root = document.documentElement;
    if (isDashboard) root.classList.add('dark'); else root.classList.remove('dark');
  }, [location.pathname]);

  // مسیرهایی که نباید سایدبار داشته باشند (عمومی)
  const noSidebarRoutes = ['/', '/login', '/register'];
  const hideSidebar = noSidebarRoutes.includes(location.pathname);
  const showSidebar = !hideSidebar && user; // فقط وقتی کاربر وارد شده باشد

  return (
    <div className="min-h-screen flex bg-white dark:bg-surface-200 text-gray-900 dark:text-gray-100" dir="rtl">
      {showSidebar && <Sidebar />}
      <div className="flex flex-col flex-1 min-w-0">
        <Header />
        <main className={`flex-1 p-4 md:p-6 bg-gray-50 dark:bg-surface-200/80 min-h-screen ${!showSidebar ? 'pt-6 md:pt-8' : ''}`}>
          <Router />
        </main>
        <Footer />
      </div>
    </div>
  );
}
