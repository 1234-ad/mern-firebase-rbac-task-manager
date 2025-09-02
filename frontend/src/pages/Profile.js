import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Avatar,
  Chip,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { Person, Email, Badge, CalendarToday } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const Profile = () => {
  const { userProfile, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: userProfile?.displayName || '',
    department: userProfile?.profile?.department || '',
    phoneNumber: userProfile?.profile?.phoneNumber || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateUserProfile({
        displayName: formData.displayName,
        profile: {
          department: formData.department,
          phoneNumber: formData.phoneNumber
        }
      });
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'manager':
        return 'warning';
      case 'user':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getRoleDescription = (role) => {
    switch (role) {
      case 'admin':
        return 'Full system access including user management';
      case 'manager':
        return 'Can manage all tasks and view team activities';
      case 'user':
        return 'Can create and manage own tasks';
      default:
        return 'Standard user access';
    }
  };

  if (!userProfile) {
    return (
      <Container maxWidth="md">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Profile Settings
        </Typography>

        <Grid container spacing={3}>
          {/* Profile Overview */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  fontSize: '2rem',
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main'
                }}
              >
                {userProfile.displayName?.charAt(0).toUpperCase()}
              </Avatar>
              
              <Typography variant="h5" gutterBottom>
                {userProfile.displayName}
              </Typography>
              
              <Chip
                label={userProfile.role}
                color={getRoleColor(userProfile.role)}
                sx={{ mb: 2 }}
              />
              
              <Typography variant="body2" color="text.secondary" paragraph>
                {getRoleDescription(userProfile.role)}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ textAlign: 'left' }}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Email sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {userProfile.email}
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center" mb={1}>
                  <Badge sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    Role: {userProfile.role}
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center" mb={1}>
                  <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    Joined: {dayjs(userProfile.createdAt).format('MMM DD, YYYY')}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Profile Form */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Update Profile Information
              </Typography>
              
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Display Name"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  margin="normal"
                  required
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
                
                <TextField
                  fullWidth
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  margin="normal"
                  helperText="Optional: Your department or team"
                />
                
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  margin="normal"
                  helperText="Optional: Your contact number"
                />

                <Box sx={{ mt: 3 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{ mr: 2 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Update Profile'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setFormData({
                      displayName: userProfile.displayName || '',
                      department: userProfile.profile?.department || '',
                      phoneNumber: userProfile.profile?.phoneNumber || ''
                    })}
                  >
                    Reset
                  </Button>
                </Box>
              </Box>
            </Paper>

            {/* Permissions */}
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Your Permissions
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                {userProfile.permissions && userProfile.permissions.length > 0 ? (
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {userProfile.permissions.map((permission, index) => (
                      <Chip
                        key={index}
                        label={permission.replace(':', ': ').replace('-', ' ')}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No specific permissions assigned
                  </Typography>
                )}
              </Box>
              
              <Alert severity="info" sx={{ mt: 2 }}>
                Permissions are automatically assigned based on your role. 
                Contact an administrator if you need additional access.
              </Alert>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Profile;