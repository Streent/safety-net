
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
    } catch (error) { // Added missing opening brace
      console.error("Failed to load user from localStorage", error);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email?: string, password?: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); 

    // Determine if it's a client login based on email/CNPJ pattern or a specific flag
    // For this mock, let's assume an email containing "cliente" or "empresa" is a client
    // or if it looks like a CNPJ (contains / or .)
    const isClientAttempt = email?.toLowerCase().includes('cliente') || 
                            email?.toLowerCase().includes('empresa') || 
                            email?.includes('/') || 
                            (email?.includes('.') && (email.match(/\./g) || []).length > 1 && !email.endsWith('.com') && !email.endsWith('.org')); // Simplified CNPJ check

    const mockUserData: MockUser = {
      uid: isClientAttempt ? 'mock-client-789' : 'mock-user-123',
      email: email || (isClientAttempt ? 'cliente@empresa.com' : 'user@example.com'),
      displayName: isClientAttempt ? 'Empresa Cliente Exemplo' : 'Técnico Demonstração',
      photoURL: `https://placehold.co/100x100.png`,
      perfil: isClientAttempt ? 'cliente' : 'tecnico',
    };
    
    localStorage.setItem(MOCK_USER_KEY, JSON.stringify(mockUserData));
    setUser(mockUserData);
    setLoading(false);

    if (mockUserData.perfil === 'cliente') {
      router.push('/portal/dashboard');
    } else {
      router.push('/dashboard');
    }
    return mockUserData;
  }, [router]);

  const logout = useCallback(async () => {
    setLoading(true);
    const storedUser = localStorage.getItem(MOCK_USER_KEY);
    let redirectTo = '/login'; // Default redirect
    if (storedUser) {
        try {
            const parsedUser: MockUser = JSON.parse(storedUser);
            if (parsedUser.perfil === 'cliente') {
                redirectTo = '/portal/login';
            }
        } catch (e) {
            console.error("Error parsing user from storage on logout", e);
        }
    }
    localStorage.removeItem(MOCK_USER_KEY);
    setUser(null);
    setLoading(false);
    router.push(redirectTo);
  }, [router]);

  const isAuthenticated = !!user;

  return { user, loading, login, logout, isAuthenticated };
}
