import React, { useState } from 'react';

const faqs = [
  { q:'فایدو چیست؟', a:'پلتفرم وفاداری و تخفیف برای مشتریان و کسب‌وکارها.' },
  { q:'عضویت چطور است؟', a:'ثبت نام سریع و رایگان است.' }
];

export default function FAQAccordion() {
  const [open, setOpen] = useState(null);
  return (
    <div className="rounded-xl border border-surface-300 bg-surface-100 divide-y divide-surface-300/60">
      {faqs.map((f,i)=>(
        <div key={i}>
          <button onClick={()=>setOpen(o=>o===i?null:i)} className="w-full text-right px-5 py-4 text-sm flex justify-between items-center text-gray-100 hover:bg-surface-50/60 transition">
            <span>{f.q}</span><span className="text-xs text-gray-400">{open===i?'-':'+'}</span>
          </button>
          {open===i && <div className="px-5 pb-4 text-xs text-gray-400 leading-relaxed">{f.a}</div>}
        </div>
      ))}
    </div>
  );
}
