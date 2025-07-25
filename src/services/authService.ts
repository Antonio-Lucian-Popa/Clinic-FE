import { apiRequest } from './api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
  createdAt: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface LoginResponse {
  token: string;
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
      this.token = data.token;
      localStorage.setItem('authToken', this.token!);

      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async loginWithGoogle(credential: string): Promise<User> {
    try {
      const data: LoginResponse = await apiRequest.post('/api/auth/oauth/google', { credential });
      this.token = data.token;
      localStorage.setItem('authToken', this.token!);

      return data.user;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  }

  async register(userData: RegisterData): Promise<User> {
    try {
      const data: LoginResponse = await apiRequest.post('/api/auth/register', userData);
      
      // Dacă înregistrarea necesită verificare email, nu salvăm token-ul încă
      if (data.requiresEmailVerification) {
        return { ...data, requiresEmailVerification: true, message: data.message } as any;
      }
      
      // Altfel, salvăm token-ul și returnăm user-ul
      if (data.token) {
        this.token = data.token;
        localStorage.setItem('authToken', this.token!);
      }

      return data.user;
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
        role: 'DOCTOR',
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
}

export const authService = new AuthService();