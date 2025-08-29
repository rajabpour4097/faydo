import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext.jsx';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    userType: 'customer' // 'customer' or 'business'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login, user, loading } = useUser();

  // هدایت خودکار در صورت ورود قبلی
  useEffect(() => {
    if (!loading && user) {
      navigate(user.userType === 'business' ? '/business-dashboard' : '/customer-dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(formData.username, formData.password, formData.userType);
      if (success) {
        // هدایت به داشبورد مناسب بر اساس نوع کاربر
        if (formData.userType === 'business') {
          navigate('/business-dashboard');
        } else {
          navigate('/customer-dashboard');
        }
      } else {
        setError('نام کاربری یا رمز عبور اشتباه است');
      }
    } catch (err) {
      setError('خطا در ورود. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Test credentials for demo
  const demoCredentials = {
    customer: { username: 'testcustomer', password: 'test123' },
    business: { username: 'testbusiness', password: 'test123' }
  };

  const fillDemoCredentials = (type) => {
    setFormData({
      username: demoCredentials[type].username,
      password: demoCredentials[type].password,
      userType: type
    });
  };

  // حالت بارگذاری اولیه context
  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-surface-200">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xs text-gray-500 dark:text-gray-400">در حال آماده‌سازی...</p>
        </div>
      </div>
    );
  }

  // اگر کاربر هست (redirect در effect انجام می‌شود) هیچ چیز رندر نکن تا از فلیکر جلوگیری شود
  if (user) return null;

  return (
    <div className="flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-surface-100 border border-transparent dark:border-surface-300 rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">ورود به فایدو</h1>
              <p className="text-gray-600 dark:text-gray-400">به حساب کاربری خود وارد شوید</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* نوع کاربری */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  نوع حساب کاربری
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, userType: 'customer' }))}
                    className={`p-4 border rounded-lg text-center transition-colors ${
                      formData.userType === 'customer'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400 dark:border-surface-300 dark:hover:border-surface-50'
                    }`}
                  >
                    <div className="text-2xl mb-2">👤</div>
                    <div className="font-medium text-sm">مشتری</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, userType: 'business' }))}
                    className={`p-4 border rounded-lg text-center transition-colors ${
                      formData.userType === 'business'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 hover:border-gray-400 dark:border-surface-300 dark:hover:border-surface-50'
                    }`}
                  >
                    <div className="text-2xl mb-2">🏢</div>
                    <div className="font-medium text-sm">کسب‌وکار</div>
                  </button>
                </div>
              </div>

              {/* نام کاربری */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  نام کاربری
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-surface-300 dark:bg-surface-50 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="نام کاربری خود را وارد کنید"
                  required
                />
              </div>

              {/* رمز عبور */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  رمز عبور
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-surface-300 dark:bg-surface-50 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="رمز عبور خود را وارد کنید"
                  required
                />
              </div>

              {/* دکمه ورود */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'در حال ورود...' : 'ورود'}
              </button>
            </form>

            <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            حساب کاربری ندارید؟{' '}
            <span className="text-blue-600 hover:text-blue-500 cursor-pointer font-medium" onClick={() => navigate('/register')}>ثبت نام</span>
          </p>
            </div>
        </div>
      </div>
    </div>
  );
}
