import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, type User, type RegisterData } from '../services/authService';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<string>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      await authService.login(email, password);
      const userData = await authService.getCurrentUser();
      setUser(userData);
      toast.success('Welcome back!');
      console.log('Login successful:', userData);
      // Redirect to home or dashboard as needed
      if (userData) {
        const isUserRole = userData.roles.includes('USER');
        // Redirect to home or dashboard as needed
        if (!isUserRole) {
          window.location.href = '/';
        } else {
          window.location.href = '/update-profile';
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (credential: string) => {
    try {
      setIsLoading(true);
      await authService.loginWithGoogle(credential);
      const userData = await authService.getCurrentUser(); // Assuming this fetches the user data
      setUser(userData);
     // setUser(userData);
      toast.success('Welcome back!');
      console.log('Google login successful:', userData);
      // check if roles have inside just USER
      if(userData) {
        const isUserRole = userData.roles.includes('USER');
        // Redirect to home or dashboard as needed
        if (!isUserRole) {
          window.location.href = '/';
        } else {
          window.location.href = '/update-profile';
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Google login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<string> => {
    try {
      setIsLoading(true);
      const registerResponse = await authService.register(userData);
      toast.success(registerResponse || 'Registration successful! Please check your email to activate your account.');
      // Redirect to login or home page as needed
      window.location.href = '/login';
      return registerResponse || 'Registration successful! Please check your email to activate your account.';
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

   const updateProfile = async (profileData: Partial<User>) => {
    try {
      setIsLoading(true);
      const updatedUser = await authService.updateProfile(profileData);
      setUser(updatedUser);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Profile update failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error('Logout failed');
    }
  };

const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    loginWithGoogle,
    logout,
    register,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}