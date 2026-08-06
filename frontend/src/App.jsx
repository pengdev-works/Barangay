import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ResidentsPage from './pages/residents/ResidentsPage';
import CertificatesPage from './pages/certificates/CertificatesPage';
import AnnouncementsPage from './pages/announcements/AnnouncementsPage';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Toaster position="top-right" />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Protected App Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/residents" element={<ResidentsPage />} />
                <Route path="/certificates" element={<CertificatesPage />} />
                <Route path="/announcements" element={<AnnouncementsPage />} />
                
                {/* Fallback routes redirecting to dashboard */}
                <Route path="/households" element={<DashboardPage />} />
                <Route path="/complaints" element={<DashboardPage />} />
                <Route path="/blotter" element={<DashboardPage />} />
                <Route path="/events" element={<DashboardPage />} />
                <Route path="/health" element={<DashboardPage />} />
                <Route path="/assistance" element={<DashboardPage />} />
                <Route path="/reports" element={<DashboardPage />} />
                <Route path="/audit" element={<DashboardPage />} />
                <Route path="/settings" element={<DashboardPage />} />
              </Route>
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
