import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign up function
  const signup = async (email, password, displayName) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name in Firebase
      await updateProfile(result.user, {
        displayName: displayName
      });

      toast.success('Account created successfully!');
      return result;
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.message);
      throw error;
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      toast.success('Logged in successfully!');
      return result;
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
      toast.success('Logged out successfully!');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
    }
  };

  // Fetch user profile from backend
  const fetchUserProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      setUserProfile(response.data.user);
      return response.data.user;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      if (error.response?.status !== 401) {
        toast.error('Error fetching user profile');
      }
      return null;
    }
  };

  // Update user profile
  const updateUserProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      setUserProfile(response.data.user);
      toast.success('Profile updated successfully!');
      return response.data.user;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
      throw error;
    }
  };

  // Check if user has permission
  const hasPermission = (permission) => {
    return userProfile?.permissions?.includes(permission) || false;
  };

  // Check if user has role
  const hasRole = (role) => {
    if (Array.isArray(role)) {
      return role.includes(userProfile?.role);
    }
    return userProfile?.role === role;
  };

  // Check if user is admin
  const isAdmin = () => hasRole('admin');

  // Check if user is manager or admin
  const isManagerOrAdmin = () => hasRole(['manager', 'admin']);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch user profile when authenticated
        await fetchUserProfile();
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    signup,
    login,
    logout,
    fetchUserProfile,
    updateUserProfile,
    hasPermission,
    hasRole,
    isAdmin,
    isManagerOrAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};