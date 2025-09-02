import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Typography, Paper } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole, requiredPermission }) => {
  const { currentUser, userProfile, hasRole, hasPermission } = useAuth();

  // Check if user is authenticated
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Check if user profile is loaded
  if (!userProfile) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography>Loading user profile...</Typography>
      </Box>
    );
  }

  // Check role-based access
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1">
            You don't have permission to access this page.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Required role: {Array.isArray(requiredRole) ? requiredRole.join(' or ') : requiredRole}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your role: {userProfile.role}
          </Typography>
        </Paper>
      </Box>
    );
  }

  // Check permission-based access
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1">
            You don't have the required permission to access this page.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Required permission: {requiredPermission}
          </Typography>
        </Paper>
      </Box>
    );
  }

  return children;
};

export default ProtectedRoute;