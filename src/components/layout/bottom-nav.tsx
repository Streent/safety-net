
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, Users, ShieldCheck, Gem, Car } from 'lucide-react'; // Added Car
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';

// Adicionando os ícones que estavam faltando na importação e nos navItems
// com base nas iterações anteriores e na necessidade de 5 itens.
const navItems = [
  { href: '/dashboard', label: 'Painel', icon: Home },
  { href: '/reports', label: 'Relatórios', icon: FileText },
  { href: '/trainings', label: 'Treinos', icon: Users },
  { href: '/epis', label: 'EPIs', icon: ShieldCheck },
  { href: '/gamification', label: 'Gamify', icon: Gem },
];

const NAVBAR_HEIGHT_PX = 64; // Corresponde a h-16 (4rem)
const SCROLL_THRESHOLD = 10; // Limiar em pixels para acionar o hide/show

export function BottomNav() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === 'undefined') return;

      // Esta funcionalidade é apenas para mobile (onde md:hidden não se aplica)
      if (window.innerWidth >= 768) {
        setIsVisible(true); // Em desktop, a navbar é controlada por md:hidden, mas o estado lógico pode ser 'visível'
        return;
      }

      const currentScrollY = window.scrollY;
      const scrollDifference = currentScrollY - lastScrollY.current;

      if (currentScrollY <= NAVBAR_HEIGHT_PX) {
        // Sempre visível se estiver perto do topo
        setIsVisible(true);
      } else if (scrollDifference > SCROLL_THRESHOLD) {
        // Rolando para baixo significativamente
        setIsVisible(false);
      } else if (scrollDifference < -SCROLL_THRESHOLD) {
        // Rolando para cima significativamente
        setIsVisible(true);
      }
      // Atualiza a última posição do scroll apenas se o movimento foi além do ruído
      if (Math.abs(scrollDifference) > SCROLL_THRESHOLD || currentScrollY <= NAVBAR_HEIGHT_PX) {
         lastScrollY.current = currentScrollY;
      }
    };

    if (typeof window !== 'undefined') {
      lastScrollY.current = window.scrollY; // Define a posição inicial
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, []); // Dependência vazia, pois lastScrollY é um ref e setIsVisible é estável

  return (
    <nav
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden', // md:hidden garante que só aparece em telas menores
        'transition-transform duration-300 ease-in-out',
        isVisible ? 'translate-y-0' : 'translate-y-full'
      )}
      aria-hidden={!isVisible && typeof window !== 'undefined' && window.innerWidth < 768}
    >
      <div className="container mx-auto flex h-16 max-w-md items-center justify-around px-1 sm:px-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center space-y-0.5 p-1 rounded-md text-muted-foreground hover:text-primary transition-colors w-[19%]',
              'active:scale-95 transition-transform duration-150 ease-in-out', // Added for tap animation
              (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))) ? 'text-primary font-medium' : ''
            )}
            aria-current={(pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))) ? 'page' : undefined}
            tabIndex={isVisible ? 0 : -1}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] text-center leading-tight">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
