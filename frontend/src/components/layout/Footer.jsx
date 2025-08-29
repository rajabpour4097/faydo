import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-16 bg-gray-900 text-gray-300">
      <div className="container-responsive py-12 grid gap-8 md:grid-cols-4 text-sm">
        <div>
          <h3 className="text-white font-semibold mb-3">فایدو</h3>
          <p className="leading-relaxed text-gray-400">باشگاه مشتریان و پلتفرم تخفیف و وفاداری برای کسب‌وکارها.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">لینک‌ها</h4>
          <ul className="space-y-1">
            <li><a href="#" className="hover:text-white">قوانین</a></li>
            <li><a href="#" className="hover:text-white">حریم خصوصی</a></li>
            <li><a href="#" className="hover:text-white">تماس</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">شبکه‌های اجتماعی</h4>
          <ul className="space-y-1">
            <li><a href="#" className="hover:text-white">اینستاگرام</a></li>
            <li><a href="#" className="hover:text-white">لینکدین</a></li>
            <li><a href="#" className="hover:text-white">تلگرام</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">خبرنامه</h4>
            <form className="flex gap-2">
              <input className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500" placeholder="ایمیل شما" />
              <button className="rounded bg-brand-600 px-4 text-xs text-white hover:bg-brand-500">ارسال</button>
            </form>
        </div>
      </div>
      <div className="border-t border-gray-700 py-4 text-center text-xs text-gray-500">© {new Date().getFullYear()} Faydo</div>
    </footer>
  );
}
