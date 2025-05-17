
'use client';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation'; // Importar usePathname
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { BottomNav } from '@/components/layout/bottom-nav';
import { useAuth } from '@/hooks/use-auth';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { FloatingChatButton } from '@/components/chat/floating-chat-button';
import { ChatWindow } from '@/components/chat/chat-window';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); // Obter o pathname atual
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  const toggleChat = () => setIsChatOpen(!isChatOpen);
  const closeChat = () => setIsChatOpen(false);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset className="flex-1">
            {/*
              mb-16 (margin-bottom: 4rem) on mobile ensures content doesn't hide behind BottomNav (h-16 or 4rem height).
              md:mb-0 removes this margin on medium screens and up where BottomNav is hidden.
              min-w-0 is important for flex children to prevent overflow if their content is too wide.
            */}
            <main
              key={pathname} // Adicionar key para re-trigger da animação
              className="flex-1 p-4 sm:p-6 lg:p-8 mb-16 md:mb-0 min-w-0 animate-pageTransition" // Adicionar classe de animação
            >
              {children}
            </main>
          </SidebarInset>
        </div>
        <BottomNav />
      </div>
      <Toaster />
      <FloatingChatButton onClick={toggleChat} isChatOpen={isChatOpen} />
      <ChatWindow isOpen={isChatOpen} onClose={closeChat} />
    </SidebarProvider>
  );
}
