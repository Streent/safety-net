
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, Users, ShieldCheck, Gem } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef, useCallback } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Painel', icon: Home, dataAiHint: 'dashboard button' },
  { href: '/reports', label: 'Relatórios', icon: FileText, dataAiHint: 'reports button' },
  { href: '/trainings', label: 'Treinos', icon: Users, dataAiHint: 'trainings button' },
  { href: '/epis', label: 'EPIs', icon: ShieldCheck, dataAiHint: 'epis button' },
  { href: '/gamification', label: 'Gamify', icon: Gem, dataAiHint: 'gamification button' },
];

const NAVBAR_HEIGHT_PX = 64; // Corresponds to h-16 (4rem)
const SCROLL_THRESHOLD = 20;
const INDICATOR_WIDTH_PX = 56;
const GRADIENT_CIRCLE_RADIUS_PX = 30;

export function BottomNav() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  const [activeIndex, setActiveIndex] = useState(0);
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({ left: '0px', opacity: 0 });
  const [barBgStyle, setBarBgStyle] = useState<React.CSSProperties>({});

  const bottomBarRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([]);

  useEffect(() => {
    itemRefs.current = Array(navItems.length).fill(null);
  }, []);

  const updatePositions = useCallback(() => {
    if (typeof window === 'undefined' || !bottomBarRef.current) return;
    // Only apply fancy animation on mobile where BottomNav is visible
    if (window.innerWidth >= 768) { // md breakpoint
      setIndicatorStyle({ opacity: 0 }); // Hide indicator
      setBarBgStyle({ backgroundImage: 'none' }); // Remove dip effect
      return;
    }

    const currentItem = itemRefs.current[activeIndex];
    if (currentItem) {
      const itemOffsetLeft = currentItem.offsetLeft;
      const itemWidth = currentItem.offsetWidth;
      const barWidth = bottomBarRef.current.offsetWidth;

      // Center indicator under the active item
      let indicatorLeft = itemOffsetLeft + (itemWidth / 2) - (INDICATOR_WIDTH_PX / 2);
      // Ensure indicator doesn't go out of bounds
      indicatorLeft = Math.max(0, Math.min(indicatorLeft, barWidth - INDICATOR_WIDTH_PX));
      
      setIndicatorStyle({ left: `${indicatorLeft}px`, opacity: 1 });

      const itemCenterPointX = itemOffsetLeft + (itemWidth / 2);
      const backgroundPositionX = itemCenterPointX - GRADIENT_CIRCLE_RADIUS_PX;

      setBarBgStyle({
        backgroundPosition: `${backgroundPositionX}px 0px`,
        backgroundImage: `radial-gradient(circle at ${GRADIENT_CIRCLE_RADIUS_PX}px ${GRADIENT_CIRCLE_RADIUS_PX}px, transparent ${GRADIENT_CIRCLE_RADIUS_PX - 1}px, var(--bottom-nav-background-color) ${GRADIENT_CIRCLE_RADIUS_PX}px)`
      });
    } else {
      setIndicatorStyle({ opacity: 0 });
      setBarBgStyle({ backgroundImage: 'none' });
    }
  }, [activeIndex]);

  useEffect(() => {
    const currentPath = pathname;
    let newActiveIndex = navItems.findIndex(navItem =>
      currentPath === navItem.href || (navItem.href !== '/dashboard' && navItem.href !== '/' && currentPath.startsWith(navItem.href))
    );

    if (newActiveIndex === -1 && (currentPath.startsWith('/dashboard') || currentPath === '/')) {
      newActiveIndex = navItems.findIndex(navItem => navItem.href === '/dashboard');
    }
    
    if (newActiveIndex !== -1 && newActiveIndex !== activeIndex) {
      setActiveIndex(newActiveIndex);
    } else if (newActiveIndex === -1) {
       setActiveIndex(-1); // No active item
    }
  }, [pathname, activeIndex]);

  useEffect(() => {
    const timer = setTimeout(updatePositions, 50);
    return () => clearTimeout(timer);
  }, [activeIndex, updatePositions]);

  useEffect(() => {
    if (typeof window === 'undefined') return () => {};

    const handleResize = () => {
      updatePositions();
    };
    window.addEventListener('resize', handleResize);
    // Initial call on mount for mobile
    if (window.innerWidth < 768) {
        updatePositions();
    }
    return () => window.removeEventListener('resize', handleResize);
  }, [updatePositions]);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === 'undefined') return;
      // Only apply scroll logic on mobile
      if (window.innerWidth >= 768) { // md breakpoint
        setIsVisible(true); // Keep it "logically" visible for desktop, md:hidden handles display
        return;
      }

      const currentScrollY = window.scrollY;
      const scrollDifference = currentScrollY - lastScrollY.current;

      if (currentScrollY <= NAVBAR_HEIGHT_PX / 2) { // Show if near top
        setIsVisible(true);
      } else if (scrollDifference > SCROLL_THRESHOLD) {
        setIsVisible(false);
      } else if (scrollDifference < -SCROLL_THRESHOLD / 2) { // More sensitive to scroll up
        setIsVisible(true);
      }

      if (Math.abs(scrollDifference) > SCROLL_THRESHOLD / 2 || currentScrollY <= NAVBAR_HEIGHT_PX / 2) {
        lastScrollY.current = currentScrollY;
      }
    };

    if (typeof window !== 'undefined') {
      lastScrollY.current = window.scrollY;
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  return (
    <nav
      ref={bottomBarRef}
      className={cn(
        'app-bottom-nav sc-bottom-bar',
        'fixed inset-x-0 bottom-0 z-50 md:hidden overflow-visible', // A classe md:hidden garante que só aparece no mobile
        'transition-transform duration-300 ease-in-out',
        isVisible ? 'translate-y-0' : 'translate-y-full'
      )}
      style={barBgStyle}
      aria-hidden={!isVisible && typeof window !== 'undefined' && window.innerWidth < 768}
    >
      {navItems.map((item, index) => (
        <Link
          key={item.href}
          href={item.href}
          ref={(el) => itemRefs.current[index] = el}
          className={cn(
            'sc-menu-item active:scale-95 transition-transform duration-150 ease-in-out',
            activeIndex === index ? 'sc-current' : ''
          )}
          aria-current={activeIndex === index ? 'page' : undefined}
          tabIndex={isVisible ? 0 : -1}
          data-ai-hint={item.dataAiHint}
        >
          <item.icon className="h-6 w-6" />
          <span className="sc-menu-item-label sr-only">{item.label}</span>
        </Link>
      ))}
      <div className="sc-nav-indicator" style={indicatorStyle}></div>
    </nav>
  );
}
