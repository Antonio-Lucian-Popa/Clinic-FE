import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from './components/ui/sonner';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ClinicSetupPage from './pages/ClinicSetupPage';
import InvitationPage from './pages/InvitationPage';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Calendar from './pages/Calendar';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import ClinicStatusChecker from './components/Auth/ClinicStatusChecker';
import './App.css';
import ProfileEditPage from './pages/ProfileEditPage';
import { ClinicProvider } from './contexts/ClinicContex';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <AuthProvider>
          <ClinicProvider>
            <Router>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Profile edit route for Google users */}
                <Route
                  path="/profile-edit"
                  element={
                    <ProtectedRoute>
                      <ProfileEditPage />
                    </ProtectedRoute>
                  }
                />

                {/* Clinic setup routes */}
                <Route
                  path="/clinic-setup"
                  element={
                    <ProtectedRoute>
                      <ClinicSetupPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/invitation"
                  element={
                    <ProtectedRoute>
                      <InvitationPage />
                    </ProtectedRoute>
                  }
                />

                {/* Protected routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <ClinicStatusChecker>
                        <Layout>
                          <Dashboard />
                        </Layout>
                      </ClinicStatusChecker>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <ClinicStatusChecker>
                        <Layout>
                          <Dashboard />
                        </Layout>
                      </ClinicStatusChecker>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patients"
                  element={
                    <ProtectedRoute>
                      <ClinicStatusChecker>
                        <Layout>
                          <Patients />
                        </Layout>
                      </ClinicStatusChecker>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/appointments"
                  element={
                    <ProtectedRoute>
                      <ClinicStatusChecker>
                        <Layout>
                          <Appointments />
                        </Layout>
                      </ClinicStatusChecker>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/calendar"
                  element={
                    <ProtectedRoute>
                      <ClinicStatusChecker>
                        <Layout>
                          <Calendar />
                        </Layout>
                      </ClinicStatusChecker>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ClinicStatusChecker>
                        <Layout>
                          <Profile />
                        </Layout>
                      </ClinicStatusChecker>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <ClinicStatusChecker>
                        <Layout>
                          <Settings />
                        </Layout>
                      </ClinicStatusChecker>
                    </ProtectedRoute>
                  }
                />

                {/* Redirect */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
              <Toaster />
            </Router>
          </ClinicProvider>
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;