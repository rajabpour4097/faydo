import React from 'react';
import { useUser } from '../../context/UserContext.jsx';

export default function ProgressBar() {
  const { progress } = useUser();
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="flex justify-between text-xs mb-2"><span>پیشرفت سطح</span><span>{progress.percent}%</span></div>
      <div className="h-2 rounded bg-gray-200 overflow-hidden">
        <div className="h-full bg-brand-600 transition-all" style={{ width: `${progress.percent}%` }} />
      </div>
      {progress.remaining > 0 && <p className="mt-2 text-[11px] text-gray-500">فقط {progress.remaining} امتیاز تا سطح بعدی</p>}
    </div>
  );
}
