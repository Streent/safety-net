
import { BarChart3, FileText, AlertTriangle, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OverviewCharts } from '@/components/dashboard/charts/overview-charts';
import { OfflineBanner } from '@/components/common/offline-banner';
import { GamificationSummary } from '@/components/dashboard/gamification-summary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

// Placeholder for Reports List
function RecentReportsListPlaceholder() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatórios Recentes</CardTitle> {/* i18n: dashboard.recentReportsTitle */}
        <CardDescription>Últimos incidentes e observações de segurança.</CardDescription> {/* i18n: dashboard.recentReportsDesc */}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-2 border rounded-md">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Placeholder for Alerts List
function AlertsListPlaceholder() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Alertas Ativos</CardTitle> {/* i18n: dashboard.alertsTitle */}
        <CardDescription>Notificações não lidas e alertas críticos.</CardDescription> {/* i18n: dashboard.alertsDesc */}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3 p-3 border rounded-md bg-destructive/10 border-destructive/30">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">Alerta de Alta Prioridade {i + 1}</p> {/* i18n: dashboard.alertItemTitle */}
                  <p className="text-xs text-muted-foreground">Detalhes sobre o alerta que requer atenção.</p> {/* i18n: dashboard.alertItemDesc */}
                </div>
                <Button variant="ghost" size="sm" className="text-xs">Dispensar</Button> {/* i18n: dashboard.dismissAlertButton */}
              </div>
            ))}
             <div className="text-center text-sm text-muted-foreground py-4">
              Sem novos alertas. {/* i18n: dashboard.noNewAlerts */}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}


export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Painel Principal" description="Bem-vindo ao SafetyNet. Aqui está sua visão geral de segurança." /> {/* i18n: dashboard.title, dashboard.description */}
      
      <div className="flex-grow overflow-y-auto pb-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Relatórios Este Mês" value={125} iconName="FileText" subtitle="+15 desde o mês passado" iconColor="text-blue-500" /> {/* i18n: dashboard.statReports */}
          <StatCard title="Treinamentos Agendados" value={8} iconName="ShieldCheck" subtitle="2 próximos esta semana" iconColor="text-green-500" /> {/* i18n: dashboard.statTrainings */}
          <StatCard title="EPIs com Baixo Estoque" value={3} iconName="AlertTriangle" subtitle="Pedir novas máscaras" iconColor="text-yellow-500" /> {/* i18n: dashboard.statEPIs */}
          <StatCard title="Incidentes (30 Dias)" value={22} iconName="BarChart3" subtitle="-5 desde o mês passado" iconColor="text-red-500" /> {/* i18n: dashboard.statIncidents */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger> {/* i18n: dashboard.tabOverview */}
                <TabsTrigger value="reports">Relatórios</TabsTrigger> {/* i18n: dashboard.tabReports */}
              </TabsList>
              <TabsContent value="overview" className="space-y-4">
                <OverviewCharts />
              </TabsContent>
              <TabsContent value="reports">
                <RecentReportsListPlaceholder />
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            <AlertsListPlaceholder />
          </div>
        </div>
      </div>
      
      <OfflineBanner />
      <div className="mt-auto">
        <GamificationSummary />
      </div>
    </div>
  );
}
