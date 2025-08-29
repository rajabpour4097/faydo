import React from 'react';

const clubs = [
  { icon: '🏋️‍♀️', title: 'سلامت و فیتنس', desc: 'باشگاه‌ها و استودیوهای ورزشی' },
  { icon: '☕', title: 'کافه و رستوران', desc: 'تجربه طعم‌های متفاوت' },
  { icon: '🛍️', title: 'فروشگاهی', desc: 'برندهای محبوب خرید' },
  { icon: '🎮', title: 'سرگرمی', desc: 'تفریح و گیم' }
];

export default function ClubsSection() {
  return (
    <section className="py-20 bg-white" id="clubs">
      <div className="container-responsive">
        <h2 className="text-2xl font-bold mb-10">باشگاه‌ها</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {clubs.map(c => (
            <div key={c.title} className="rounded-xl border bg-gray-50 p-6 hover:shadow transition">
              <div className="text-3xl mb-4">{c.icon}</div>
              <h3 className="font-semibold mb-2">{c.title}</h3>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">{c.desc}</p>
              <button className="text-brand-600 text-sm font-medium">Explore →</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
