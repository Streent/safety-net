'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Home, FileText, Brain, ShieldQuestion, Settings, Users, Car, Gem } from 'lucide-react'; // Added Users, Car, Gem
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/common/logo';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';


const mainNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home }, // i18n: sidebar.dashboard
  { href: '/reports', label: 'Reports', icon: FileText }, // i18n: sidebar.reports
  { href: '/predictive-analysis', label: 'Predictive Analysis', icon: Brain }, // i18n: sidebar.predictiveAnalysis
];

const otherNavItems = [
  { href: '/trainings', label: 'Trainings', icon: Users }, // i18n: sidebar.trainings Changed icon and href
  { href: '/fleet', label: 'Fleet', icon: Car }, // i18n: sidebar.fleet Changed icon and href
  { href: '/gamification', label: 'Gamification', icon: Gem } // i18n: sidebar.gamification Added
];


export function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  const handleLinkClick = () => {
    setOpenMobile(false); // Close mobile sidebar on link click
  };

  return (
    <Sidebar variant="sidebar" collapsible="icon" side="left" className="border-r">
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={handleLinkClick}>
          <Logo className="h-8 w-auto group-data-[collapsible=icon]:hidden" />
          {/* Using ShieldQuestion as a generic app icon when collapsed */}
          <ShieldQuestion className="h-8 w-8 text-primary hidden group-data-[collapsible=icon]:block" />
        </Link>
      </SidebarHeader>

      <SidebarContent className="flex-1">
        <SidebarMenu>
          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
              {/* i18n: sidebar.mainNavigation */}
              Main Navigation
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
              {/* i18n: sidebar.otherModules */}
              Modules
            </SidebarGroupLabel>
            {otherNavItems.map((item) => (
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
        <Button variant="ghost" className="w-full justify-start group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:p-2">
            <Settings className="h-5 w-5"/>
            <span className="group-data-[collapsible=icon]:hidden ml-2">{/* i18n: sidebar.settings */}Settings</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
