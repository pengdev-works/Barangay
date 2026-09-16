import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

// Public pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import VerifyCertificatePage from './pages/certificates/VerifyCertificatePage';

// Core pages
import DashboardPage from './pages/DashboardPage';
import ResidentsPage from './pages/residents/ResidentsPage';
import HouseholdsPage from './pages/households/HouseholdsPage';
import CertificatesPage from './pages/certificates/CertificatesPage';
import ComplaintsPage from './pages/complaints/ComplaintsPage';
import BlotterPage from './pages/blotter/BlotterPage';
import AnnouncementsPage from './pages/announcements/AnnouncementsPage';
import EventsPage from './pages/events/EventsPage';
import HealthPage from './pages/health/HealthPage';
import AssistancePage from './pages/assistance/AssistancePage';
import ReportsPage from './pages/reports/ReportsPage';
import AuditPage from './pages/audit/AuditPage';
import UsersPage from './pages/users/UsersPage';
import SettingsPage from './pages/settings/SettingsPage';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { borderRadius: '12px', fontSize: '14px' },
              success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/verify-certificate/:id" element={<VerifyCertificatePage />} />

            {/* All Roles */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/announcements" element={<AnnouncementsPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/certificates" element={<CertificatesPage />} />
                <Route path="/complaints" element={<ComplaintsPage />} />
                <Route path="/assistance" element={<AssistancePage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>

            {/* Staff and above */}
            <Route element={<ProtectedRoute allowedRoles={['Super Admin', 'Barangay Captain', 'Barangay Staff']} />}>
              <Route element={<MainLayout />}>
                <Route path="/residents" element={<ResidentsPage />} />
                <Route path="/households" element={<HouseholdsPage />} />
                <Route path="/blotter" element={<BlotterPage />} />
                <Route path="/health" element={<HealthPage />} />
              </Route>
            </Route>

            {/* Captain and above */}
            <Route element={<ProtectedRoute allowedRoles={['Super Admin', 'Barangay Captain']} />}>
              <Route element={<MainLayout />}>
                <Route path="/reports" element={<ReportsPage />} />
              </Route>
            </Route>

            {/* Super Admin only */}
            <Route element={<ProtectedRoute allowedRoles={['Super Admin']} />}>
              <Route element={<MainLayout />}>
                <Route path="/users" element={<UsersPage />} />
                <Route path="/audit" element={<AuditPage />} />
              </Route>
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
