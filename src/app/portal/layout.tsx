
'use client';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Toaster } from '@/components/ui/toaster';
import { ClientPortalHeader } from '@/components/layout/client-portal-header';
import { Logo } from '@/components/common/logo';

export default function ClientPortalLayout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/portal/login');
      } else if (user?.perfil !== 'cliente') {
        // If authenticated but not a client, redirect to main app login or show access denied
        // For now, pushing to main login if profile is not 'cliente'
        router.push('/login'); 
      }
    }
  }, [isAuthenticated, loading, router, user]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="ml-4 text-muted-foreground">Carregando Portal do Cliente...</p>
      </div>
    );
  }

  // Ensure user is authenticated and is a client
  if (!isAuthenticated || user?.perfil !== 'cliente') {
    // This should ideally not be reached due to the useEffect redirect,
    // but it's a fallback. Can be a dedicated "Access Denied" component.
    return (
        <div className="flex h-screen items-center justify-center bg-background">
             <p className="text-lg text-destructive">Acesso Negado ao Portal do Cliente.</p>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background dark:bg-slate-950">
      <ClientPortalHeader />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 mt-16 animate-pageTransition"> {/* mt-16 for fixed header */}
        {children}
      </main>
      <Toaster />
      {/* Offline banner for client portal can be added here later */}
    </div>
  );
}
