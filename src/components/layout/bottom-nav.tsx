
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, Users, ShieldCheck, Gem } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef, useCallback } from 'react';
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
  const [activeIndex, setActiveIndex] = useState(0);

  const navRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const updatePositions = useCallback(() => {
    if (!isMounted || !isMobile || !navRef.current || !indicatorRef.current) return;

    const currentItem = itemRefs.current[activeIndex];
    if (currentItem) {
      const menuPosition = currentItem.offsetLeft - navRef.current.offsetLeft; // Position relative to navRef
      const itemWidth = currentItem.offsetWidth;
      const indicatorWidth = indicatorRef.current.offsetWidth;
      
      // Center indicator under the item: (item's left + half item width) - half indicator width
      const indicatorLeft = menuPosition + (itemWidth / 2) - (indicatorWidth / 2);
      
      // For background dip: center the dip under the item
      const backgroundDipPosition = menuPosition + (itemWidth / 2) - 36; // 36px is from radial-gradient center

      indicatorRef.current.style.left = `${indicatorLeft}px`;
      navRef.current.style.backgroundPosition = `${backgroundDipPosition}px`;
    }
  }, [activeIndex, isMobile, isMounted]);

  useEffect(() => {
    if (!isMounted || !isMobile) return;

    const newActiveIndex = navItems.findIndex(navItem =>
      pathname === navItem.href ||
      (navItem.href !== '/dashboard' && navItem.href !== '/' && pathname.startsWith(navItem.href)) ||
      (pathname.startsWith('/dashboard') && navItem.href === '/dashboard')
    );
    if (newActiveIndex !== -1 && newActiveIndex !== activeIndex) {
      setActiveIndex(newActiveIndex);
    }
  }, [pathname, isMobile, isMounted, activeIndex]);

  useEffect(() => {
    if (!isMounted || !isMobile) return;
    
    updatePositions(); // Initial position update

    // Optional: Recalculate on resize if needed, though offsetLeft should be stable for fixed items
    // window.addEventListener('resize', updatePositions);
    // return () => window.removeEventListener('resize', updatePositions);
  }, [isMobile, isMounted, updatePositions]);


  if (!isMounted || typeof isMobile === 'undefined') {
    // console.log("BottomNav: Not rendering because not mounted or isMobile is undefined.", { isMobile, isMounted });
    return null;
  }

  if (!isMobile) {
    // console.log("BottomNav: NOT RENDERING because isMobile is false.", { isMobile, isMounted });
    return null; 
  }
  
  // console.log("BottomNav: RENDERING because isMobile is true.", { isMobile, isMounted, activeIndex });


  return (
    <nav
      ref={navRef}
      className={cn(
        'app-bottom-nav sc-bottom-bar', // Includes custom CSS classes for the animation
        'fixed inset-x-0 bottom-0 z-50 md:hidden', // Tailwind for positioning and mobile-only
        'h-16', // Standard height
        'transition-transform duration-300 ease-in-out', // For auto-hide scroll effect (if re-enabled)
        'overflow-visible' // Ensure indicator can protrude
      )}
      style={{ backgroundPosition: '0px' }} // Initial background position
      aria-hidden={!isMobile}
    >
      {navItems.map((item, index) => (
        <Link
          key={item.href}
          href={item.href}
          ref={el => itemRefs.current[index] = el}
          className={cn(
            'sc-menu-item', // Custom CSS class
            activeIndex === index ? 'sc-current' : ''
          )}
          onClick={() => setActiveIndex(index)}
          data-ai-hint={item.dataAiHint}
        >
          <item.icon className="h-6 w-6" /> 
          {/* Labels are hidden by default with the .sc-menu-item-label { display: none; } in globals.css for this animation style */}
          <span className="sc-menu-item-label sr-only">{item.label}</span>
        </Link>
      ))}
      <div ref={indicatorRef} className="sc-nav-indicator"></div>
    </nav>
  );
}
