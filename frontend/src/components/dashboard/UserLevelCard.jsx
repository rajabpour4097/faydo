import React from 'react';
import { useUser } from '../../context/UserContext.jsx';

export default function UserLevelCard() {
  const { user, level } = useUser();
  return (
    <div className="rounded-xl border bg-white p-5 flex flex-col gap-2">
      <h3 className="text-sm font-semibold">سلام {user.name.split(' ')[0]}</h3>
      <p className="text-xs text-gray-500">سطح فعلی: {level.name}</p>
      <div className="text-xs"><span className="font-medium">امتیاز:</span> {user.points}</div>
    </div>
  );
}
