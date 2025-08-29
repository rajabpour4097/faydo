import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound(){
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
      <h1 className="text-5xl font-bold text-brand-600">404</h1>
      <p className="text-sm text-gray-500">صفحه مورد نظر یافت نشد.</p>
      <Link to="/" className="rounded bg-brand-600 text-white px-6 py-2 text-sm">بازگشت</Link>
    </div>
  );
}
