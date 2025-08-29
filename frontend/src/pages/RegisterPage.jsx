import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api.js';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    password: '',
    password2: '',
    email: '',
    first_name: '',
    last_name: '',
    user_type: 'customer',
    business_type: '', // natural | legal
    company_name: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (form.password !== form.password2) {
      setError('رمز عبور و تکرار آن یکسان نیست');
      return;
    }
    try {
      setIsLoading(true);
      const payload = { ...form };
      delete payload.password2;
      if (form.user_type==='business' && !form.business_type) {
        setError('لطفاً نوع کسب‌وکار (حقیقی/حقوقی) را انتخاب کنید');
        return;
      }
      if (form.user_type==='business' && form.business_type==='legal' && !form.company_name) {
        setError('نام شرکت الزامی است');
        return;
      }
      const { data } = await authService.register(payload);
      // می‌توانیم مستقیماً وارد کنیم؛ فعلاً هدایت به صفحه ورود
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      const apiErr = err.response?.data;
      setError(apiErr?.error || apiErr?.detail || 'خطا در ثبت نام');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        <div className="bg-white dark:bg-surface-100 border border-transparent dark:border-surface-300 rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">ثبت نام در فایدو</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">حساب جدید بسازید و از مزایا استفاده کنید</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm">ثبت نام موفق! هدایت...</p>
            </div>
          )}

          <form onSubmit={submit} className="space-y-6">
            {/* نوع کاربری */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">نوع حساب</label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setForm(p => ({ ...p, user_type: 'customer', business_type: '', company_name: '' }))} className={`p-4 border rounded-lg text-center transition-colors ${form.user_type==='customer'? 'border-blue-500 bg-blue-50 text-blue-700':'border-gray-300 dark:border-surface-300 hover:border-gray-400'}`}>
                  <div className="text-2xl mb-2">👤</div>
                  <div className="text-xs font-medium">مشتری</div>
                </button>
                <button type="button" onClick={() => setForm(p => ({ ...p, user_type: 'business' }))} className={`p-4 border rounded-lg text-center transition-colors ${form.user_type==='business'? 'border-green-500 bg-green-50 text-green-700':'border-gray-300 dark:border-surface-300 hover:border-gray-400'}`}>
                  <div className="text-2xl mb-2">🏢</div>
                  <div className="text-xs font-medium">کسب‌وکار</div>
                </button>
              </div>
            </div>

            {form.user_type === 'business' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">نوع کسب‌وکار</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setForm(p => ({ ...p, business_type: 'natural' }))} className={`p-4 border rounded-lg text-center transition-colors ${form.business_type==='natural'? 'border-purple-500 bg-purple-50 text-purple-700':'border-gray-300 dark:border-surface-300 hover:border-gray-400'}`}>
                    <div className="text-2xl mb-2">🧑‍💼</div>
                    <div className="text-xs font-medium">حقیقی</div>
                  </button>
                  <button type="button" onClick={() => setForm(p => ({ ...p, business_type: 'legal' }))} className={`p-4 border rounded-lg text-center transition-colors ${form.business_type==='legal'? 'border-indigo-500 bg-indigo-50 text-indigo-700':'border-gray-300 dark:border-surface-300 hover:border-gray-400'}`}>
                    <div className="text-2xl mb-2">🏛️</div>
                    <div className="text-xs font-medium">حقوقی</div>
                  </button>
                </div>
                <p className="text-[11px] mt-2 text-gray-500">اگر کسب‌وکار حقوقی است نام شرکت را وارد کنید؛ اگر حقیقی است نام و نام خانوادگی را کامل کنید.</p>
              </div>
            )}

            {form.user_type === 'business' && form.business_type === 'legal' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">نام شرکت *</label>
                <input name="company_name" required value={form.company_name} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-surface-300 dark:bg-surface-50 rounded-lg text-sm" placeholder="شرکت ..." />
              </div>
            )}

            {(form.user_type !== 'business' || form.business_type === 'natural') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">نام{form.user_type==='business'?' *':''}</label>
                  <input name="first_name" value={form.first_name} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-surface-300 dark:bg-surface-50 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">نام خانوادگی{form.user_type==='business'?' *':''}</label>
                  <input name="last_name" value={form.last_name} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-surface-300 dark:bg-surface-50 rounded-lg text-sm" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">نام کاربری *</label>
              <input required name="username" value={form.username} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-surface-300 dark:bg-surface-50 rounded-lg text-sm" placeholder="username" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ایمیل *</label>
              <input type="email" required name="email" value={form.email} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-surface-300 dark:bg-surface-50 rounded-lg text-sm" placeholder="you@example.com" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">رمز عبور *</label>
                <input type="password" required name="password" value={form.password} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-surface-300 dark:bg-surface-50 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">تکرار رمز *</label>
                <input type="password" required name="password2" value={form.password2} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-surface-300 dark:bg-surface-50 rounded-lg text-sm" />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg text-sm font-medium disabled:opacity-50">
              {isLoading ? 'در حال ثبت...' : 'ثبت نام'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            حساب دارید؟{' '}
            <span onClick={() => navigate('/login')} className="text-blue-600 hover:text-blue-500 cursor-pointer font-medium">ورود</span>
          </div>
        </div>
      </div>
    </div>
  );
}
