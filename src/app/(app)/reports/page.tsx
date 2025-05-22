
'use client';
import Link from 'next/link';
import { PlusCircle, Download, Eye, MoreHorizontal, CalendarDays, Filter, Search, X as XIcon } from 'lucide-react'; // Added XIcon for DialogClose
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/common/page-header';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';
import { useState, useMemo, useEffect, useRef } from 'react'; // Added useRef
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { IncidentForm, type IncidentFormValues } from '@/components/reports/incident-form';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

interface Report {
  id: string;
  date: Date;
  technician: string;
  type: string; // e.g., "Quase Acidente", "Observação de Segurança", "Primeiros Socorros"
  status: ReportStatus;
  description?: string;
  location?: string;
  geolocation?: string;
}

const initialMockReports: Report[] = [
  { id: 'RPT001', date: new Date(2024, 5, 10), technician: 'Alice Silva', type: 'Quase Acidente', status: 'Aberto', description: 'Escada escorregadia no armazém B.', location: 'Armazém B' },
  { id: 'RPT002', date: new Date(2024, 5, 12), technician: 'Roberto Costa', type: 'Observação de Segurança', status: 'Fechado', description: 'Equipamento de proteção individual (EPI) não utilizado corretamente na linha de montagem 3.', location: 'Linha de Montagem 3' },
  { id: 'RPT003', date: new Date(2024, 5, 15), technician: 'Alice Silva', type: 'Primeiros Socorros', status: 'Em Progresso', description: 'Corte leve no dedo do colaborador Mário Santos ao manusear ferramenta.', location: 'Oficina Mecânica' },
  { id: 'RPT004', date: new Date(2024, 5, 18), technician: 'Carlos Neves', type: 'Dano à Propriedade', status: 'Aberto', description: 'Empilhadeira colidiu com prateleira, causando danos menores.', location: 'Corredor 5, Armazém A' },
  { id: 'RPT005', date: new Date(2024, 5, 20), technician: 'Roberto Costa', type: 'Ambiental', status: 'Fechado', description: 'Vazamento de óleo contido próximo ao gerador G-02.', location: 'Área Externa - Geradores' },
  { id: 'RPT006', date: new Date(2024, 4, 28), technician: 'Juliana Lima', type: 'Inspeção', status: 'Fechado', description: 'Inspeção de segurança da área de solda completa.', location: 'Área de Solda' },
  { id: 'RPT007', date: new Date(2024, 4, 5), technician: 'Alice Silva', type: 'Auditoria', status: 'Em Progresso', description: 'Auditoria interna do sistema de gestão de SST.', location: 'Escritório Central' },
  { id: 'RPT008', date: new Date(2024, 3, 20), technician: 'Carlos Neves', type: 'DDS', status: 'Fechado', description: 'DDS sobre uso de óculos de proteção.', location: 'Canteiro de Obras Z' },
];

type ReportStatus = 'Aberto' | 'Em Progresso' | 'Fechado';

const statusColors: Record<ReportStatus, string> = {
  Aberto: 'bg-red-500/20 text-red-700 border-red-500/30',
  'Em Progresso': 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
  Fechado: 'bg-green-500/20 text-green-700 border-green-500/30',
};

const allReportTypes = Array.from(new Set(initialMockReports.map(report => report.type))).sort();

