import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Alert
} from '@mui/material';
import {
  Assignment,
  CheckCircle,
  Schedule,
  Warning,
  TrendingUp,
  People
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { tasksAPI, authAPI } from '../services/api';

const Dashboard = () => {
  const { userProfile, isAdmin } = useAuth();
  const [taskStats, setTaskStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const taskStatsResponse = await tasksAPI.getTaskStats();
      setTaskStats(taskStatsResponse.data.stats);

      if (isAdmin()) {
        const userStatsResponse = await authAPI.getUserStats();
        setUserStats(userStatsResponse.data.stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color = 'primary', subtitle }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="div" color={`${color}.main`}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box color={`${color}.main`}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const ProgressCard = ({ title, completed, total, color = 'primary' }) => {
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Box display="flex" alignItems="center" mb={1}>
            <Typography variant="h4" color={`${color}.main`}>
              {completed}
            </Typography>
            <Typography variant="h6" color="textSecondary" sx={{ ml: 1 }}>
              / {total}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={percentage}
            color={color}
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            {percentage.toFixed(1)}% Complete
          </Typography>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <LinearProgress />
          <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
            Loading dashboard...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box mb={4}>
          <Typography variant="h4" gutterBottom>
            Welcome back, {userProfile?.displayName}!
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              label={userProfile?.role}
              color={
                userProfile?.role === 'admin' ? 'error' :
                userProfile?.role === 'manager' ? 'warning' : 'primary'
              }
              variant="outlined"
            />
            <Typography variant="body1" color="textSecondary">
              Here's your task overview
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Task Statistics */}
        {taskStats && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Tasks"
                value={taskStats.total}
                icon={<Assignment sx={{ fontSize: 40 }} />}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Completed"
                value={taskStats.completed}
                icon={<CheckCircle sx={{ fontSize: 40 }} />}
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="In Progress"
                value={taskStats.inProgress}
                icon={<Schedule sx={{ fontSize: 40 }} />}
                color="info"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Overdue"
                value={taskStats.overdue}
                icon={<Warning sx={{ fontSize: 40 }} />}
                color="error"
              />
            </Grid>
          </Grid>
        )}

        {/* Progress Cards */}
        {taskStats && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <ProgressCard
                title="Task Completion"
                completed={taskStats.completed}
                total={taskStats.total}
                color="success"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ProgressCard
                title="High Priority Tasks"
                completed={taskStats.completed}
                total={taskStats.highPriority}
                color="warning"
              />
            </Grid>
          </Grid>
        )}

        {/* Admin Statistics */}
        {isAdmin() && userStats && (
          <>
            <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
              User Management
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Users"
                  value={userStats.totalUsers}
                  icon={<People sx={{ fontSize: 40 }} />}
                  color="primary"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Active Users"
                  value={userStats.activeUsers}
                  icon={<TrendingUp sx={{ fontSize: 40 }} />}
                  color="success"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Managers"
                  value={userStats.managers}
                  icon={<People sx={{ fontSize: 40 }} />}
                  color="warning"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Admins"
                  value={userStats.admins}
                  icon={<People sx={{ fontSize: 40 }} />}
                  color="error"
                />
              </Grid>
            </Grid>
          </>
        )}

        {/* Quick Actions */}
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Typography variant="body2" color="textSecondary">
            • Navigate to Tasks to create, view, and manage your tasks
            • Update your profile information in the Profile section
            {isAdmin() && ' • Manage users and their roles in the Users section'}
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard;