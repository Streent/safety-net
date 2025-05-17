'use client';
import type { User } from 'firebase/auth'; // Import User type if using Firebase Auth
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Mock user type, replace with actual Firebase User if integrating
interface MockUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  // Add 'perfil' for custom claims as per project requirements
  perfil?: 'tecnico' | 'admin' | 'financeiro' | 'master' | 'cliente';
}

const MOCK_USER_KEY = 'safetynet-mock-user';

export function useAuth() {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(MOCK_USER_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to load user from localStorage", error);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email?: string, password?: string) => {
    // In a real app, you'd call Firebase Auth here
    // For now, simulate login
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    const mockUserData: MockUser = {
      uid: 'mock-user-123',
      email: email || 'user@example.com',
      displayName: 'Mock User',
      photoURL: 'https://placehold.co/100x100.png',
      perfil: 'tecnico', // Default profile for mock
    };
    localStorage.setItem(MOCK_USER_KEY, JSON.stringify(mockUserData));
    setUser(mockUserData);
    setLoading(false);
    router.push('/dashboard');
    return mockUserData;
  }, [router]);

  const logout = useCallback(async () => {
    setLoading(true);
    // In a real app, you'd call Firebase Auth signOut here
    localStorage.removeItem(MOCK_USER_KEY);
    setUser(null);
    setLoading(false);
    router.push('/login');
  }, [router]);

  const isAuthenticated = !!user;

  return { user, loading, login, logout, isAuthenticated };
}
