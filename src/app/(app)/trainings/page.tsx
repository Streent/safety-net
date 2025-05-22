
'use client'; 

import { useState, useEffect, useMemo, useCallback } from 'react'; // Added useCallback here as well
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar'; 
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, Users, Download, Camera, AlertTriangle, CheckCircle, PlusCircle, GripVertical, UsersRound } from 'lucide-react'; 
import { format, isEqual, startOfDay, addMonths, differenceInDays as fnsDifferenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface TrainingSession {
  id: string;
  title: string;
  type: 'Treinamento' | 'Consultoria' | 'Auditoria Agendada' | 'Outro Evento';
  topic: string;
  location: string;
  date: Date;
  startTime: string;
  endTime: string;
  technician: string;
  participants?: string[];
  isRecurring?: boolean;
  renewalDue?: Date;
  capacity?: number;
  bookedSlots?: number;
}

const mockSessions: TrainingSession[] = [
  { id: 'TRN001', title: 'NR-35 (Trabalho em Altura)', type: 'Treinamento', topic: 'Segurança em Altura', location: 'Sala de Treinamento A', date: new Date(2024, 6, 15), startTime: '09:00', endTime: '17:00', technician: 'Carlos Silva', renewalDue: addMonths(new Date(2024, 6, 15), 11), capacity: 20, bookedSlots: 15 },
  { id: 'TRN002', title: 'Uso Correto de EPIs', type: 'Treinamento', topic: 'Equipamentos de Proteção', location: 'Auditório Principal', date: new Date(2024, 6, 15), startTime: '14:00', endTime: '16:00', technician: 'Ana Pereira', capacity: 50, bookedSlots: 48 },
  { id: 'TRN003', title: 'Primeiros Socorros Básico', type: 'Treinamento', topic: 'Atendimento Emergencial', location: 'Sala de Treinamento B', date: new Date(2024, 6, 22), startTime: '08:00', endTime: '12:00', technician: 'Juliana Costa', capacity: 15, bookedSlots: 10 },
  { id: 'CON001', title: 'Consultoria PGR', type: 'Consultoria', topic: 'Análise de Riscos', location: 'Cliente Y - Sala Reuniões', date: new Date(2024, 6, 18), startTime: '10:00', endTime: '12:00', technician: 'Roberto Alves', capacity: 5, bookedSlots: 3 },
  { id: 'AUD001', title: 'Auditoria Interna ISO 45001', type: 'Auditoria Agendada', topic: 'Sistema de Gestão', location: 'Setor de Produção', date: new Date(2024, 7, 5), startTime: '09:00', endTime: '17:00', technician: 'Fernanda Lima', isRecurring: true, capacity: 10, bookedSlots: 7 },
  { id: 'TRN004', title: 'Segurança com Eletricidade', type: 'Treinamento', topic: 'NR-10 Básico', location: 'Sala de Treinamento A', date: new Date(2024, 7, 5), startTime: '13:00', endTime: '17:00', technician: 'Carlos Silva', capacity: 20, bookedSlots: 18 },
];


export default function TrainingsAndAppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const scheduledDays = useMemo(() => mockSessions.map(s => startOfDay(s.date)), []);

  const sessionsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return mockSessions.filter(session => 
        isEqual(startOfDay(session.date), startOfDay(selectedDate))
      ).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [selectedDate]);


  const handleDateSelect = useCallback((date: Date | undefined) => {
    setSelectedDate(date);
    if (date) { 
      setIsSheetOpen(true);
    }
  }, []);
  
  const handleCheckIn = useCallback((sessionId: string) => {
    toast({
      title: 'Check-in via Selfie (Placeholder)',
      description: `Funcionalidade de check-in com selfie e validação por IA para a sessão ${sessionId} será implementada aqui.`,
    });
  }, [toast]);

  const handleGenerateCertificate = useCallback((sessionId: string) => {
     toast({
      title: 'Gerar Certificado (Placeholder)',
      description: `Funcionalidade para gerar certificado em PDF com QR code para a sessão ${sessionId} será implementada aqui.`,
    });
  }, [toast]);

  const handleNewAppointment = useCallback(() => {
    toast({
        title: "Novo Agendamento",
        description: "Funcionalidade para criar um novo agendamento (treinamento, consultoria, etc.) será implementada aqui, provavelmente em um formulário ou modal."
    });
  }, [toast]);

  const getEventTypeColor = (type: TrainingSession['type']) => {
    switch(type) {
        case 'Treinamento': return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
        case 'Consultoria': return 'bg-purple-500/20 text-purple-700 border-purple-500/30';
        case 'Auditoria Agendada': return 'bg-teal-500/20 text-teal-700 border-teal-500/30';
        default: return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  }

  return (
    <>
      <PageHeader 
        title="Agenda de Eventos e Treinamentos" 
        description="Visualize o calendário de treinamentos, consultorias e outros eventos. Gerencie sessões e acompanhe participações." 
      />
      <Tabs defaultValue="month" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4 sm:w-[400px]">
          <TabsTrigger value="month">Visão Mensal</TabsTrigger>
          <TabsTrigger value="week" disabled>Visão Semanal (Em Breve)</TabsTrigger>
        </TabsList>
        <TabsContent value="month">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="mr-2 h-6 w-6 text-primary" />
                Calendário de Eventos
              </CardTitle>
              <CardDescription>
                Selecione uma data para ver os eventos agendados. Dias com eventos são marcados com um ponto.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                locale={ptBR}
                className="rounded-md border p-3 shadow-sm"
                modifiers={{ 
                  scheduled: scheduledDays 
                }}
                modifiersClassNames={{
                  scheduled: 'day-scheduled', 
                }}
                 captionLayout="dropdown-buttons" 
                 fromYear={new Date().getFullYear() -1} 
                 toYear={new Date().getFullYear() + 2}
              />
              <p className="text-xs text-muted-foreground mt-3">
                <span className="inline-block w-2.5 h-2.5 bg-primary rounded-full mr-1.5 align-middle"></span>
                Dias com eventos agendados.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="week">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">A visão semanal será implementada em breve.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent 
            side={isMobile ? "bottom" : "right"} 
            className={cn(
                "flex flex-col rounded-t-lg sm:rounded-t-none",
                isMobile ? "h-[85vh]" : "w-full sm:max-w-md lg:max-w-lg"
            )}
        >
          <SheetHeader className="p-4 border-b">
             {isMobile && <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-2 cursor-grab active:cursor-grabbing"></div>}
            <SheetTitle className="text-center text-xl">
              Eventos em {selectedDate ? format(selectedDate, 'PPP', { locale: ptBR }) : 'Data Selecionada'}
            </SheetTitle>
             <SheetClose className="absolute right-3 top-3 p-1 rounded-full hover:bg-muted" />
          </SheetHeader>
          <div className="p-4 flex justify-end border-b">
            <Button onClick={handleNewAppointment} size="sm">
                <PlusCircle className="mr-2 h-4 w-4"/>
                Novo Agendamento
            </Button>
          </div>
          <ScrollArea className="flex-1 px-1 py-4">
            {sessionsForSelectedDate.length > 0 ? (
              <div className="space-y-4 p-3">
                {sessionsForSelectedDate.map(session => {
                  const availableSlots = session.capacity && session.bookedSlots !== undefined 
                                         ? session.capacity - session.bookedSlots 
                                         : undefined;
                  return (
                    <Card key={session.id} className="shadow-md hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{session.title}</CardTitle>
                          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getEventTypeColor(session.type)}`}>
                              {session.type}
                          </span>
                        </div>
                        <CardDescription className="text-sm pt-1">{session.topic}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <p><strong className="font-medium">Local:</strong> {session.location}</p>
                        <p><strong className="font-medium">Horário:</strong> {session.startTime} - {session.endTime}</p>
                        <p><strong className="font-medium">Técnico/Responsável:</strong> {session.technician}</p>
                        {session.capacity !== undefined && (
                          <p className="flex items-center">
                            <UsersRound className="mr-1.5 h-4 w-4 text-muted-foreground" />
                            <strong className="font-medium">Vagas:</strong>&nbsp;
                            {availableSlots !== undefined 
                              ? `${availableSlots > 0 ? `${availableSlots} de ${session.capacity}` : `Lotado (${session.bookedSlots}/${session.capacity})`}` 
                              : 'N/D'}
                          </p>
                        )}
                        
                        {session.renewalDue && fnsDifferenceInDays(session.renewalDue, new Date()) <= 30 && (
                          <Card className="mt-3 p-3 bg-destructive/10 border-destructive/30">
                              <div className="flex items-center text-destructive">
                                  <AlertTriangle className="h-5 w-5 mr-2" />
                                  <p className="text-xs font-semibold">Alerta: Renovação necessária em breve ({format(session.renewalDue, 'dd/MM/yyyy', {locale: ptBR})})!</p>
                              </div>
                          </Card>
                        )}

                        <div className="pt-3 space-y-2 sm:flex sm:space-y-0 sm:space-x-2">
                           <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full sm:w-auto"
                              onClick={() => handleCheckIn(session.id)}
                            >
                            <Camera className="mr-2 h-4 w-4"/> Check-in com Selfie
                          </Button>
                           <Button 
                              variant="secondary" 
                              size="sm" 
                              className="w-full sm:w-auto"
                              onClick={() => handleGenerateCertificate(session.id)}
                            >
                              <Download className="mr-2 h-4 w-4"/> Gerar Certificado
                          </Button>
                        </div>
                        <Separator className="my-3"/>
                        <div>
                          <h4 className="font-medium mb-1.5 text-sm">Participantes (Placeholder):</h4>
                          <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5">
                            <li>João da Silva <CheckCircle className="inline h-3.5 w-3.5 text-green-500 ml-1"/></li>
                            <li>Maria Oliveira (Pendente)</li>
                            <li>Pedro Santos <CheckCircle className="inline h-3.5 w-3.5 text-green-500 ml-1"/></li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <CalendarIcon className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum evento agendado para esta data.</p>
                 <Button onClick={handleNewAppointment} size="sm" className="mt-4">
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Agendar Novo Evento
                </Button>
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}
