import React from 'react';

const items = [
  { label: 'باشگاه‌ها', to: '/#clubs' },
  { label: 'تاریخچه', to: '#' },
  { label: 'پشتیبانی', to: '/support' }
];

export default function QuickAccessMenu() {
  return (
    <div className="rounded-xl border bg-white p-5 flex flex-col gap-3">
      <h3 className="text-sm font-semibold">دسترسی سریع</h3>
      <div className="flex flex-wrap gap-2">
        {items.map(i => <a key={i.label} href={i.to} className="rounded border px-3 py-1 text-[11px] hover:bg-gray-100">{i.label}</a>)}
      </div>
    </div>
  );
}
