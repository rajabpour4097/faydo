import React from 'react';
import { useUser } from '../../context/UserContext.jsx';

export default function Achievements() {
  const { user } = useUser();
  const medals = user.achievements.length ? user.achievements : ['starter'];
  return (
    <div className="rounded-xl border border-surface-300 bg-surface-50 p-5">
      <h3 className="text-sm font-semibold mb-3 text-gray-100">مدال‌ها</h3>
      <div className="flex flex-wrap gap-2 text-xs">
        {medals.map(m => <span key={m} className="rounded-full bg-brand-500/15 text-brand-300 px-3 py-1">{m}</span>)}
      </div>
    </div>
  );
}
