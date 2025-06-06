
'use client';

import * as React from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import * as z from 'zod';
import { Calendar as ShadcnCalendar } from '@/components/ui/calendar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, Users, Download, Camera, AlertTriangle, CheckCircle, PlusCircle, GripVertical, UsersRound, Edit, Trash2, Loader2, Filter, Repeat, RefreshCw, ChevronLeft, ChevronRight, Search, FileText, ShieldCheck as ShieldCheckIconLucide, Car as CarIconLucide, Star as StarIconLucide } from 'lucide-react';
import { format, isEqual, startOfDay, addMonths, subMonths, differenceInDays as fnsDifferenceInDays, addWeeks, subWeeks, startOfWeek, endOfWeek, eachDayOfInterval, isPast, addDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'; // Removed DialogClose as it's used with asChild
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription as UiFormDescription } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle as UiCardTitle, CardDescription as UiCardDescription } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';


interface TrainingSession {
  id: string;
  title: string;
  type: 'Treinamento' | 'Consultoria' | 'Auditoria Agendada' | 'Outro Evento';
  topic: string;
  location: string;
  date: Date;
  startTime: string;
  endTime:string;
  technician: string;
  participants?: string;
  description?: string;
  isRecurring?: boolean;
  renewalDue?: Date | null;
  capacity?: number;
  bookedSlots?: number;
  missionStatusPlaceholder?: 'Pendente' | 'Em Andamento' | 'Concluída';
}

