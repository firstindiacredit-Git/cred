import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import LockerPage from './pages/LockerPage';
import Navigation from './components/Navigation';
import { AuthProvider } from './contexts/AuthContext';
import { TourProvider } from './contexts/TourContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <TourProvider>
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main className="max-w-7xl mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/login" element={<Login />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/locker"
                  element={
                    <ProtectedRoute>
                      <LockerPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
          </div>
        </TourProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
