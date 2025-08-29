import React, { useState } from 'react';

export default function TicketForm() {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  function submit(e){
    e.preventDefault();
    if(!subject || !body) return;
    alert('تیکت ثبت شد (Mock)');
    setSubject('');
    setBody('');
  }
  const input = 'rounded-md border border-surface-300 bg-surface-50 text-gray-100 placeholder-gray-500 px-3 py-2 text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/40';
  return (
    <form onSubmit={submit} className="rounded-xl border border-surface-300 bg-surface-100 p-5 flex flex-col gap-3 text-xs">
      <h3 className="text-sm font-semibold text-gray-100">ارسال تیکت</h3>
      <input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="موضوع" className={input} />
      <textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="شرح مشکل" className={`${input} h-28 resize-none`} />
      <button className="self-start rounded-md bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 text-xs transition">ارسال</button>
    </form>
  );
}
