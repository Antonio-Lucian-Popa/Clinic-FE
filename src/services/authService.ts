import { apiRequest } from './api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  avatar?: string;
  createdAt: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  requiresEmailVerification?: boolean;
  message?: string;
}

class AuthService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  async login(email: string, password: string): Promise<User> {
    try {
      const data: LoginResponse = await apiRequest.post('/api/auth/login', { email, password });
      this.token = data.accessToken;
      localStorage.setItem('authToken', this.token!);

      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async loginWithGoogle(credential: string): Promise<User> {
    try {
      const data: LoginResponse = await apiRequest.post('/api/auth/oauth/google', { idToken: credential });
      this.token = data.accessToken;
      localStorage.setItem('authToken', this.token!);

      return data.user;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  }

  async register(userData: RegisterData): Promise<string> {
    try {
      const data: string = await apiRequest.post('/api/auth/register', userData);
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.token) {
      return null;
    }

    try {
      const user: User = await apiRequest.get('/api/auth/me');
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      // Return mock user for demo
      return {
        id: '1',
        email: 'doctor@clinic.com',
        firstName: 'Dr. Sarah',
        lastName: 'Johnson',
        roles: ['DOCTOR'],
        avatar: 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=2',
        createdAt: new Date().toISOString()
      };
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.token) {
        await apiRequest.post('/api/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.token = null;
      localStorage.removeItem('authToken');
    }
  }

  getToken(): string | null {
    return this.token;
  }

    async updateProfile(profileData: Partial<User>): Promise<User> {
    try {
      const updatedUser: User = await apiRequest.put('/api/auth/profile', profileData);
      return updatedUser;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();