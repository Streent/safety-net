'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, Users, ShieldCheck, Gem } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const navItems = [
  { href: '/dashboard', label: 'Painel', icon: Home, dataAiHint: 'dashboard button' },
  { href: '/reports', label: 'Relatórios', icon: FileText, dataAiHint: 'reports button' },
  { href: '/trainings', label: 'Treinos', icon: Users, dataAiHint: 'trainings button' },
  { href: '/epis', label: 'EPIs', icon: ShieldCheck, dataAiHint: 'epis button' },
  { href: '/gamification', label: 'Gamify', icon: Gem, dataAiHint: 'gamification button' },
];

export function BottomNav() {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Determine activeIndex for styling the active item
  const activeIndex = navItems.findIndex(navItem =>
    pathname === navItem.href || 
    (navItem.href !== '/dashboard' && navItem.href !== '/' && pathname.startsWith(navItem.href)) ||
    (pathname.startsWith('/dashboard') && navItem.href === '/dashboard') // Ensure dashboard is active for sub-paths too
  );

  if (!isMounted) {
    // console.log("BottomNav: Not rendering because not mounted yet.");
    return null; // Don't render on server or before client mount
  }

  if (typeof isMobile === 'undefined') {
    // console.log("BottomNav: Not rendering because isMobile is undefined.");
    return null; // isMobile not determined yet
  }

  if (!isMobile) {
    console.log("BottomNav: NOT RENDERING because isMobile is false.", { isMobile, isMounted });
    return null; // Explicitly don't render if not mobile
  }
  
  console.log("BottomNav: RENDERING because isMobile is true.", { isMobile, isMounted });

  return (
    <nav
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 h-16 bg-background border-t border-border', // Base styles
        'flex items-center justify-around px-1', // Flex layout for items
        'md:hidden' // CRUCIAL: This class should hide it on medium screens (768px) and up
      )}
      aria-hidden={!isMobile}
    >
      {navItems.map((item, index) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'flex flex-col items-center justify-center rounded-md transition-colors duration-150 ease-in-out h-full w-1/5 flex-1 min-w-0 px-1 py-1.5', 
            'text-muted-foreground hover:text-primary active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            activeIndex === index ? 'text-primary' : ''
          )}
          data-ai-hint={item.dataAiHint}
        >
          <item.icon className={cn("h-5 w-5", activeIndex === index ? "text-primary" : "text-muted-foreground group-hover:text-primary" )} />
          <span className={cn(
            "text-[10px] leading-tight truncate mt-0.5",
             activeIndex === index ? "font-medium text-primary" : "text-muted-foreground group-hover:text-primary"
            )}
          >
            {item.label}
          </span>
        </Link>
      ))}
    </nav>
  );
}
