import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext.jsx';

// props: children, role (optional: 'business' | 'customer')
export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-200">
        <div className="text-center text-gray-300 text-sm">در حال بارگذاری...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.userType !== role) {
    // هدایت به داشبورد صحیح اگر نقش متفاوت است
    return <Navigate to={user.userType === 'business' ? '/business-dashboard' : '/customer-dashboard'} replace />;
  }

  return children;
}