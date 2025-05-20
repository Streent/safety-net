
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
const INDICATOR_WIDTH = 56; // px, from .sc-nav-indicator CSS
const GRADIENT_CIRCLE_RADIUS = 30; // px, effective radius of the "dip"

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
    // Initialize refs array size based on navItems length
    itemRefs.current = Array(navItems.length).fill(null);
  }, []); // Runs once on mount

  const updatePositions = useCallback(() => {
    if (typeof window === 'undefined' || window.innerWidth >= 768) return; // Only run on mobile

    const currentItem = itemRefs.current[activeIndex];
    if (currentItem && bottomBarRef.current) {
      const itemOffsetLeft = currentItem.offsetLeft;
      const itemWidth = currentItem.offsetWidth;

      // Center indicator under the active item
      const indicatorLeft = itemOffsetLeft + (itemWidth / 2) - (INDICATOR_WIDTH / 2);
      setIndicatorStyle({ left: `${indicatorLeft}px`, opacity: 1 });
      
      // Calculate backgroundPosition for the radial gradient dip effect
      const itemCenterPointX = itemOffsetLeft + (itemWidth / 2);
      const backgroundPositionX = itemCenterPointX - GRADIENT_CIRCLE_RADIUS;
      
      setBarBgStyle({ 
        backgroundPosition: `${backgroundPositionX}px 0px`,
        backgroundImage: `radial-gradient(circle at ${GRADIENT_CIRCLE_RADIUS}px ${GRADIENT_CIRCLE_RADIUS}px, transparent ${GRADIENT_CIRCLE_RADIUS -1}px, var(--bottom-nav-background-color) ${GRADIENT_CIRCLE_RADIUS}px)`
      });
    } else if (bottomBarRef.current) {
      // Default bar style if no item is active or refs not ready (e.g., hide dip)
      setBarBgStyle({
        backgroundImage: 'none', // Or a plain background color
        backgroundPosition: '0px 0px', 
      });
       setIndicatorStyle({opacity:0}); // Hide indicator
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
      // No active item found, perhaps set a default or handle this case
      // For now, if no active item, positions might not update correctly for the "dip"
      // We could set activeIndex to a value that causes the dip to hide, or a default.
    }
  }, [pathname, activeIndex]); // Include activeIndex to re-evaluate if it externally changes

  useEffect(() => {
    // Initial position update and on activeIndex change
    const timer = setTimeout(updatePositions, 50); // Delay to ensure DOM elements are measured
    return () => clearTimeout(timer);
  }, [activeIndex, updatePositions]);
  
  // Update positions on window resize
  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth >= 768) return () => {};

    const handleResize = () => {
      updatePositions();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updatePositions]);


  // Auto-hide on scroll logic
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === 'undefined') return;
      if (window.innerWidth >= 768) { 
        setIsVisible(true);
        return;
      }

      const currentScrollY = window.scrollY;
      const scrollDifference = currentScrollY - lastScrollY.current;

      if (currentScrollY <= NAVBAR_HEIGHT_PX) {
        setIsVisible(true);
      } else if (scrollDifference > SCROLL_THRESHOLD) {
        setIsVisible(false);
      } else if (scrollDifference < -SCROLL_THRESHOLD) {
        setIsVisible(true);
      }
      
      if (Math.abs(scrollDifference) > SCROLL_THRESHOLD || currentScrollY <= NAVBAR_HEIGHT_PX) {
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

  const handleItemClick = (index: number) => {
    // setActiveIndex(index); // Pathname change will trigger activeIndex update via useEffect
  };

  return (
    <nav
      ref={bottomBarRef}
      className={cn(
        'app-bottom-nav sc-bottom-bar', 
        'fixed inset-x-0 bottom-0 z-50 md:hidden overflow-visible', // Added overflow-visible
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
            'sc-menu-item',
            // 'active:scale-95', // This might interfere with the transform:translateY
            activeIndex === index ? 'sc-current' : ''
          )}
          onClick={() => handleItemClick(index)} // Click just sets active index for animation sync
          aria-current={activeIndex === index ? 'page' : undefined}
          tabIndex={isVisible ? 0 : -1}
          data-ai-hint={item.dataAiHint}
        >
          <item.icon className="h-6 w-6" /> 
          <span className="sc-menu-item-label">{item.label}</span>
        </Link>
      ))}
      <div className="sc-nav-indicator" style={indicatorStyle}></div>
    </nav>
  );
}

    