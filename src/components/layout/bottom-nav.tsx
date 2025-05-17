
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, Users, Car, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Painel', icon: Home },
  { href: '/reports', label: 'Relatórios', icon: FileText },
  { href: '/trainings', label: 'Treinos', icon: Users },
  { href: '/fleet', label: 'Frota', icon: Car },
  { href: '/epis', label: 'EPIs', icon: ShieldCheck },
];

const NAVBAR_HEIGHT_PX = 64; // Corresponds to h-16 (4rem)

export function BottomNav() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= NAVBAR_HEIGHT_PX) {
        // Always show if near the top or at the top
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        // Scrolling down
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    // Initialize lastScrollY on mount
    lastScrollY.current = window.scrollY;

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden',
        'transition-transform duration-300 ease-in-out', // Animation classes
        isVisible ? 'translate-y-0' : 'translate-y-full' // Show/hide logic
      )}
      aria-hidden={!isVisible && typeof window !== 'undefined' && window.innerWidth < 768} // Hide from accessibility tree when off-screen on mobile
    >
      <div className="container mx-auto flex h-16 max-w-md items-center justify-around px-1 sm:px-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center space-y-0.5 p-1 rounded-md text-muted-foreground hover:text-primary transition-colors w-[19%]',
              (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))) ? 'text-primary font-medium' : ''
            )}
            aria-current={(pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))) ? 'page' : undefined}
            tabIndex={isVisible ? 0 : -1} // Make items unfocusable when navbar is hidden
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] text-center leading-tight">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
