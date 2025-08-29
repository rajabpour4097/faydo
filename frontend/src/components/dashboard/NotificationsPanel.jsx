import React from 'react';
import { useUser } from '../../context/UserContext.jsx';

export default function NotificationsPanel() {
  const { dashboardData } = useUser();
  const notifications = dashboardData?.notifications || [];

  return (
    <div className="rounded-xl border bg-white p-5 flex flex-col gap-3">
      <h3 className="text-sm font-semibold">نوتیفیکیشن‌ها</h3>
      {notifications.length > 0 ? (
        <ul className="space-y-2 text-xs text-gray-600">
          {notifications.map((n, i) => (
            <li key={n.id || i} className="rounded bg-gray-100 px-3 py-2">
              <div className="font-medium text-gray-800 mb-1">{n.title}</div>
              <div>{n.message}</div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-gray-500">هیچ نوتیفیکیشن جدیدی ندارید</p>
      )}
    </div>
  );
}
