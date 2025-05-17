
'use client';
import type { ReactNode } from 'react';
import { useEffect, useState, useRef } from 'react'; // Added useRef
import { useRouter, usePathname } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { BottomNav } from '@/components/layout/bottom-nav';
import { useAuth } from '@/hooks/use-auth';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { FloatingChatButton } from '@/components/chat/floating-chat-button';
import { ChatWindow } from '@/components/chat/chat-window';

const SCROLL_VISIBILITY_THRESHOLD = 50; // Pixels to scroll before hiding/showing nav
const NAV_ALWAYS_VISIBLE_TOP_OFFSET = 100; // If scrollY is less than this, nav is always visible

export default function AppLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNavElementsVisible, setIsNavElementsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === 'undefined') return;

      const currentScrollY = window.scrollY;
      const scrollDirectionDown = currentScrollY > lastScrollY.current;

      if (currentScrollY < NAV_ALWAYS_VISIBLE_TOP_OFFSET) {
        setIsNavElementsVisible(true);
      } else {
        if (scrollDirectionDown && currentScrollY > lastScrollY.current + SCROLL_VISIBILITY_THRESHOLD) {
          setIsNavElementsVisible(false);
        } else if (!scrollDirectionDown && currentScrollY < lastScrollY.current - SCROLL_VISIBILITY_THRESHOLD / 2 ) { // More sensitive to show
          setIsNavElementsVisible(true);
        }
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    lastScrollY.current = window.scrollY; // Initialize lastScrollY

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);


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
        <AppHeader isVisible={isNavElementsVisible} />
        <div className="flex flex-1 pt-16"> {/* Add pt-16 for fixed AppHeader space */}
          <AppSidebar isVisible={isNavElementsVisible} />
          <SidebarInset className="flex-1 min-w-0"> {/* Added min-w-0 */}
            <main
              key={pathname}
              className="flex-1 p-4 sm:p-6 lg:p-8 mb-16 md:mb-0 min-w-0 animate-pageTransition"
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
