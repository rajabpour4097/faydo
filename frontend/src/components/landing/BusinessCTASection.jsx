import React from 'react';

export default function BusinessCTASection() {
  return (
    <section id="business" className="py-24 bg-gradient-to-r from-brand-600 to-brand-700 text-white">
      <div className="container-responsive grid gap-8 md:grid-cols-2 items-center">
        <div>
          <h2 className="text-2xl font-bold mb-4">کسب‌وکار خود را به فایدو اضافه کنید</h2>
          <p className="text-sm text-brand-100 leading-relaxed mb-6">به صدها کسب‌وکار بپیوندید، مشتریان وفادار جذب کنید و تحلیل‌های دقیق دریافت نمایید.</p>
          <button className="rounded bg-white text-brand-700 font-semibold px-6 py-3 text-sm hover:bg-brand-50">شروع رایگان</button>
        </div>
        <div className="rounded-xl bg-white/10 border border-white/20 h-48 flex items-center justify-center">(گراف آمار)</div>
      </div>
    </section>
  );
}
