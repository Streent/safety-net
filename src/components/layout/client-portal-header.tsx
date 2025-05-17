
'use client';
import Link from 'next/link';
import { Bell, LogOut, UserCircle, ChevronLeft, Sun, Moon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Logo } from '@/components/common/logo';
import { useAuth } from '@/hooks/use-auth';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/hooks/use-theme'; 

// Simplified Breadcrumb for client portal
function generateClientBreadcrumbs(pathname: string) {
  const portalBase = '/portal';
  const dashboardPath = `${portalBase}/dashboard`;
  const breadcrumbs = [{ href: dashboardPath, label: 'Início' }]; 

  // Remove /portal prefix for segment generation
  const pathWithoutPortal = pathname.startsWith(portalBase) ? pathname.substring(portalBase.length) : pathname;
  const pathSegments = pathWithoutPortal.split('/').filter(segment => segment && segment !== 'dashboard');


  let currentPath = dashboardPath; // Start breadcrumbs from portal dashboard
  pathSegments.forEach(segment => {
    currentPath += `/${segment}`; // This logic might need adjustment if portal routes are deeper
    let label = segment.charAt(0).toUpperCase() + segment.slice(1);
    
    // Client-specific labels (can be expanded)
    if (label === 'Documents') label = 'Documentos';
    if (label === 'Scheduling') label = 'Agendamentos';
    if (label === 'Requests') label = 'Solicitações';
    // Add more translations as portal pages are created
    
    breadcrumbs.push({ href: currentPath, label });
  });
  return breadcrumbs;
}


export function ClientPortalHeader() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const breadcrumbs = generateClientBreadcrumbs(pathname);
  // Determine current page title from the last breadcrumb, or default for dashboard
  const isDashboard = pathname === '/portal/dashboard';
  const currentRawTitle = breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 1].label : 'Portal do Cliente';
  const displayTitle = isDashboard ? 'Portal do Cliente' : currentRawTitle;

  const showBackButton = pathname !== '/portal/dashboard';


  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:bg-slate-900/95 dark:border-slate-800">
      <div className="container mx-auto flex h-16 items-center justify-between max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 sm:gap-2">
          {showBackButton && (
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-1 sm:mr-2" aria-label="Voltar">
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}
          <Link href="/portal/dashboard" className="flex items-center gap-2" aria-label="Página inicial do Portal do Cliente">
            <Logo className="h-8 w-auto" />
            <span className="font-semibold text-lg hidden md:inline-block text-foreground">Portal do Cliente</span>
          </Link>
        </div>
        
        {/* Title for mobile, breadcrumbs for larger screens */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sm:hidden text-lg font-semibold text-foreground">
            {displayTitle}
        </div>

        <div className="hidden sm:flex items-center text-sm text-muted-foreground flex-1 justify-center px-4">
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.href} className="flex items-center">
                {index > 0 && <ChevronLeft className="h-3 w-3 rotate-180 mx-1 text-muted-foreground" />}
                <Link 
                    href={crumb.href} 
                    className={`hover:text-primary transition-colors ${index === breadcrumbs.length - 1 ? 'text-primary font-medium pointer-events-none' : 'text-muted-foreground'}`}
                    aria-current={index === breadcrumbs.length - 1 ? 'page' : undefined}
                >
                  {crumb.label}
                </Link>
              </span>
            ))}
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Language Toggle Placeholder */}
          <div className="hidden md:flex items-center">
            <Button variant="ghost" size="sm" className="text-xs px-2" disabled>EN</Button>
            <span className="text-xs text-muted-foreground">|</span>
            <Button variant="ghost" size="sm" className="text-xs px-2 font-semibold text-primary">PT</Button>
            <span className="text-xs text-muted-foreground">|</span>
            <Button variant="ghost" size="sm" className="text-xs px-2" disabled>ES</Button>
          </div>
          
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon" aria-label="Notificações" disabled>
            <Bell className="h-5 w-5" />
            {/* <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" /> */}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.photoURL || `https://placehold.co/100x100.png`} alt={user?.displayName || 'Cliente'} data-ai-hint="avatar cliente" />
                  <AvatarFallback>{user?.displayName?.charAt(0)?.toUpperCase() || 'C'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.displayName || 'Empresa Cliente'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || 'cliente@empresa.com'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* Add client-specific profile/settings link here if needed */}
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span> 
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
