import React, { useState } from 'react';

export default function ReviewForm({ onAdd }) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  function submit(e){
    e.preventDefault();
    if(!text) return;
    onAdd({ id: Date.now(), user:'شما', rating, text, likes:0, replies:[] });
    setText('');
  }
  const base = 'rounded-md border border-surface-300 bg-surface-50 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/40';
  return (
    <form onSubmit={submit} className="rounded-xl border border-surface-300 bg-surface-100 p-5 flex flex-col gap-3 text-xs">
      <h3 className="text-sm font-semibold text-gray-100">ثبت نظر</h3>
      <div className="flex items-center gap-2 text-gray-300">امتیاز:
        <select value={rating} onChange={e=>setRating(Number(e.target.value))} className={`${base} px-2 py-1 text-xs`}> 
          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      <textarea value={text} onChange={e=>setText(e.target.value)} className={`${base} h-24 resize-none`} placeholder="نظر شما" />
      <button className="self-start rounded-md bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 text-xs transition">ارسال</button>
    </form>
  );
}
