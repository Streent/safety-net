
// src/components/layout/app-header.tsx
'use client';
import Link from 'next/link';
import { Bell, ChevronLeft, Home, LogOut, Settings, UserCircle, Menu, PanelLeft } from 'lucide-react';
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
  const breadcrumbs = [{ href: '/dashboard', label: 'Início' }]; 

  let currentPath = '';
  pathSegments.forEach((segment, i) => {
    currentPath += `/${segment}`;
    let label = segment.charAt(0).toUpperCase() + segment.slice(1);
    
    // Specific translations and adjustments
    if (label === "Dashboard" && breadcrumbs.length === 1) { 
        breadcrumbs[0].label = "Painel"; 
        return; 
    }
    if (label === "Predictive-analysis") label = "Análise Preditiva";
    if (label === "Reports") label = "Relatórios";
    if (label === "Trainings") label = "Treinamentos";
    if (label === "Fleet") {
        label = "Frota";
        if (pathSegments.includes('request') && segment === 'request') label = "Solicitar Veículo";
        if (pathSegments.includes('checklist') && segment === 'checklist') label = "Checklist";
        if (pathSegments.includes('fuel') && segment === 'fuel') label = "Abastecimento";
    }
    if (label === "Epis") {
        label = "EPIs";
        if (pathSegments.includes('distribuicao') && segment === 'distribuicao') label = "Distribuição";
    }
    if (label === "Empresas") {
        label = "Empresas";
        // Verifica se o segmento anterior é "empresas" e se o segmento atual parece um ID
        if (i > 0 && pathSegments[i-1] === "empresas" && (segment.match(/^(EMP|CON|IND|SERV|TEC|AGRO)/i) || (segment.length > 5 && segment.match(/[A-Z0-9]{3,}/)))) { 
            label = `Detalhes`; // ou "Detalhes Empresa" se preferir mais específico
        }
    }
    if (label === "Campanhas") label = "Campanhas";
    if (label === "Biblioteca") label = "Biblioteca";
    if (label === "Financeiro") label = "Financeiro";
    if (label === "Suporte") label = "Suporte";
    if (label === "Gamification") label = "Gamificação";
    if (label === "Programas") {
      label = "Programas";
      if (pathSegments.includes('editor') && segment === 'editor') label = "Editor";
    }
    if (label === "Auditorias") label = "Auditorias";
    if (label === "Riscos") label = "Riscos";
    if (label === "Cipa") label = "CIPA";
    if (label === "Iot") label = "IOT"; 
    if (label === "Esocial") label = "eSocial"; 
    if (label === "Settings") label = "Configurações";
    
    // Evitar adicionar "new" ou IDs genéricos como breadcrumbs finais se o contexto já é claro
    if ((segment === "new" || segment.match(/^(V|RPT|EPI|TRN|CAMP|PROG|AUD)\d+/i)) && 
        breadcrumbs.length > 1 && 
        !["Empresas", "Frota", "EPIs", "Programas", "Auditorias"].includes(breadcrumbs[breadcrumbs.length-1].label) && // Não simplifica se o pai for uma lista genérica
        !breadcrumbs[breadcrumbs.length-1].label.startsWith("Detalhes")) { // Não simplifica se o pai já for um detalhe
      return; 
    }


    breadcrumbs.push({ href: currentPath, label });
  });
  return breadcrumbs;
}


export function AppHeader({ pageTitle }: AppHeaderProps) { 
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);
  const { isMobile, toggleSidebar, open } = useSidebar(); 

  // Determine the title for mobile view
  let mobileDisplayTitle = "Painel"; 
  if (breadcrumbs.length > 1) {
    const lastCrumb = breadcrumbs[breadcrumbs.length - 1];
    const secondLastCrumb = breadcrumbs.length > 2 ? breadcrumbs[breadcrumbs.length - 2] : null;

    mobileDisplayTitle = lastCrumb.label;
    
    if (["Solicitar Veículo", "Checklist", "Abastecimento", "Distribuição", "Editor"].includes(lastCrumb.label)) {
      mobileDisplayTitle = lastCrumb.label; // Show full for these specific actions
    } else if (lastCrumb.label === "Detalhes" && secondLastCrumb) {
        mobileDisplayTitle = `${secondLastCrumb.label} Detalhes`; // e.g. "Empresas Detalhes"
    } else if (mobileDisplayTitle === "Análise Preditiva") {
        mobileDisplayTitle = "Análise Pred.";
    }
  } else if (pathname === "/dashboard") {
    mobileDisplayTitle = "Painel";
  }


  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    )}>
      <div className="container flex h-16 items-center justify-between max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 sm:gap-2">
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar} 
            className={cn(
              "mr-1 sm:mr-2",
            )}
            aria-label="Alternar Sidebar"
          >
            {isMobile ? <Menu className="h-6 w-6" /> : (open ? <PanelLeft className="h-6 w-6" /> : <Menu className="h-6 w-6" />)}
          </Button>
          
          <Link href="/dashboard" className="mr-2 hidden md:flex items-center" aria-label="Ir para o Painel">
            <Logo className="h-8 w-auto" />
          </Link>
          
           <div className="hidden md:flex items-center text-sm text-muted-foreground">
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.href} className="flex items-center">
                {index > 0 && <ChevronLeft className="h-4 w-4 rotate-180 mx-1 text-muted-foreground/70" />}
                
                {index === 0 && (pathname === '/dashboard' || breadcrumbs.length === 1) ? (
                   <Home className="h-4 w-4 text-foreground"/>
                ) : index === 0 ? (
                   <Link href={'/dashboard'} className="hover:text-foreground transition-colors" aria-label="Início">
                     <Home className="h-4 w-4" />
                   </Link>
                ) : null}

                {index > 0 && (
                  <Link 
                    href={crumb.href} 
                    className={`hover:text-foreground transition-colors ${index === breadcrumbs.length - 1 ? 'text-foreground font-medium pointer-events-none' : ''}`}
                    aria-current={index === breadcrumbs.length - 1 ? "page" : undefined}
                  >
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </div>
          
          <h1 className="text-lg font-semibold md:hidden truncate max-w-[150px] xs:max-w-[200px] sm:max-w-xs">{mobileDisplayTitle}</h1>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden sm:flex items-center text-sm">
            <Button variant="ghost" size="sm" aria-label="Mudar para Inglês (Placeholder)" className="px-2 text-xs opacity-70">EN</Button>
            <span className="text-muted-foreground mx-0.5">|</span>
            <Button variant="ghost" size="sm" aria-label="Idioma Atual: Português" className="font-semibold text-primary px-2 text-xs">PT</Button>
            <span className="text-muted-foreground mx-0.5">|</span>
            <Button variant="ghost" size="sm" aria-label="Mudar para Espanhol (Placeholder)" className="px-2 text-xs opacity-70">ES</Button>
          </div>
          <ThemeToggle />
          <Button variant="ghost" size="icon" aria-label="Notificações">
            <Bell className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
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
                <Link href="/settings" passHref legacyBehavior>
                    <DropdownMenuItem>
                        <UserCircle className="mr-2 h-4 w-4" />
                        <span>Perfil</span> 
                    </DropdownMenuItem>
                </Link>
                <Link href="/settings" passHref legacyBehavior>
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
