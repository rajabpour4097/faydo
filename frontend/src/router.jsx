import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import BusinessDashboard from './pages/BusinessDashboard.jsx';
import CustomerDashboard from './pages/CustomerDashboard.jsx';
import OffersManagement from './pages/OffersManagement.jsx';
import Analytics from './pages/Analytics.jsx';
import SearchOffers from './pages/SearchOffers.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SupportPage from './pages/SupportPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import NotFound from './pages/NotFound.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import ProtectedRoute from './components/layout/ProtectedRoute.jsx';

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  <Route path="/about" element={<AboutPage />} />
  <Route path="/contact" element={<ContactPage />} />
  <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
  <Route path="/business-dashboard" element={<ProtectedRoute role="business"><BusinessDashboard /></ProtectedRoute>} />
  <Route path="/customer-dashboard" element={<ProtectedRoute role="customer"><CustomerDashboard /></ProtectedRoute>} />
  <Route path="/offers" element={<ProtectedRoute role="business"><OffersManagement /></ProtectedRoute>} />
  <Route path="/analytics" element={<ProtectedRoute role="business"><Analytics /></ProtectedRoute>} />
  <Route path="/search" element={<ProtectedRoute role="customer"><SearchOffers /></ProtectedRoute>} />
  <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
  <Route path="/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
