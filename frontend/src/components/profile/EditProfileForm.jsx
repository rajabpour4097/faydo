import React, { useState } from 'react';
import { useUser } from '../../context/UserContext.jsx';

export default function EditProfileForm() {
  const { user, setUser } = useUser();
  const [interests, setInterests] = useState(user?.interests?.join(', ') || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!user) {
    return (
      <div className="rounded-xl border border-surface-300 bg-surface-100 p-5 text-center">
        <p className="text-sm text-gray-400">در حال بارگذاری...</p>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const updates = {
        interests: interests.split(',').map(s => s.trim()).filter(Boolean)
      };
      await setUser(updates);
      setMessage('پروفایل با موفقیت بروزرسانی شد');
    } catch (err) {
      console.error(err);
      setMessage('خطا در بروزرسانی پروفایل');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  }

  const inputClass = 'rounded-md border border-surface-300 bg-surface-50 text-gray-100 placeholder-gray-500 px-3 py-2 text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/40';

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-surface-300 bg-surface-100 p-5 flex flex-col gap-4 text-xs">
      <h3 className="text-sm font-semibold text-gray-100">ویرایش پروفایل</h3>

      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-gray-400">نام</label>
        <input value={user.name || ''} disabled className={`${inputClass} opacity-60 cursor-not-allowed`} placeholder="نام" />
        <span className="text-[10px] text-gray-500">نام از طریق تنظیمات حساب کاربری قابل تغییر است</span>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-gray-400">علایق (جدا شده با ,)</label>
        <input
          value={interests}
          onChange={e => setInterests(e.target.value)}
          className={inputClass}
          placeholder="fitness, food, shopping"
        />
      </div>

      {message && (
        <p className={`text-xs ${message.includes('خطا') ? 'text-red-400' : 'text-green-400'}`}>{message}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="self-start rounded-md bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white px-4 py-2 text-xs transition"
      >
        {loading ? 'در حال ذخیره…' : 'ذخیره'}
      </button>
    </form>
  );
}
