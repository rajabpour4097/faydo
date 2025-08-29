import React from 'react';
import { useUser } from '../../context/UserContext.jsx';

export default function ProfileHeader() {
  const { user } = useUser();
  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 rounded-xl border border-surface-300 bg-surface-50 p-6 text-gray-100">
      <div className="h-24 w-24 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center font-bold text-xl shadow-inner">{user.name[0]}</div>
      <div className="space-y-2 text-center sm:text-right">
        <h2 className="text-lg font-semibold text-gray-100">{user.name}</h2>
        <p className="text-xs text-gray-500">علایق: {user.interests.join(', ')}</p>
      </div>
    </div>
  );
}
