import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Login from './pages/Login';
import NavBar from './components/NavBar';
import Dashboard from './pages/Dashboard';

import ChatInterface from './pages/ChatInterface';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return (
    <div className="flex h-screen bg-background text-white overflow-hidden">
      <NavBar />
      <div className="flex-1 ml-24 h-full overflow-hidden relative">
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <SocketProvider>
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </SocketProvider>
          } />
          <Route path="/chat/:username" element={
            <SocketProvider>
              <ProtectedRoute>
                <ChatInterface />
              </ProtectedRoute>
            </SocketProvider>
          } />
          <Route path="/chat" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
