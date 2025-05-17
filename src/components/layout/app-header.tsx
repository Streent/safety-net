
'use client';
import Link from 'next/link';
import { Bell, ChevronLeft, Home, LogOut, Settings, UserCircle, Menu, PanelLeft } from 'lucide-react'; // Adicionado PanelLeft
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
  useSidebar,
} from "@/components/ui/sidebar"; 
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  pageTitle?: string;
}

function generateBreadcrumbs(pathname: string) {
  const pathSegments = pathname.split('/').filter(segment => segment);
  const breadcrumbs = [{ href: '/', label: 'Início' }]; 

  let currentPath = '';
  pathSegments.forEach(segment => {
    currentPath += `/${segment}`;
    let label = segment.charAt(0).toUpperCase() + segment.slice(1);
    if (label === "Dashboard") label = "Painel";
    if (label === "Predictive-analysis") label = "Análise Preditiva";
    if (label === "Reports") label = "Relatórios";
    if (label === "Trainings") label = "Treinamentos";
    if (label === "Fleet") label = "Frota";
    if (label === "Epis") label = "EPIs";
    if (label === "Empresas") label = "Empresas";
    if (label === "Campanhas") label = "Campanhas";
    if (label === "Biblioteca") label = "Biblioteca";
    if (label === "Financeiro") label = "Financeiro";
    if (label === "Suporte") label = "Suporte";
    if (label === "Gamification") label = "Gamificação";
    if (label === "Programas") label = "Programas";
    if (label === "Auditorias") label = "Auditorias";
    if (label === "Riscos") label = "Riscos";
    if (label === "Cipa") label = "CIPA";
    if (label === "Iot") label = "IOT"; 
    if (label === "Esocial") label = "eSocial"; 
    if (label === "Settings") label = "Configurações";

    if (segment === "new") label = "Novo";
    if (segment.match(/^(EMP|RPT|EPI|TRN|CAMP|PROG)\d+$/i)) {
      label = `Detalhes ${segment.toUpperCase()}`;
    }

    breadcrumbs.push({ href: currentPath, label });
  });
  return breadcrumbs;
}


export function AppHeader({ pageTitle }: AppHeaderProps) { 
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);
  const { isMobile, toggleSidebar, open } = useSidebar(); // 'open' é o estado do SidebarProvider

  const currentTitleFromBreadcrumb = breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length -1].label : "Painel";
  const displayTitle = pageTitle || currentTitleFromBreadcrumb;

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    )}>
      <div className="container flex h-16 items-center justify-between max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          {/* Botão para alternar sidebar em mobile E desktop */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar} 
            className={cn(
              "mr-2",
              isMobile ? "md:hidden" : "hidden md:flex" // Mostra Menu em mobile, PanelLeft em desktop
            )}
            aria-label="Alternar Sidebar"
          >
            {isMobile ? <Menu className="h-6 w-6" /> : (open ? <PanelLeft className="h-6 w-6" /> : <Menu className="h-6 w-6" />)}
          </Button>
          
          <Link href="/dashboard" className="mr-4 hidden md:flex">
            <Logo className="h-8 w-auto" />
          </Link>
          
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
          <h1 className="text-lg font-semibold md:hidden">{displayTitle}</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center text-sm">
            <Button variant="ghost" size="sm" aria-label="Mudar para Inglês (Placeholder)">EN</Button>
            <span className="text-muted-foreground mx-1">|</span>
            <Button variant="ghost" size="sm" aria-label="Idioma Atual: Português" className="font-semibold text-primary">PT</Button>
            <span className="text-muted-foreground mx-1">|</span>
            <Button variant="ghost" size="sm" aria-label="Mudar para Espanhol (Placeholder)">ES</Button>
          </div>
          <ThemeToggle />
          <Button variant="ghost" size="icon" aria-label="Notificações">
            <Bell className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.photoURL || `https://placehold.co/100x100.png`} alt={user?.displayName || 'Usuário'}  data-ai-hint="avatar usuário" />
                  <AvatarFallback>{user?.displayName?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.displayName || 'Nome do Usuário'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || 'usuario@example.com'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <Link href="/settings" passHref>
                    <DropdownMenuItem>
                        <UserCircle className="mr-2 h-4 w-4" />
                        <span>Perfil</span> 
                    </DropdownMenuItem>
                </Link>
                <Link href="/settings" passHref>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span> 
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
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
