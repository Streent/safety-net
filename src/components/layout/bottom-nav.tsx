'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, Brain, Users, Car, Gem } from 'lucide-react'; // Added Users, Car, Gem
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home }, // i18n: bottomNav.dashboard (changed icon for variety)
  { href: '/reports', label: 'Reports', icon: FileText }, // i18n: bottomNav.reports
  // { href: '/predictive-analysis', label: 'Analysis', icon: Brain }, // i18n: bottomNav.analysis (shortened) - Removing to make space
  { href: '/trainings', label: 'Trainings', icon: Users }, // i18n: bottomNav.trainings
  { href: '/fleet', label: 'Fleet', icon: Car }, // i18n: bottomNav.fleet
  { href: '/gamification', label: 'Gamify', icon: Gem }, // i18n: bottomNav.gamification (shortened label)
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="container mx-auto flex h-16 max-w-md items-center justify-around px-2 sm:px-4"> {/* Reduced padding for more items */}
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center space-y-1 p-1 sm:p-2 rounded-md text-muted-foreground hover:text-primary transition-colors w-[19%]', // Adjusted width and padding
              (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))) ? 'text-primary font-medium' : ''
            )}
            aria-current={(pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))) ? 'page' : undefined}
          >
            <item.icon className="h-5 w-5 sm:h-6 sm:w-6" /> {/* Slightly smaller icon */}
            <span className="text-[10px] sm:text-xs text-center leading-tight">{item.label}</span> {/* Smaller text, centered */}
          </Link>
        ))}
      </div>
    </nav>
  );
}