export default function ReportsListPage() {
  const [reports, setReports] = useState<Report[]>(initialMockReports);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [isNewReport, setIsNewReport] = useState(false);
  const { toast } = useToast();

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'Todos'>('Todos');
  const [technicianFilter, setTechnicianFilter] = useState<string>('Todos');
  const [selectedReportTypes, setSelectedReportTypes] = useState<string[]>([]);
  
  const [isLoading, setIsLoading] = useState(false); 
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const uniqueTechnicians = useMemo(() => {
    const techs = new Set(reports.map(report => report.technician));
    return ['Todos', ...Array.from(techs).sort()];
  }, [reports]);

  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Effect to handle debounced filtering
  useEffect(() => {
    if (!isMounted) return; 

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false); 
      }, 500); 
    }, 300); 

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm, dateRange, statusFilter, technicianFilter, selectedReportTypes, isMounted]);


  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const searchMatch = searchTerm === '' || 
                          report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          report.technician.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (report.description && report.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (report.location && report.location.toLowerCase().includes(searchTerm.toLowerCase()));

      const dateFrom = dateRange?.from;
      const dateTo = dateRange?.to;
      let dateMatch = true;
      if (dateFrom && isValid(report.date)) {
        dateMatch = report.date >= dateFrom;
      }
      if (dateTo && isValid(report.date) && dateMatch) {
        const toEndOfDay = new Date(dateTo);
        toEndOfDay.setHours(23, 59, 59, 999);
        dateMatch = report.date <= toEndOfDay;
      }
      if (dateFrom && !dateTo && isValid(report.date)){ 
         dateMatch = report.date.toDateString() === dateFrom.toDateString();
      }

      const statusMatch = statusFilter === 'Todos' || report.status === statusFilter;
      const technicianMatch = technicianFilter === 'Todos' || report.technician === technicianFilter;
      const typeMatch = selectedReportTypes.length === 0 || selectedReportTypes.includes(report.type);
      
      return searchMatch && dateMatch && statusMatch && technicianMatch && typeMatch;
    });
  }, [reports, searchTerm, dateRange, statusFilter, technicianFilter, selectedReportTypes]);

  const handleOpenNewReportModal = () => {
    setEditingReport(null);
    setIsNewReport(true);
    setIsReportModalOpen(true);
  };

  const handleOpenEditReportModal = (report: Report) => {
    setEditingReport(report);
    setIsNewReport(false);
    setIsReportModalOpen(true);
  };
  
  const handleCloseReportModal = () => {
    setIsReportModalOpen(false);
    setEditingReport(null);
    setIsNewReport(false);
  };

  const handleFormSubmitSuccess = (submittedData: IncidentFormValues) => {
    const reportData: Omit<Report, 'id' | 'status'> = {
      date: submittedData.date,
      technician: editingReport?.technician || 'Usuário Atual', 
      type: submittedData.incidentType,
      description: submittedData.description,
      location: submittedData.location,
      geolocation: submittedData.geolocation,
    };

    if (isNewReport) {
      const newReportEntry: Report = {
        id: `RPT${Math.random().toString(36).substr(2, 3).toUpperCase()}${Date.now() % 1000}`,
        ...reportData,
        status: 'Aberto', 
      };
      setReports(prevReports => [newReportEntry, ...prevReports]);
      toast({ title: "Relatório Criado", description: "Novo relatório de incidente adicionado com sucesso." });
    } else if (editingReport) {
      setReports(prevReports => 
        prevReports.map(r => 
          r.id === editingReport.id 
            ? { 
                ...editingReport, 
                ...reportData,
                // Manter o status original ao editar, a menos que o formulário permita alterá-lo
                status: editingReport.status 
              } 
            : r
        )
      );
      toast({ title: "Relatório Atualizado", description: `Relatório ${editingReport.id} atualizado com sucesso.` });
    }
    handleCloseReportModal();
  };

  const handleReportTypeChange = (type: string) => {
    setSelectedReportTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const SkeletonRow = () => (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
      <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
      <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
      <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
      <TableCell className="text-center"><Skeleton className="h-6 w-[90px] rounded-full mx-auto" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-md ml-auto" /></TableCell>
    </TableRow>
  );

  return (
    <>
      <PageHeader
        title="Relatórios de Incidentes"
        description="Visualize, gerencie e exporte relatórios de incidentes."
        actions={
          <Button onClick={handleOpenNewReportModal}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Relatório
          </Button>
        }
      />

      <div className="mb-6 p-4 border rounded-lg bg-card shadow">
        <h3 className="text-lg font-semibold mb-4 flex items-center"><Filter className="mr-2 h-5 w-5 text-primary" /> Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          <div>
            <Label htmlFor="search-term" className="text-sm font-medium text-muted-foreground">Buscar</Label>
            <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                id="search-term"
                placeholder="ID, técnico, descrição..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-ai-hint="buscar em relatorios"
                />
            </div>
          </div>
          <div>
            <Label htmlFor="date-range" className="text-sm font-medium text-muted-foreground">Período</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button id="date-range" variant="outline" className="w-full justify-start text-left font-normal mt-1">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>{format(dateRange.from, "dd/MM/y", { locale: ptBR })} - {format(dateRange.to, "dd/MM/y", { locale: ptBR })}</>
                    ) : (
                      format(dateRange.from, "dd/MM/y", { locale: ptBR })
                    )
                  ) : (
                    <span>Selecione um período</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={2} locale={ptBR} />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label htmlFor="status" className="text-sm font-medium text-muted-foreground">Status</Label>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ReportStatus | 'Todos')}>
              <SelectTrigger id="status" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos os Status</SelectItem>
                <SelectItem value="Aberto">Aberto</SelectItem>
                <SelectItem value="Em Progresso">Em Progresso</SelectItem>
                <SelectItem value="Fechado">Fechado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <Label htmlFor="technician" className="text-sm font-medium text-muted-foreground">Técnico</Label>
            <Select value={technicianFilter} onValueChange={setTechnicianFilter}>
              <SelectTrigger id="technician" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {uniqueTechnicians.map(tech => (
                  <SelectItem key={tech} value={tech}>{tech}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 lg:col-span-3"> 
            <Label className="text-sm font-medium text-muted-foreground">Tipo de Relatório</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2 mt-2 p-3 border rounded-md bg-muted/30">
              {allReportTypes.map(type => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type}`}
                    checked={selectedReportTypes.includes(type)}
                    onCheckedChange={() => handleReportTypeChange(type)}
                  />
                  <Label htmlFor={`type-${type}`} className="text-sm font-normal cursor-pointer">{type}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={() => toast({ title: "Exportar CSV (Placeholder)", description: "Funcionalidade para exportar dados filtrados como CSV."})}>
            <Download className="mr-2 h-4 w-4" />
            Exportar (CSV)
          </Button>
        </div>
      </div>

      <div className="rounded-lg border shadow-sm bg-card">
        <div className="overflow-x-auto w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">ID do Relatório</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Técnico</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="transition-opacity duration-300 ease-in-out">
              {isLoading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : filteredReports.length > 0 ? filteredReports.map((report) => (
                <TableRow
                  key={report.id}
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleOpenEditReportModal(report)}
                >
                  <TableCell className="font-medium">{report.id}</TableCell>
                  <TableCell>{format(report.date, "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                  <TableCell>{report.technician}</TableCell>
                  <TableCell>{report.type}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={`text-xs ${statusColors[report.status as ReportStatus]}`}>
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation(); 
                          }}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Ações para {report.id}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleOpenEditReportModal(report); }}>
                          <Eye className="mr-2 h-4 w-4" />
                          <span>Visualizar / Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={(e) => {e.stopPropagation(); toast({title: "Exportar PDF (Placeholder)", description: `Funcionalidade para exportar relatório ${report.id} como PDF.`})}}>
                          <Download className="mr-2 h-4 w-4" />
                          <span>Exportar PDF</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Nenhum relatório encontrado com os filtros atuais.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" disabled={isLoading || filteredReports.length === 0}>
          Anterior
        </Button>
        <Button variant="outline" size="sm" disabled={isLoading || filteredReports.length === 0}>
          Próximo
        </Button>
      </div>

      <Dialog open={isReportModalOpen} onOpenChange={handleCloseReportModal}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="text-2xl">
              {isNewReport ? 'Registrar Novo Incidente' : `Editar Relatório #${editingReport?.id}`}
            </DialogTitle>
            <DialogDescription>
              {isNewReport ? 'Forneça informações detalhadas sobre o incidente.' : 'Atualize os detalhes deste relatório de incidente.'}
            </DialogDescription>
             <DialogClose asChild>
                <Button variant="ghost" size="icon" className="absolute right-4 top-4 p-1.5">
                    <XIcon className="h-5 w-5" />
                    <span className="sr-only">Fechar</span>
                </Button>
            </DialogClose>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6">
            <IncidentForm 
              initialData={isNewReport ? undefined : {
                incidentType: editingReport?.type || '',
                description: editingReport?.description || '',
                location: editingReport?.location || '',
                geolocation: editingReport?.geolocation || '',
                date: editingReport?.date ? new Date(editingReport.date) : new Date(),
                // A propriedade media não precisa ser passada aqui, pois é gerenciada localmente pelo IncidentForm
              }} 
              onSubmitSuccess={handleFormSubmitSuccess} 
              isModalMode={true}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

