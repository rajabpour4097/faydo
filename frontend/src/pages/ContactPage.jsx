import React, { useState } from 'react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const submit = e => { e.preventDefault(); if(!form.name || !form.email || !form.message) return; setSent(true); setTimeout(()=> setSent(false), 4000); setForm({ name:'', email:'', message:'' }); };
  return (
    <div className="max-w-4xl mx-auto py-16 px-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">ارتباط با ما</h1>
      <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">پیشنهاد، سؤال یا درخواست همکاری دارید؟ فرم زیر را پر کنید؛ پاسخ شما حداکثر ظرف ۱ کار روزی ارسال می‌شود.</p>
      <form onSubmit={submit} className="space-y-5 bg-white dark:bg-surface-100 border border-gray-200 dark:border-surface-300 rounded-xl p-6 text-sm">
        <div className="grid md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">نام</span>
            <input name="name" value={form.name} onChange={change} className="rounded-md border border-gray-300 dark:border-surface-300 bg-gray-50 dark:bg-surface-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/40 text-gray-900 dark:text-gray-100" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">ایمیل</span>
            <input name="email" value={form.email} onChange={change} type="email" className="rounded-md border border-gray-300 dark:border-surface-300 bg-gray-50 dark:bg-surface-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/40 text-gray-900 dark:text-gray-100" />
          </label>
        </div>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">پیام</span>
          <textarea name="message" value={form.message} onChange={change} rows={5} className="rounded-md border border-gray-300 dark:border-surface-300 bg-gray-50 dark:bg-surface-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/40 resize-none text-gray-900 dark:text-gray-100" />
        </label>
        {sent && <p className="text-green-600 dark:text-green-400 text-xs">پیام شما ارسال شد (Mock)</p>}
        <button className="px-5 py-2.5 rounded-md bg-brand-600 hover:bg-brand-500 text-white text-sm transition">ارسال</button>
      </form>
    </div>
  );
}