const appointmentFormSchema = z.object({
  title: z.string().min(3, { message: 'O título deve ter pelo menos 3 caracteres.' }),
  type: z.enum(['Treinamento', 'Consultoria', 'Auditoria Agendada', 'Outro Evento'], { required_error: 'O tipo de evento é obrigatório.' }),
  topic: z.string().min(3, { message: 'O tópico deve ter pelo menos 3 caracteres.' }),
  location: z.string().min(3, { message: 'O local deve ter pelo menos 3 caracteres.' }),
  date: z.date({ required_error: 'A data é obrigatória.' }),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Hora de início inválida (HH:MM).' }),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Hora de término inválida (HH:MM).' }),
  technician: z.string().min(1, { message: 'Selecione um técnico/responsável.' }),
  participants: z.string().optional(),
  description: z.string().optional(),
  isRecurring: z.boolean().optional().default(false),
  capacity: z.coerce.number().optional(),
  renewalDue: z.date().optional().nullable(),
}).refine(data => {
  const startDateTime = new Date(data.date);
  const [startHours, startMinutes] = data.startTime.split(':').map(Number);
  startDateTime.setHours(startHours, startMinutes);

  const endDateTime = new Date(data.date);
  const [endHours, endMinutes] = data.endTime.split(':').map(Number);
  endDateTime.setHours(endHours, endMinutes);

  return endDateTime > startDateTime;
}, {
  message: 'A hora de término deve ser posterior à hora de início.',
  path: ['endTime'],
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

const mockTechnicians = ['Carlos Silva', 'Ana Pereira', 'Juliana Costa', 'Roberto Alves', 'Fernanda Lima', 'Usuário Simulado'];
const ALL_EVENT_TYPES = "__ALL_EVENT_TYPES__";
const ALL_TECHNICIANS = "__ALL_TECHNICIANS__";
const AGENDA_SESSIONS_STORAGE_KEY = 'safetyNetAgendaSessions';
const SIMULATED_LOGGED_IN_TECHNICIAN = 'Carlos Silva';

const initialMockSessions: TrainingSession[] = [
  { id: 'TRN001', title: 'NR-35 (Trabalho em Altura)', type: 'Treinamento', topic: 'Segurança em Altura', location: 'Sala de Treinamento A', date: new Date(2024, 6, 15), startTime: '09:00', endTime: '17:00', technician: 'Carlos Silva', renewalDue: addMonths(new Date(2024, 6, 15), 11), capacity: 20, bookedSlots: 15, participants: 'João, Maria, Pedro', description: 'Treinamento completo sobre NR-35.', isRecurring: false, missionStatusPlaceholder: 'Pendente' },
  { id: 'TRN002', title: 'Uso Correto de EPIs', type: 'Treinamento', topic: 'Equipamentos de Proteção', location: 'Auditório Principal', date: new Date(2024, 6, 15), startTime: '14:00', endTime: '16:00', technician: 'Ana Pereira', capacity: 50, bookedSlots: 48, participants: 'Lista extensa de participantes...', isRecurring: true, missionStatusPlaceholder: 'Em Andamento' },
  { id: 'TRN003', title: 'Primeiros Socorros Básico', type: 'Treinamento', topic: 'Atendimento Emergencial', location: 'Sala de Treinamento B', date: new Date(2024, 6, 22), startTime: '08:00', endTime: '12:00', technician: 'Juliana Costa', capacity: 15, bookedSlots: 10, renewalDue: addMonths(new Date(2024, 6, 22), 23), missionStatusPlaceholder: 'Concluída' },
  { id: 'CON001', title: 'Consultoria PGR', type: 'Consultoria', topic: 'Análise de Riscos', location: 'Cliente Y - Sala Reuniões', date: new Date(2024, 6, 18), startTime: '10:00', endTime: '12:00', technician: 'Roberto Alves', capacity: 5, bookedSlots: 3, missionStatusPlaceholder: 'Pendente' },
  { id: 'AUD001', title: 'Auditoria Interna ISO 45001', type: 'Auditoria Agendada', topic: 'Sistema de Gestão', location: 'Setor de Produção', date: new Date(2024, 7, 5), startTime: '09:00', endTime: '17:00', technician: 'Fernanda Lima', isRecurring: true, capacity: 10, bookedSlots: 7, missionStatusPlaceholder: 'Pendente' },
  { id: 'TRN004', title: 'Segurança com Eletricidade', type: 'Treinamento', topic: 'NR-10 Básico', location: 'Sala de Treinamento A', date: new Date(2024, 7, 5), startTime: '13:00', endTime: '17:00', technician: 'Carlos Silva', capacity: 20, bookedSlots: 18, renewalDue: new Date(2024, 8, 1), missionStatusPlaceholder: 'Pendente' },
];

const eventTypeOptions: { value: TrainingSession['type'] | typeof ALL_EVENT_TYPES; label: string }[] = [
  { value: ALL_EVENT_TYPES, label: 'Todos os Tipos' },
  { value: 'Treinamento', label: 'Treinamento' },
  { value: 'Consultoria', label: 'Consultoria' },
  { value: 'Auditoria Agendada', label: 'Auditoria Agendada' },
  { value: 'Outro Evento', label: 'Outro Evento' },
];

export default function TrainingsAndAppointmentsPage() {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentDisplayMonth, setCurrentDisplayMonth] = useState<Date>(new Date());
  const [miniCalendarMonth, setMiniCalendarMonth] = useState<Date>(new Date());

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<TrainingSession | null>(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<TrainingSession | null>(null);

  const [currentWeekStartDate, setCurrentWeekStartDate] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const [filterEventType, setFilterEventType] = useState<string>(ALL_EVENT_TYPES);
  const [filterTechnician, setFilterTechnician] = useState<string>(ALL_TECHNICIANS);
  const [showOnlyMyEvents, setShowOnlyMyEvents] = useState(false);

  const [activeTab, setActiveTab] = useState<'month' | 'week'>('month');

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      title: '', type: undefined, topic: '', location: '',
      date: new Date(), startTime: '09:00', endTime: '17:00',
      technician: '', participants: '', description: '',
      isRecurring: false, capacity: undefined, renewalDue: undefined,
    },
  });

  const watchEventType = form.watch('type');

  useEffect(() => {
    const storedSessions = localStorage.getItem(AGENDA_SESSIONS_STORAGE_KEY);
    if (storedSessions) {
      try {
        const parsedSessions: TrainingSession[] = JSON.parse(storedSessions).map((s: any) => ({
          ...s,
          date: new Date(s.date),
          renewalDue: s.renewalDue ? new Date(s.renewalDue) : null,
          isRecurring: s.isRecurring || false,
        }));
        setSessions(parsedSessions);
      } catch (error) {
        console.error("Failed to parse sessions from localStorage", error);
        setSessions(initialMockSessions.map(s => ({...s, isRecurring: s.isRecurring || false })));
      }
    } else {
      setSessions(initialMockSessions.map(s => ({...s, isRecurring: s.isRecurring || false })));
      localStorage.setItem(AGENDA_SESSIONS_STORAGE_KEY, JSON.stringify(
        initialMockSessions.map(s => ({
          ...s,
          date: s.date.toISOString(),
          renewalDue: s.renewalDue ? s.renewalDue.toISOString() : null,
          isRecurring: s.isRecurring || false,
        }))
      ));
    }
  }, []);

  useEffect(() => {
    if (sessions.length > 0 || localStorage.getItem(AGENDA_SESSIONS_STORAGE_KEY)) {
        localStorage.setItem(AGENDA_SESSIONS_STORAGE_KEY, JSON.stringify(
        sessions.map(s => ({
            ...s,
            date: s.date.toISOString(),
            renewalDue: s.renewalDue ? s.renewalDue.toISOString() : null,
            isRecurring: s.isRecurring || false,
        }))
        ));
    }
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      const typeMatch = filterEventType === ALL_EVENT_TYPES || session.type === filterEventType;
      const techMatch = filterTechnician === ALL_TECHNICIANS || session.technician === filterTechnician;
      const myEventsMatch = !showOnlyMyEvents || session.technician === SIMULATED_LOGGED_IN_TECHNICIAN;
      return typeMatch && techMatch && myEventsMatch;
    });
  }, [sessions, filterEventType, filterTechnician, showOnlyMyEvents]);

  const scheduledDays = useMemo(() => filteredSessions.map(s => startOfDay(s.date)), [filteredSessions]);

  const sessionsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return filteredSessions.filter(session =>
        isEqual(startOfDay(session.date), startOfDay(selectedDate))
      ).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [selectedDate, filteredSessions]);

  const currentWeekDays = useMemo(() => {
    const start = startOfWeek(currentWeekStartDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentWeekStartDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentWeekStartDate]);

  const sessionsPerDayOfWeek = useMemo(() => {
    const newSessionsPerDay: Record<string, TrainingSession[]> = {};
    currentWeekDays.forEach(day => {
      const dayString = format(day, 'yyyy-MM-dd');
      newSessionsPerDay[dayString] = filteredSessions.filter(session =>
        isEqual(startOfDay(session.date), startOfDay(day))
      ).sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    return newSessionsPerDay;
  }, [currentWeekDays, filteredSessions]);

  const upcomingRenewals = useMemo(() => {
    const today = startOfDay(new Date());
    return sessions
      .filter(session =>
        session.type === 'Treinamento' &&
        session.renewalDue &&
        !isPast(session.renewalDue) &&
        fnsDifferenceInDays(session.renewalDue, today) <= 60
      )
      .sort((a, b) => (a.renewalDue as Date).getTime() - (b.renewalDue as Date).getTime())
      .slice(0, 5);
  }, [sessions]);


  const handleDateSelect = useCallback((date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setCurrentDisplayMonth(date);
      setMiniCalendarMonth(date);
      setIsSheetOpen(true);
    }
  }, []);

  const handleMiniCalendarSelect = (date: Date | undefined) => {
    if(date) {
      setSelectedDate(date);
      setCurrentDisplayMonth(date);
      setIsSheetOpen(true);
    }
  };

  const handleDayHeaderClick = (day: Date) => {
    setSelectedDate(day);
    setCurrentDisplayMonth(day);
    setMiniCalendarMonth(day); 
    setIsSheetOpen(true);
  };

  const handleWeeklyEventClick = (session: TrainingSession) => {
    setSelectedDate(session.date);
    setIsSheetOpen(true);
  };

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

  const handleOpenAppointmentModal = (sessionToEdit: TrainingSession | null = null, dateForNew?: Date) => {
    setEditingSession(sessionToEdit);
    if (sessionToEdit) {
      form.reset({
        ...sessionToEdit,
        date: new Date(sessionToEdit.date),
        isRecurring: sessionToEdit.isRecurring || false,
        renewalDue: sessionToEdit.renewalDue ? new Date(sessionToEdit.renewalDue) : undefined,
      });
    } else {
      form.reset({
        title: '', type: undefined, topic: '', location: '',
        date: dateForNew || selectedDate || new Date(),
        startTime: '09:00', endTime: '17:00',
        technician: '', participants: '', description: '',
        isRecurring: false, capacity: undefined, renewalDue: undefined,
      });
    }
    setIsAppointmentModalOpen(true);
  };

  const handleAppointmentFormSubmit = async (data: AppointmentFormValues) => {
    setIsSubmittingForm(true);
    await new Promise(resolve => setTimeout(resolve, 700));

    const sessionDataToSave = {
        ...data,
        date: new Date(data.date),
        renewalDue: data.renewalDue ? new Date(data.renewalDue) : null,
        isRecurring: data.isRecurring || false,
    };

    if (editingSession) {
      setSessions(prevSessions =>
        prevSessions.map(s => s.id === editingSession.id ? { ...s, ...sessionDataToSave } : s)
      );
      toast({ title: "Agendamento Atualizado!", description: `O evento "${data.title}" foi atualizado.` });
    } else {
      const newSession: TrainingSession = {
        id: `EVT-${Date.now()}`,
        ...sessionDataToSave,
        missionStatusPlaceholder: 'Pendente',
      };
      setSessions(prevSessions => [...prevSessions, newSession]);
      toast({ title: "Novo Agendamento Criado!", description: `O evento "${data.title}" foi adicionado à agenda.` });
    }
    setIsSubmittingForm(false);
    setIsAppointmentModalOpen(false);
  };

  const handleDeleteSession = (session: TrainingSession) => {
    setSessionToDelete(session);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteSession = () => {
    if (sessionToDelete) {
      setSessions(prevSessions => prevSessions.filter(s => s.id !== sessionToDelete.id));
      toast({
        title: "Agendamento Excluído",
        description: `O evento "${sessionToDelete.title}" foi removido da agenda.`,
        variant: "destructive"
      });
    }
    setShowDeleteConfirm(false);
    setSessionToDelete(null);
    if (selectedDate && sessionToDelete && isEqual(startOfDay(selectedDate), startOfDay(sessionToDelete.date))) {
      const remainingSessions = sessions.filter(s => s.id !== sessionToDelete.id && isEqual(startOfDay(s.date), startOfDay(selectedDate)));
      if (remainingSessions.length === 0) {
        setIsSheetOpen(false);
      }
    }
  };

  const getEventTypeColor = (type: TrainingSession['type']) => {
    switch(type) {
        case 'Treinamento': return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
        case 'Consultoria': return 'bg-purple-500/20 text-purple-700 border-purple-500/30';
        case 'Auditoria Agendada': return 'bg-teal-500/20 text-teal-700 border-teal-500/30';
        default: return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  const getEventTypeBorderColor = (type: TrainingSession['type']) => {
    switch(type) {
        case 'Treinamento': return 'border-blue-500';
        case 'Consultoria': return 'border-purple-500';
        case 'Auditoria Agendada': return 'border-teal-500';
        default: return 'border-gray-500';
    }
  };

  const handlePreviousPeriod = () => {
    if (activeTab === 'month') {
      setCurrentDisplayMonth(prev => subMonths(prev, 1));
      setMiniCalendarMonth(prev => subMonths(prev,1));
    } else {
      setCurrentWeekStartDate(prev => subWeeks(prev, 1));
    }
  };
  const handleNextPeriod = () => {
    if (activeTab === 'month') {
      setCurrentDisplayMonth(prev => addMonths(prev, 1));
      setMiniCalendarMonth(prev => addMonths(prev,1));
    } else {
      setCurrentWeekStartDate(prev => addWeeks(prev, 1));
    }
  };
  const handleToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentDisplayMonth(today);
    setMiniCalendarMonth(today);
    setCurrentWeekStartDate(startOfWeek(today, { weekStartsOn: 1 }));
    if (isSheetOpen) {
       // If sheet is open for a different day, and we click "Today",
       // and today has events, keep it open for today.
       // If today has no events, consider closing or let user close it.
       // For now, keep it open and let user close if they wish.
       const todayEvents = filteredSessions.filter(session => isEqual(startOfDay(session.date), startOfDay(today)));
       if (todayEvents.length > 0) {
           setIsSheetOpen(true);
       } else {
           setIsSheetOpen(false); // Close if today has no events for a cleaner "Today" click
       }
    }
  };

  const isCurrentDay = (day: Date) => isEqual(startOfDay(day), startOfDay(new Date()));

  return (
    <div className="flex flex-col md:flex-row h-full gap-0 md:gap-6">
      <aside className="w-full md:w-64 lg:w-72 flex-shrink-0 p-1 md:p-0 md:sticky md:top-[calc(4rem+1rem)] md:h-[calc(100vh-5rem-1rem)] md:overflow-y-auto md:border-r md:pr-4">
        <Button
          onClick={() => handleOpenAppointmentModal(null, selectedDate || new Date())}
          className="w-full mb-4 shadow-md hover:shadow-lg transition-shadow"
        >
          <PlusCircle className="mr-2 h-5 w-5"/> Criar Agendamento
        </Button>

        <ShadcnCalendar
          mode="single"
          selected={selectedDate}
          onSelect={handleMiniCalendarSelect}
          month={miniCalendarMonth}
          onMonthChange={setMiniCalendarMonth}
          locale={ptBR}
          className="rounded-md border shadow-sm p-2 w-full"
          modifiers={{ scheduled: scheduledDays }}
          modifiersClassNames={{ scheduled: 'day-scheduled' }}
          fromYear={new Date().getFullYear() - 2}
          toYear={new Date().getFullYear() + 2}
        />

        <Card className="mt-4 p-3 border rounded-md shadow-sm">
            <Label className="text-xs font-semibold text-muted-foreground px-1 block mb-2">Filtros da Agenda</Label>
            <div className="space-y-3">
                <Select value={filterEventType} onValueChange={setFilterEventType}>
                    <SelectTrigger aria-label="Filtrar por tipo de evento" className="h-9 text-xs">
                    <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                    {eventTypeOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <Select value={filterTechnician} onValueChange={setFilterTechnician}>
                    <SelectTrigger aria-label="Filtrar por técnico" className="h-9 text-xs">
                    <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value={ALL_TECHNICIANS} className="text-xs">Todos os Técnicos</SelectItem>
                    {mockTechnicians.map(tech => (
                        <SelectItem key={tech} value={tech} className="text-xs">{tech}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <div className="flex items-center space-x-2 pt-1">
                    <Switch id="my-events-toggle" checked={showOnlyMyEvents} onCheckedChange={setShowOnlyMyEvents} />
                    <Label htmlFor="my-events-toggle" className="text-xs cursor-pointer">Apenas Meus Agendamentos</Label>
                </div>
            </div>
        </Card>


        {upcomingRenewals.length > 0 && (
          <Card className="mt-4 shadow-md border-yellow-500/50 bg-yellow-500/10">
            <CardHeader className="p-3">
              <UiCardTitle className="text-sm flex items-center text-yellow-700 dark:text-yellow-400">
                <RefreshCw className="mr-2 h-4 w-4 animate-pulse" />
                Renovações Próximas
              </UiCardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 text-xs space-y-1.5">
              {upcomingRenewals.map(session => (
                <div key={session.id} className="border-b border-yellow-500/30 pb-1.5 last:border-b-0">
                  <p className="font-medium text-foreground truncate">{session.title}</p>
                  <p className="text-muted-foreground">
                    Vence: {format(session.renewalDue as Date, 'dd/MM/yy', { locale: ptBR })} ({session.technician})
                  </p>
                   <Button variant="link" size="xs" className="p-0 h-auto text-primary hover:underline" onClick={() => handleDateSelect(session.date)}>
                     Ver na Agenda
                   </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
         <div className="mt-4 p-2 space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground">Pesquisar pessoas (Placeholder)</h4>
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Nome, email..." className="pl-8 text-xs h-9" disabled/>
            </div>
        </div>
        <div className="mt-2 p-2 space-y-1">
            <h4 className="text-xs font-semibold text-muted-foreground">Minhas agendas (Placeholder)</h4>
            <div className="flex items-center space-x-2"><Checkbox id="cal-user" checked disabled/><Label htmlFor="cal-user" className="text-xs">{SIMULATED_LOGGED_IN_TECHNICIAN}</Label></div>
            <div className="flex items-center space-x-2"><Checkbox id="cal-aniv" disabled/><Label htmlFor="cal-aniv" className="text-xs">Aniversários</Label></div>
            <div className="flex items-center space-x-2"><Checkbox id="cal-tarefas" disabled/><Label htmlFor="cal-tarefas" className="text-xs">Tarefas</Label></div>
        </div>
         <div className="mt-2 p-2 space-y-1">
            <h4 className="text-xs font-semibold text-muted-foreground">Outras agendas (Placeholder)</h4>
            <div className="flex items-center space-x-2"><Checkbox id="cal-feriados" checked disabled/><Label htmlFor="cal-feriados" className="text-xs">Feriados no Brasil</Label></div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'month' | 'week')} className="w-full">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-2 p-2 sm:p-0">
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleToday} size="sm">Hoje</Button>
              <Button variant="ghost" size="icon" onClick={handlePreviousPeriod} aria-label="Mês/Semana Anterior">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleNextPeriod} aria-label="Próximo Mês/Semana">
                <ChevronRight className="h-5 w-5" />
              </Button>
              <h2 className="text-xl font-semibold text-foreground ml-2">
                {activeTab === 'month' ? format(currentDisplayMonth, 'MMMM \'de\' yyyy', { locale: ptBR })
                                      : `${format(currentWeekDays[0], 'd MMM', { locale: ptBR })} - ${format(currentWeekDays[6], 'd MMM yyyy', { locale: ptBR })}`}
              </h2>
            </div>
            <TabsList className="grid w-full grid-cols-2 sm:w-auto">
              <TabsTrigger value="month">Mês</TabsTrigger>
              <TabsTrigger value="week">Semana</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="month" className={cn(activeTab !== 'month' && "hidden")}>
            <Card className="shadow-lg">
              <CardContent className="p-2 sm:p-3">
                <ShadcnCalendar
                  mode="single" selected={selectedDate} onSelect={handleDateSelect} locale={ptBR}
                  month={currentDisplayMonth} onMonthChange={setCurrentDisplayMonth}
                  className="rounded-md p-0 w-full [&_td]:p-0.5 sm:[&_td]:p-1 [&_th]:text-xs [&_.day-scheduled]:font-bold"
                  classNames={{
                      months: "flex flex-col sm:flex-row space-y-0",
                      month: "space-y-2 w-full",
                      caption_label: "text-lg font-medium",
                      table: "w-full border-collapse space-y-1",
                      head_row: "flex justify-around",
                      head_cell: "text-muted-foreground rounded-md w-full text-[0.8rem] font-normal justify-center flex",
                      row: "flex w-full mt-1 justify-around",
                      cell: cn("h-16 sm:h-20 md:h-24 w-full text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                                "[&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50",
                                "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"),
                      day: cn(buttonVariants({ variant: "ghost" }),
                                "h-full w-full p-1 font-normal aria-selected:opacity-100 justify-start items-start flex-col"),
                      day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                      day_today: "bg-accent text-accent-foreground",
                      day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                      day_disabled: "text-muted-foreground opacity-50",
                      day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                      day_hidden: "invisible",
                  }}
                  components={{
                      DayContent: ({ date }) => {
                        const dayEvents = filteredSessions.filter(session => isEqual(startOfDay(session.date), startOfDay(date)));
                        return (
                          <>
                            <span className="text-xs sm:text-sm">{format(date, "d")}</span>
                            {dayEvents.length > 0 && (
                              <div className="mt-0.5 sm:mt-1 space-y-0.5 text-left overflow-hidden">
                                {dayEvents.slice(0, isMobile ? 1 : 2).map(event => (
                                  <div key={event.id} className={cn("text-[8px] sm:text-[10px] px-1 rounded-sm truncate", getEventTypeColor(event.type))}>
                                    {event.title}
                                  </div>
                                ))}
                                {dayEvents.length > (isMobile ? 1 : 2) && <div className="text-[8px] sm:text-[10px] text-muted-foreground text-center">+{dayEvents.length - (isMobile ? 1 : 2)} mais</div>}
                              </div>
                            )}
                          </>
                        );
                      }
                    }}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="week" className={cn(activeTab !== 'week' && "hidden")}>
            <Card className="shadow-lg">
              <CardContent className="p-1 sm:p-2">
                {currentWeekDays.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-7 gap-1 md:gap-1.5">
                    {currentWeekDays.map(day => (
                      <div
                          key={day.toISOString()}
                          className={cn("border rounded-lg p-1.5 sm:p-2 bg-card min-h-[180px] flex flex-col cursor-pointer hover:bg-muted/50 transition-colors", isCurrentDay(day) && "border-primary/50 bg-primary/5")}
                          role="button"
                          tabIndex={0}
                          aria-label={`Ver eventos para ${format(day, 'PPP', { locale: ptBR })}`}
                          onClick={() => handleDayHeaderClick(day)}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleDayHeaderClick(day);}}
                      >
                        <h3 className={cn(
                          "font-semibold text-[10px] sm:text-xs text-center mb-1.5 text-foreground pb-1 border-b",
                          isCurrentDay(day) && "bg-primary/10 text-primary rounded-t-md py-0.5 border-primary/30"
                          )}>
                          {format(day, 'EEE', { locale: ptBR }).toUpperCase()}
                          <br />
                          <span className="text-xs text-muted-foreground">{format(day, 'dd/MM')}</span>
                        </h3>
                        <ScrollArea className="flex-1 pr-1">
                          <div className="space-y-1">
                            {sessionsPerDayOfWeek[format(day, 'yyyy-MM-dd')]?.length > 0 ? (
                              sessionsPerDayOfWeek[format(day, 'yyyy-MM-dd')]?.map(session => (
                                <Button
                                  key={session.id} variant="outline" size="sm"
                                  className={cn("w-full text-left h-auto py-1 px-1.5 whitespace-normal border-l-4", getEventTypeBorderColor(session.type))}
                                  onClick={(e) => { e.stopPropagation(); handleWeeklyEventClick(session);}}
                                >
                                  <div className="flex flex-col w-full overflow-hidden">
                                    <span className="text-[9px] sm:text-[10px] font-medium">{session.startTime} - {session.endTime}</span>
                                    <span className="text-[10px] sm:text-[11px] truncate font-semibold">{session.title}</span>
                                    <span className={`text-[8px] sm:text-[9px] px-1 rounded-sm inline-block self-start mt-0.5 ${getEventTypeColor(session.type)}`}>{session.type}</span>
                                  </div>
                                </Button>
                              ))
                            ) : ( <p className="text-[10px] sm:text-xs text-muted-foreground text-center italic mt-4">Nenhum evento</p> )}
                          </div>
                        </ScrollArea>
                      </div>
                    ))}
                  </div>
                ) : ( <p className="text-center text-muted-foreground p-4">Carregando dados da semana...</p> )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent
              side={isMobile ? "bottom" : "right"}
              className={cn( "flex flex-col rounded-t-lg sm:rounded-t-none p-0", isMobile ? "h-[85vh]" : "w-full sm:max-w-md lg:max-w-lg" )}>
          <SheetHeader className="p-4 border-b">
              {isMobile && <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-2 cursor-grab active:cursor-grabbing"></div>}
              <SheetTitle className="text-center text-xl">
              Eventos em {selectedDate ? format(selectedDate, 'PPP', { locale: ptBR }) : 'Data Selecionada'}
              </SheetTitle>
              <SheetClose className="absolute right-3 top-3 p-1 rounded-full hover:bg-muted" />
          </SheetHeader>
          <div className="p-4 flex justify-end border-b">
              <Button onClick={() => handleOpenAppointmentModal(null, selectedDate)} size="sm">
                  <PlusCircle className="mr-2 h-4 w-4"/> Novo Agendamento
              </Button>
          </div>
          <ScrollArea className="flex-1 px-1 py-4">
              {sessionsForSelectedDate.length > 0 ? (
              <div className="space-y-4 p-3">
                  {sessionsForSelectedDate.map(session => {
                  const availableSlots = session.capacity && session.bookedSlots !== undefined ? session.capacity - session.bookedSlots : undefined;
                  const isRenewalDueSoon = session.type === 'Treinamento' && session.renewalDue && fnsDifferenceInDays(session.renewalDue, new Date()) <= 30 && !isPast(session.renewalDue);
                  const isEventRecurring = session.isRecurring;
                  return (
                      <Card key={session.id} className="shadow-md hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                              <UiCardTitle className="text-lg">{session.title}</UiCardTitle>
                              <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getEventTypeColor(session.type)}`}>{session.type}</span>
                          </div>
                          <UiCardDescription className="text-sm pt-1">{session.topic}</UiCardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                          <p><strong className="font-medium">Local:</strong> {session.location}</p>
                          <p><strong className="font-medium">Horário:</strong> {session.startTime} - {session.endTime}</p>
                          <p><strong className="font-medium">Técnico/Responsável:</strong> {session.technician}</p>
                          {session.description && <p><strong className="font-medium">Descrição:</strong> {session.description}</p>}
                          {session.participants && <p><strong className="font-medium">Participantes:</strong> {session.participants}</p>}
                          {session.capacity !== undefined && (
                          <p className="flex items-center"><UsersRound className="mr-1.5 h-4 w-4 text-muted-foreground" />
                              <strong className="font-medium">Vagas:</strong>&nbsp;
                              {availableSlots !== undefined ? `${availableSlots > 0 ? `${availableSlots} de ${session.capacity}` : `Lotado (${session.bookedSlots}/${session.capacity})`}` : 'N/D'}
                          </p>)}
                          {isEventRecurring && (<p className="flex items-center text-muted-foreground"><Repeat className="mr-1.5 h-4 w-4"/> Evento Recorrente</p>)}
                          {isRenewalDueSoon && (
                          <Card className="mt-3 p-3 bg-destructive/10 border-destructive/30">
                              <div className="flex items-center text-destructive"><AlertTriangle className="h-5 w-5 mr-2" />
                                  <p className="text-xs font-semibold">Alerta: Renovação necessária em {format(session.renewalDue as Date, 'dd/MM/yyyy', {locale: ptBR})}!</p>
                              </div>
                          </Card>
                          )}
                           <Separator className="my-3"/>
                          <div>
                              <h4 className="text-xs font-semibold mb-1">Status da Missão (Placeholder):</h4>
                              <p className="text-xs text-muted-foreground italic">{session.missionStatusPlaceholder || 'Não definido'}</p>
                              <p className="text-xs text-muted-foreground italic mt-1">Checklist da Missão: (A ser vinculado)</p>
                          </div>
                          <div className="pt-3 space-y-2 sm:flex sm:space-y-0 sm:space-x-2">
                          <Button variant="outline" size="sm" className="w-full sm:flex-1" onClick={() => handleCheckIn(session.id)}>
                              <Camera className="mr-2 h-4 w-4"/> Check-in </Button>
                          <Button variant="secondary" size="sm" className="w-full sm:flex-1" onClick={() => handleGenerateCertificate(session.id)}>
                              <Download className="mr-2 h-4 w-4"/> Certificado </Button></div>
                          <div className="pt-2 space-y-2 sm:flex sm:space-y-0 sm:space-x-2">
                          <Button variant="ghost" size="sm" className="w-full sm:flex-1 text-primary hover:bg-primary/10" onClick={() => handleOpenAppointmentModal(session)}>
                              <Edit className="mr-2 h-4 w-4"/> Editar </Button>
                          <Button variant="ghost" size="sm" className="w-full sm:flex-1 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteSession(session)}>
                              <Trash2 className="mr-2 h-4 w-4"/> Excluir </Button></div>
                      </CardContent>
                      </Card>);})}
              </div>
              ) : ( <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <CalendarIcon className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhum evento agendado para esta data.</p>
                  <Button onClick={() => handleOpenAppointmentModal(null, selectedDate)} size="sm" className="mt-4">
                      <PlusCircle className="mr-2 h-4 w-4"/> Agendar Novo Evento </Button></div>)}
          </ScrollArea>
          </SheetContent>
      </Sheet>

      <Dialog open={isAppointmentModalOpen} onOpenChange={setIsAppointmentModalOpen}>
          <DialogContent className="sm:max-w-lg"><DialogHeader>
              <DialogTitle>{editingSession ? 'Editar Agendamento' : 'Novo Agendamento'}</DialogTitle>
              <DialogDescription>{editingSession ? 'Atualize os detalhes do evento abaixo.' : 'Preencha os detalhes para criar um novo evento na agenda.'}</DialogDescription>
          </DialogHeader>
          <Form {...form}><form onSubmit={form.handleSubmit(handleAppointmentFormSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
              <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem><FormLabel>Título do Evento</FormLabel><FormControl><Input placeholder="Ex: Treinamento NR-35" {...field} /></FormControl><FormMessage /></FormItem>)}/>
              <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem><FormLabel>Tipo de Evento</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger></FormControl>
                      <SelectContent><SelectItem value="Treinamento">Treinamento</SelectItem><SelectItem value="Consultoria">Consultoria</SelectItem>
                      <SelectItem value="Auditoria Agendada">Auditoria Agendada</SelectItem><SelectItem value="Outro Evento">Outro Evento</SelectItem>
                      </SelectContent></Select><FormMessage /></FormItem>)}/>
              <FormField control={form.control} name="topic" render={({ field }) => (
                  <FormItem><FormLabel>Tópico/Assunto</FormLabel><FormControl><Input placeholder="Ex: Segurança em Altura" {...field} /></FormControl><FormMessage /></FormItem>)}/>
              <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem><FormLabel>Local</FormLabel><FormControl><Input placeholder="Ex: Sala de Treinamento A / Cliente X" {...field} /></FormControl><FormMessage /></FormItem>)}/>
              <FormField control={form.control} name="date" render={({ field }) => (
                  <FormItem className="flex flex-col"><FormLabel>Data</FormLabel>
                  <Popover><PopoverTrigger asChild><FormControl>
                      <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                      </Button></FormControl></PopoverTrigger>
                      <PopoverContent className="w-auto p-0"><ShadcnCalendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={ptBR} /></PopoverContent>
                  </Popover><FormMessage /></FormItem>)}/>
              <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="startTime" render={({ field }) => (
                  <FormItem><FormLabel>Hora Início</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                  <FormField control={form.control} name="endTime" render={({ field }) => (
                  <FormItem><FormLabel>Hora Fim</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)}/></div>
              <FormField control={form.control} name="technician" render={({ field }) => (
                  <FormItem><FormLabel>Técnico/Responsável</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione o técnico" /></SelectTrigger></FormControl>
                      <SelectContent>{mockTechnicians.map(tech => <SelectItem key={tech} value={tech}>{tech}</SelectItem>)}</SelectContent>
                  </Select><FormMessage /></FormItem>)}/>
              <FormField control={form.control} name="participants" render={({ field }) => (
                  <FormItem><FormLabel>Participantes (Opcional)</FormLabel><FormControl><Textarea placeholder="Liste os nomes dos participantes, um por linha ou separados por vírgula." {...field} rows={3}/></FormControl><FormMessage /></FormItem>)}/>
              <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Descrição/Detalhes Adicionais (Opcional)</FormLabel><FormControl><Textarea placeholder="Qualquer informação extra sobre o evento." {...field} rows={3}/></FormControl><FormMessage /></FormItem>)}/>

              <FormField control={form.control} name="isRecurring" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-muted/50">
                      <div className="space-y-0.5"><FormLabel>Evento Recorrente?</FormLabel>
                      <UiFormDescription className="text-xs">Marque se este evento se repete.</UiFormDescription></div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>)}/>

              {watchEventType === 'Treinamento' && (<>
                  <FormField control={form.control} name="capacity" render={({ field }) => (
                      <FormItem><FormLabel>Capacidade de Vagas (Opcional)</FormLabel><FormControl><Input type="number" placeholder="Ex: 20" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} /></FormControl><FormMessage /></FormItem>)}/>
                  <FormField control={form.control} name="renewalDue" render={({ field }) => (
                      <FormItem className="flex flex-col"><FormLabel>Data de Renovação (Opcional)</FormLabel>
                      <Popover><PopoverTrigger asChild><FormControl>
                          <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(new Date(field.value), "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                          </Button></FormControl></PopoverTrigger>
                          <PopoverContent className="w-auto p-0"><ShadcnCalendar mode="single" selected={field.value ? new Date(field.value) : undefined} onSelect={field.onChange} initialFocus locale={ptBR} /></PopoverContent>
                      </Popover><FormMessage /></FormItem>)}/>
                  </>)}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAppointmentModalOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={isSubmittingForm || (!form.formState.isDirty && !!editingSession) || !form.formState.isValid}>
                  {isSubmittingForm ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (editingSession ? 'Salvar Alterações' : 'Criar Agendamento')}
                  </Button></DialogFooter></form></Form></DialogContent></Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}><AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>Tem certeza que deseja excluir o evento "{sessionToDelete?.title}"? Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader><AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSessionToDelete(null)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteSession} className={buttonVariants({ variant: "destructive" })}>Excluir</AlertDialogAction>
          </AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
}
