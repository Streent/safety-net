'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, Brain, BarChart3 } from 'lucide-react'; // Using BarChart3 for Dashboard synonym for variety
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 }, // i18n: bottomNav.dashboard
  { href: '/reports', label: 'Reports', icon: FileText }, // i18n: bottomNav.reports
  { href: '/predictive-analysis', label: 'Analysis', icon: Brain }, // i18n: bottomNav.analysis (shortened)
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="container mx-auto flex h-16 max-w-md items-center justify-around px-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center space-y-1 p-2 rounded-md text-muted-foreground hover:text-primary transition-colors',
              pathname.startsWith(item.href) ? 'text-primary font-medium' : ''
            )}
            aria-current={pathname.startsWith(item.href) ? 'page' : undefined}
          >
            <item.icon className="h-6 w-6" />
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
