
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, FileText, Brain, Users, Car, Gem, ShieldCheck, Building, Megaphone, Library, Landmark, Settings as SettingsIcon, LifeBuoy,
  ClipboardList, FileSearch, AlertOctagon, Signal, UploadCloud, CalendarDays 
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const mainNavItems = [
  { href: '/dashboard', label: 'Painel', icon: Home }, 
  { href: '/reports', label: 'Relatórios', icon: FileText }, 
  { href: '/predictive-analysis', label: 'Análise Preditiva', icon: Brain }, 
];

const moduleNavItems = [
  { href: '/trainings', label: 'Agenda', icon: CalendarDays }, 
  { href: '/fleet', label: 'Frota', icon: Car }, 
  { href: '/epis', label: 'EPIs', icon: ShieldCheck }, 
  { href: '/empresas', label: 'Empresas', icon: Building }, 
  { href: '/campanhas', label: 'Campanhas', icon: Megaphone }, 
  { href: '/biblioteca', label: 'Biblioteca', icon: Library }, 
  { href: '/financeiro', label: 'Financeiro', icon: Landmark },
  { href: '/programas', label: 'Programas', icon: ClipboardList },
  { href: '/auditorias', label: 'Auditorias', icon: FileSearch },
  { href: '/riscos', label: 'Riscos', icon: AlertOctagon },
  { href: '/cipa', label: 'CIPA', icon: Users }, 
  { href: '/iot', label: 'IOT', icon: Signal },
  { href: '/esocial', label: 'eSocial', icon: UploadCloud },
  { href: '/gamification', label: 'Gamificação', icon: Gem },
  { href: '/suporte', label: 'Suporte', icon: LifeBuoy },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { isMobile, setOpenMobile, open } = useSidebar(); 

  const handleLinkClick = () => {
    if (isMobile) { 
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar 
      variant="sidebar" 
      collapsible="icon"
      side="left" 
      className={cn(
        "border-r fixed top-0 left-0 h-screen pt-16 z-30"
      )}
    >
      <SidebarContent className="flex-1 pt-4">
        <SidebarMenu>
          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
              Navegação Principal 
            </SidebarGroupLabel>
            {mainNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref legacyBehavior>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
                    onClick={handleLinkClick}
                    tooltip={{children: item.label, className: "ml-2"}}
                    className={cn(
                      "justify-start",
                      (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))) && "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}
                  >
                    <a>
                      <item.icon className="h-5 w-5" />
                      <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarGroup>
          <SidebarSeparator />
           <SidebarGroup>
             <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
              Módulos 
            </SidebarGroupLabel>
            {moduleNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref legacyBehavior>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href)}
                    onClick={handleLinkClick}
                    tooltip={{children: item.label, className: "ml-2"}}
                     className={cn(
                      "justify-start",
                      pathname.startsWith(item.href) && "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}
                  >
                    <a>
                      <item.icon className="h-5 w-5" />
                       <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarGroup>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center">
        <Link href="/settings" passHref legacyBehavior>
          <Button variant="ghost" className="w-full justify-start group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:p-2" onClick={handleLinkClick}>
              <SettingsIcon className="h-5 w-5"/>
              <span className="group-data-[collapsible=icon]:hidden ml-2">Configurações</span> 
          </Button>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}

    