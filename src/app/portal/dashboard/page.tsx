
'use client';

import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, FileWarning, ListChecks, PlusCircle, AlertTriangleIcon } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth'; 

export default function ClientPortalDashboardPage() {
  const { user } = useAuth();
  // Attempt to get a more specific company name, fallback to displayName or a generic
  const companyName = user?.displayName || "Cliente"; 

  // Mock data - Replace with actual data fetching
  const upcomingTrainings = [
    { id: 1, title: 'NR-35 Reciclagem', date: '25/07/2024', time: '09:00 - 17:00' },
    { id: 2, title: 'Primeiros Socorros', date: '10/08/2024', time: '14:00 - 18:00' },
    { id: 3, title: 'Uso de EPIs Avançado', date: '15/09/2024', time: '08:30 - 12:30' },
  ];
  const documentsExpiringSoon = { count: 2, nextDueDate: '01/08/2024' };
  const pendingRequests = 3;

  return (
    <>
      <PageHeader
        title={`Bem-vindo(a) de volta, ${companyName}!`}
        description="Aqui está um resumo das suas atividades e informações importantes no Portal do Cliente."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <CalendarDays className="mr-2 h-5 w-5 text-primary" />
              Seus Próximos Treinamentos
            </CardTitle>
            <CardDescription>Os 3 treinamentos mais próximos agendados para sua empresa.</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingTrainings.length > 0 ? (
              <ul className="space-y-3 text-sm">
                {upcomingTrainings.slice(0,3).map(training => (
                  <li key={training.id} className="p-2 border-l-4 border-primary bg-muted/50 rounded-r-md">
                    <p className="font-medium text-foreground">{training.title}</p>
                    <p className="text-xs text-muted-foreground">{training.date} às {training.time}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">Nenhum treinamento agendado.</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <FileWarning className="mr-2 h-5 w-5 text-destructive" />
              Documentos Expirando
            </CardTitle>
             <CardDescription>Documentos que necessitam de atenção em breve.</CardDescription>
          </CardHeader>
          <CardContent>
            {documentsExpiringSoon.count > 0 ? (
              <div className="space-y-1 text-center">
                <p className="text-3xl font-bold text-destructive flex items-center justify-center">
                    <AlertTriangleIcon className="h-7 w-7 mr-2"/> {documentsExpiringSoon.count} 
                    <span className="text-lg font-medium text-muted-foreground ml-1">documento(s)</span>
                </p>
                <p className="text-xs text-muted-foreground">Próximo vencimento em: {documentsExpiringSoon.nextDueDate}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic text-center">Nenhum documento expirando em breve.</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <ListChecks className="mr-2 h-5 w-5 text-yellow-500" />
              Suas Solicitações
            </CardTitle>
            <CardDescription>Solicitações de serviço recentes ou pendentes.</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingRequests > 0 ? (
               <div className="space-y-1 text-center">
                <p className="text-3xl font-bold text-yellow-600">{pendingRequests} 
                    <span className="text-lg font-medium text-muted-foreground ml-1">pendente(s)</span>
                </p>
                 <p className="text-xs text-muted-foreground">Acompanhe o status na seção 'Solicitações'.</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic text-center">Nenhuma solicitação pendente.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sticky "Request New Service" button for mobile, regular button for desktop */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t border-border shadow-t-lg md:shadow-none md:static md:p-0 md:border-none md:flex md:justify-end md:mt-8 z-30">
        <Button size="lg" className="w-full md:w-auto" onClick={() => alert('Abrir formulário de solicitação de serviço (placeholder)')}>
          <PlusCircle className="mr-2 h-5 w-5" />
          Solicitar Novo Serviço
        </Button>
      </div>
      
      {/* Placeholder for upcoming features */}
      <div className="mt-12 pt-8 border-t">
        <h3 className="text-xl font-semibold mb-3 text-center text-foreground">Em Breve no Portal do Cliente</h3>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div className="p-4 border rounded-lg bg-card shadow">
                <h4 className="font-medium text-primary mb-1">Centro de Documentos Detalhado</h4>
                <p className="text-muted-foreground">Acesso completo a certificados, PGR, PCMSO, relatórios de auditoria. Filtros avançados, histórico de versões e downloads.</p>
            </div>
            <div className="p-4 border rounded-lg bg-card shadow">
                <h4 className="font-medium text-primary mb-1">Agendamentos Interativos</h4>
                <p className="text-muted-foreground">Calendário para visualizar disponibilidade de técnicos e salas. Solicite inspeções, auditorias e treinamentos diretamente.</p>
            </div>
            <div className="p-4 border rounded-lg bg-card shadow">
                <h4 className="font-medium text-primary mb-1">Gerenciamento de Solicitações</h4>
                <p className="text-muted-foreground">Formulário para pedir alterações em programas, anexar arquivos, acompanhar status e fornecer feedback sobre serviços concluídos.</p>
            </div>
             <div className="p-4 border rounded-lg bg-card shadow">
                <h4 className="font-medium text-primary mb-1">Central de Notificações</h4>
                <p className="text-muted-foreground">Alertas em tempo real sobre atualizações de documentos, vencimentos, status de solicitações e mais.</p>
            </div>
        </div>
      </div>
    </>
  );
}
