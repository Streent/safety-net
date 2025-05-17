
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, Users, Car, Gem, ShieldCheck } from 'lucide-react'; // Added ShieldCheck for EPIs
import { cn } from '@/lib/utils';

// Adjusted to fit more common items, others accessible via sidebar on larger screens or a "More" menu if needed.
const navItems = [
  { href: '/dashboard', label: 'Painel', icon: Home }, // i18n: bottomNav.dashboard
  { href: '/reports', label: 'Relatórios', icon: FileText }, // i18n: bottomNav.reports
  { href: '/trainings', label: 'Treinos', icon: Users }, // i18n: bottomNav.trainings (shortened)
  { href: '/fleet', label: 'Frota', icon: Car }, // i18n: bottomNav.fleet
  { href: '/epis', label: 'EPIs', icon: ShieldCheck }, // i18n: bottomNav.epis
  // { href: '/gamification', label: 'Gamify', icon: Gem }, // Removed to make space, access via sidebar or dashboard widget
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
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
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] text-center leading-tight">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
