import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import TeacherManagement from './pages/admin/TeacherManagement';
import PositionManagement from './pages/admin/PositionManagement';
import PeriodManagement from './pages/admin/PeriodManagement';
import BulkImport from './pages/admin/BulkImport';
import Statistics from './pages/admin/Statistics';
import Reports from './pages/admin/Reports';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherInfo from './pages/teacher/TeacherInfo';
import TeacherPreferences from './pages/teacher/TeacherPreferences';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />

              {/* Admin routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute userType="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/teachers"
                element={
                  <ProtectedRoute userType="admin">
                    <TeacherManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/positions"
                element={
                  <ProtectedRoute userType="admin">
                    <PositionManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/periods"
                element={
                  <ProtectedRoute userType="admin">
                    <PeriodManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/import"
                element={
                  <ProtectedRoute userType="admin">
                    <BulkImport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/statistics"
                element={
                  <ProtectedRoute userType="admin">
                    <Statistics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute userType="admin">
                    <Reports />
                  </ProtectedRoute>
                }
              />

              {/* Teacher routes */}
              <Route
                path="/teacher"
                element={
                  <ProtectedRoute userType="teacher">
                    <TeacherDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/info"
                element={
                  <ProtectedRoute userType="teacher">
                    <TeacherInfo />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/preferences"
                element={
                  <ProtectedRoute userType="teacher">
                    <TeacherPreferences />
                  </ProtectedRoute>
                }
              />

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;