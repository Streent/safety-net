
import { BarChart3, FileText, AlertTriangle, ShieldCheck, Info, Bell } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator'; // Added for visual separation in alerts
import { Input } from "@/components/ui/input"; // Added Input import

// Placeholder for Reports List
function RecentReportsListPlaceholder() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatórios Recentes</CardTitle>
        <CardDescription>Últimos incidentes e observações de segurança.</CardDescription>
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

interface AlertItem {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string; // e.g., "2 horas atrás" or a formatted date
}

const mockAlerts: AlertItem[] = [
  { id: 'alert1', type: 'critical', title: 'EPI Expirado: Capacete V001', description: 'O capacete de segurança do técnico João Silva está com a validade expirada.', timestamp: 'Agora mesmo' },
  { id: 'alert2', type: 'warning', title: 'Baixo Estoque: Luvas de Proteção', description: 'Apenas 5 pares de luvas de proteção restantes no Almoxarifado A.', timestamp: '15 minutos atrás' },
  { id: 'alert3', type: 'info', title: 'Novo Treinamento Agendado', description: 'Treinamento de NR-35 agendado para 25/08.', timestamp: '1 hora atrás' },
  { id: 'alert4', type: 'critical', title: 'Falha no Sensor de Gás - Área B', description: 'O sensor de gás na Área B reportou uma falha. Verificação imediata necessária.', timestamp: '3 horas atrás' },
];


function AlertsList() {
  const { toast } = useToast();

  const handleDismissAlert = (alertId: string, alertTitle: string) => {
    toast({
      title: 'Alerta Dispensado (Placeholder)',
      description: `O alerta "${alertTitle}" foi marcado como dispensado. Funcionalidade de persistência a ser implementada.`,
    });
    // In a real app, you would update the alert's state (e.g., mark as read/dismissed)
    // and potentially filter it from the displayed list or change its appearance.
  };

  const getAlertIcon = (type: AlertItem['type']) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />;
    }
  };

  const getAlertCardClass = (type: AlertItem['type']) => {
    switch (type) {
      case 'critical':
        return 'bg-destructive/10 border-destructive/30';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30';
      case 'info':
      default:
        return 'bg-blue-500/10 border-blue-500/30';
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="mr-2 h-5 w-5 text-primary" />
          Alertas Ativos
        </CardTitle>
        <CardDescription>Notificações importantes e alertas críticos que requerem sua atenção.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px] pr-3">
          {mockAlerts.length > 0 ? (
            <div className="space-y-4">
              {mockAlerts.map((alert) => (
                <Card key={alert.id} className={`p-3 shadow-sm transition-all hover:shadow-md ${getAlertCardClass(alert.type)}`}>
                  <div className="flex items-start space-x-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1 space-y-1">
                      <p className={`text-sm font-semibold ${alert.type === 'critical' ? 'text-destructive' : alert.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'}`}>
                        {alert.title}
                      </p>
                      <p className="text-xs text-muted-foreground leading-snug">
                        {alert.description}
                      </p>
                       <p className="text-xs text-muted-foreground/80 pt-1">
                        {alert.timestamp}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end mt-2">
                    <Button 
                      variant="ghost" 
                      size="xs" 
                      className="text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => handleDismissAlert(alert.id, alert.title)}
                    >
                      Dispensar
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Bell className="h-12 w-12 mb-3 text-green-500" />
              <p className="font-medium">Tudo certo por aqui!</p>
              <p className="text-sm">Sem novos alertas no momento.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}


export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Painel Principal" description="Bem-vindo ao SafetyNet. Aqui está sua visão geral de segurança." />
      
      <div className="flex-grow overflow-y-auto pb-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Relatórios Este Mês" value={125} iconName="FileText" subtitle="+15 desde o mês passado" iconColor="text-blue-500" />
          <StatCard title="Treinamentos Agendados" value={8} iconName="ShieldCheck" subtitle="2 próximos esta semana" iconColor="text-green-500" />
          <StatCard title="EPIs com Baixo Estoque" value={3} iconName="AlertTriangle" subtitle="Pedir novas máscaras" iconColor="text-yellow-500" />
          <StatCard title="Incidentes (30 Dias)" value={22} iconName="BarChart3" subtitle="-5 desde o mês passado" iconColor="text-red-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="reports">Relatórios</TabsTrigger>
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
            <AlertsList />
          </div>
        </div>
         {/* Placeholder for Análise Comparativa Dinâmica */}
        <Card>
          <CardHeader>
            <CardTitle>Análise Comparativa Dinâmica (Placeholder)</CardTitle>
            <CardDescription>Compare diferentes períodos, técnicos ou unidades.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label htmlFor="periodA" className="text-sm font-medium text-muted-foreground">Período A</label>
                <Input type="text" id="periodA" placeholder="Ex: Últimos 30 dias" disabled className="mt-1" />
              </div>
              <div>
                <label htmlFor="periodB" className="text-sm font-medium text-muted-foreground">Período B</label>
                <Input type="text" id="periodB" placeholder="Ex: Mês Anterior" disabled className="mt-1" />
              </div>
              <div>
                <label htmlFor="metric" className="text-sm font-medium text-muted-foreground">Métrica</label>
                <Input type="text" id="metric" placeholder="Ex: Técnicos" disabled className="mt-1" />
              </div>
            </div>
            <Button disabled>Aplicar Comparação</Button>
            <div className="mt-4 p-6 border rounded-lg bg-muted/30 text-center text-muted-foreground">
              <BarChart3 className="mx-auto h-10 w-10 mb-2" />
              <p className="text-sm">Gráficos comparativos e variações percentuais aparecerão aqui.</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <OfflineBanner />
      <div className="mt-auto">
        <GamificationSummary />
      </div>
    </div>
  );
}

