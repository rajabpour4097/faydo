import React, { useState } from 'react';

export default function ReviewItem({ review, onUpdate }) {
  const [reply, setReply] = useState('');
  function like(){ onUpdate(review.id, r => ({ ...r, likes: r.likes + 1 })); }
  function addReply(e){ e.preventDefault(); if(!reply) return; onUpdate(review.id, r=> ({...r, replies:[...r.replies, { id:Date.now(), text:reply }] })); setReply(''); }
  const input = 'flex-1 rounded-md border border-surface-300 bg-surface-50 text-gray-100 placeholder-gray-500 px-2 py-1 text-[11px] focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/40';
  return (
    <div className="rounded-xl border border-surface-300 bg-surface-100 p-4 text-xs">
      <div className="flex justify-between mb-1"><span className="font-semibold text-sm text-gray-100">{review.user}</span><span className="text-brand-400">{'★'.repeat(review.rating)}</span></div>
      <p className="text-gray-400 mb-2 leading-relaxed">{review.text}</p>
      <div className="flex items-center gap-3 mb-2">
        <button onClick={like} className="text-[11px] rounded-md bg-surface-50/60 hover:bg-surface-50 text-gray-300 px-2 py-1 transition">لایک ({review.likes})</button>
      </div>
      <form onSubmit={addReply} className="flex gap-2 mb-2">
        <input value={reply} onChange={e=>setReply(e.target.value)} placeholder="پاسخ" className={input} />
        <button className="rounded-md bg-brand-600 hover:bg-brand-500 text-white px-3 text-[11px] transition">ارسال</button>
      </form>
      {review.replies.length>0 && (
        <ul className="mt-2 space-y-1 pl-3 border-r border-surface-300">
          {review.replies.map(rep => <li key={rep.id} className="text-[11px] text-gray-500">↳ {rep.text}</li>)}
        </ul>
      )}
    </div>
  );
}
