import { api, getApiErrorMessage } from './api';
import { User } from '../types';

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user: User;
}

export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    try {
      const response = await api.post<LoginResponse>('/auth/login', credentials);
      return response;
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        'Invalid email or password. Please check your credentials or register.'
      );
      throw new Error(message);
    }
  },

  register: async (userData: { name: string; email: string; password: string; role?: string }) => {
    try {
      const response = await api.post<RegisterResponse>('/auth/register', userData);
      return response;
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        'Failed to register account. Please try again.'
      );
      throw new Error(message);
    }
  },
};

