import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { levelFromPoints, progressToNextLevel } from '../utils/levels.js';
import { dashboardService, userService, authService } from '../services/api.js';

const UserContext = createContext();

// حذف mock users: اکنون از بک‌اند واقعی استفاده می‌کنیم

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // بارگذاری داده‌های کاربر در شروع
  useEffect(() => {
    restoreSession();
    loadDashboardData();
  }, []);

  // بازیابی نشست از localStorage
  const restoreSession = async () => {
    try {
  const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');
      if (!token) return;
      const { data } = await userService.getMe();
      // تلاش برای بارگذاری پروفایل جهت امتیاز و سطح
      let profilePoints = 0;
      try {
        const dashboard = await dashboardService.getData();
        profilePoints = dashboard.user_profile?.points || 0;
      } catch {}
      setUser({
        id: data.id,
        name: data.first_name || data.username,
        points: profilePoints,
        userType: localStorage.getItem('userType') || 'customer'
      });
    } catch (e) {
      console.warn('بازیابی نشست ناموفق بود');
    }
  };

  const loadDashboardData = async () => {
    // اگر توکنی نیست کاربر وارد نشده است → داده‌ای بارگیری نکن
    if (!localStorage.getItem('authToken')) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getData();
      setDashboardData(data);
      if (data.user_profile) {
        setUser(prev => ({
          ...prev,
          id: data.user_profile.user.id,
          name: `${data.user_profile.user.first_name} ${data.user_profile.user.last_name}`.trim() || data.user_profile.user.username,
          points: data.user_profile.points,
          interests: data.user_profile.interests || [],
          achievements: data.user_profile.achievements || [],
          savedDiscounts: prev?.savedDiscounts || []
        }));
      }
    } catch (err) {
      console.warn('عدم موفقیت در دریافت داشبورد (در حالت بدون بک‌اند واقعی قابل چشم‌پوشی است)');
      setError(''); // عدم نمایش ارور در حالت دمو
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updates) => {
    try {
      await userService.updateProfile(updates);
      setUser(prev => ({ ...prev, ...updates }));
      // بارگذاری مجدد داده‌های داشبورد
      await loadDashboardData();
    } catch (err) {
      console.error('خطا در بروزرسانی کاربر:', err);
      throw err;
    }
  };

  const login = async (username, password, userType = 'customer') => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await authService.login(username, password);
  localStorage.setItem('authToken', data.access);
  localStorage.setItem('accessToken', data.access);
  localStorage.setItem('refreshToken', data.refresh);
      const me = await userService.getMe();
      const dash = await dashboardService.getData();
      const backendUserType = dash?.user_profile?.user_type || userType;
      localStorage.setItem('userType', backendUserType);
      setUser({
        id: me.data.id,
        name: me.data.first_name || me.data.username,
        points: dash.user_profile?.points || 0,
        userType: backendUserType
      });
      return true;
    } catch (err) {
      console.error('خطا در ورود:', err);
      setError('نام کاربری یا رمز عبور اشتباه است');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
  localStorage.removeItem('userType');
  localStorage.removeItem('refreshToken');
    setUser(null);
    setDashboardData(null);
  };

  const value = useMemo(() => {
    const level = user ? levelFromPoints(user.points || 0) : null;
    const progress = user ? progressToNextLevel(user.points || 0) : null;
    
    return {
      user,
      setUser: updateUser,
      login,
      logout,
      level,
      progress,
      dashboardData,
      loading,
      error,
      refreshDashboard: loadDashboardData
    };
  }, [user, dashboardData, loading, error]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
