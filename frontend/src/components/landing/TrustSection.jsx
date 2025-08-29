import React from 'react';

const testimonials = [
  { id:1, name:'سارا', text:'فایدو باعث شد مشتریان ما بیشتر برگردند.' },
  { id:2, name:'مهدی', text:'سیستم امتیازدهی خیلی جذابه و ساده.' },
  { id:3, name:'نگار', text:'پنل مدیریتی واضح و کاربردیه.' }
];

export default function TrustSection() {
  return (
    <section className="py-24 bg-white">
      <div className="container-responsive">
        <h2 className="text-2xl font-bold mb-10">اعتماد کسب‌وکارها</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map(t => (
            <div key={t.id} className="rounded-xl border bg-gray-50 p-6 text-sm leading-relaxed">
              <p className="mb-4 text-gray-700">“{t.text}”</p>
              <div className="text-xs font-medium text-brand-600">{t.name}</div>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap gap-6 opacity-70 text-gray-400 text-xs">
          <span>Brand A</span><span>Brand B</span><span>Brand C</span><span>Brand D</span>
        </div>
      </div>
    </section>
  );
}
