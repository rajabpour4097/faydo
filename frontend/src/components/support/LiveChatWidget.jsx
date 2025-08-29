import React from 'react';

export default function LiveChatWidget() {
  return (
    <div className="rounded-xl border border-surface-300 bg-surface-100 p-5 text-xs flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-gray-100">چت زنده</h3>
      <p className="text-gray-400">(جایگاه چت / socket در آینده پیاده می‌شود)</p>
      <button className="self-start rounded-md bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 text-xs transition">شروع گفت‌وگو</button>
    </div>
  );
}
