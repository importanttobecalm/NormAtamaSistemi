import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, userType }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="loading-container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh'
      }}>
        <div className="loading"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (userType && user.userType !== userType) {
    // Redirect to appropriate dashboard
    const redirectPath = user.userType === 'admin' ? '/admin' : '/teacher';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;