'use client';
import Link from 'next/link';
import { Bell,ChevronLeft, Home, LogOut, Settings, UserCircle, Menu } from 'lucide-react';
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
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { useAuth } from '@/hooks/use-auth';
import { usePathname } from 'next/navigation';
import {
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"; // Assuming SidebarTrigger is for mobile toggle


interface AppHeaderProps {
  pageTitle?: string;
}

// Simplified breadcrumb logic
function generateBreadcrumbs(pathname: string) {
  const pathSegments = pathname.split('/').filter(segment => segment);
  const breadcrumbs = [{ href: '/', label: 'Home' }]; // i18n: breadcrumbs.home

  let currentPath = '';
  pathSegments.forEach(segment => {
    currentPath += `/${segment}`;
    // Capitalize first letter for label
    const label = segment.charAt(0).toUpperCase() + segment.slice(1); 
    breadcrumbs.push({ href: currentPath, label });
  });
  return breadcrumbs;
}


export function AppHeader({ pageTitle }: AppHeaderProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);
  const { isMobile, toggleSidebar } = useSidebar();

  const currentTitle = pageTitle || (breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length -1].label : "Dashboard");

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2 md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
          )}
          {!isMobile && (
            <Link href="/dashboard" className="mr-4 hidden md:flex">
              <Logo className="h-8 w-auto" />
            </Link>
          )}
           <div className="hidden md:flex items-center text-sm text-muted-foreground">
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.href} className="flex items-center">
                {index > 0 && <ChevronLeft className="h-4 w-4 rotate-180 mx-1" />}
                {index === 0 && index < breadcrumbs.length -1 && pathname !== '/dashboard' && (
                   <Link href={'/dashboard'} className="hover:text-foreground">
                     <Home className="h-4 w-4" />
                   </Link>
                )}
                 {index === 0 && (pathname === '/dashboard' || breadcrumbs.length === 1) && <Home className="h-4 w-4 text-foreground"/>}
                {index > 0 && (
                  <Link href={crumb.href} className={`hover:text-foreground ${index === breadcrumbs.length - 1 ? 'text-foreground font-medium' : ''}`}>
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </div>
          <h1 className="text-lg font-semibold md:hidden">{currentTitle}</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Placeholder for Language Switcher */}
          <div className="hidden sm:flex items-center text-sm">
            <Button variant="ghost" size="sm">EN</Button>
            <span className="text-muted-foreground mx-1">|</span>
            <Button variant="ghost" size="sm">PT</Button>
            <span className="text-muted-foreground mx-1">|</span>
            <Button variant="ghost" size="sm">ES</Button>
          </div>
          <ThemeToggle />
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            {/* Example badge: <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span> */}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.photoURL || `https://placehold.co/100x100.png`} alt={user?.displayName || 'User'}  data-ai-hint="user avatar" />
                  <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.displayName || 'User Name'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Profile</span> {/* i18n: header.profile */}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span> {/* i18n: header.settings */}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span> {/* i18n: header.logout */}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
