
'use client';
import Link from 'next/link';
import { PlusCircle, Download, Eye, MoreHorizontal, SlidersHorizontal, Filter as FilterIcon } from 'lucide-react'; // FilterIcon for desktop
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
import { Skeleton } from '@/components/ui/skeleton';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';
import { useState, useMemo, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { X as XIcon } from 'lucide-react';
import { IncidentForm, type IncidentFormValues } from '@/components/reports/incident-form';
import { useToast } from '@/hooks/use-toast';
import { ReportFilters } from '@/components/reports/ReportFilters';
import { Card, CardContent, CardHeader, CardTitle as UiCardTitle } from '@/components/ui/card'; // Renamed for clarity

export interface Report {
  id: string;
  date: Date;
  technician: string;
  type: string;
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

export type ReportStatus = 'Aberto' | 'Em Progresso' | 'Fechado';

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

  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'Todos'>('Todos');
  const [technicianFilter, setTechnicianFilter] = useState<string>('Todos');
  const [selectedReportTypes, setSelectedReportTypes] = useState<string[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  const uniqueTechnicians = useMemo(() => {
    const techs = new Set(reports.map(report => report.technician));
    return ['Todos', ...Array.from(techs).sort()];
  }, [reports]);

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
        const reportDate = new Date(report.date);
        reportDate.setHours(0,0,0,0); 
        dateMatch = reportDate >= new Date(new Date(dateFrom).setHours(0,0,0,0));
      }
      if (dateTo && isValid(report.date) && dateMatch) {
        const reportDate = new Date(report.date);
        reportDate.setHours(0,0,0,0);
        const toEndOfDay = new Date(dateTo);
        toEndOfDay.setHours(23, 59, 59, 999);
        dateMatch = reportDate <= toEndOfDay;
      }
      if (dateFrom && !dateTo && isValid(report.date)){ 
         const reportDate = new Date(report.date);
         reportDate.setHours(0,0,0,0);
         const fromDateOnly = new Date(dateFrom);
         fromDateOnly.setHours(0,0,0,0);
         dateMatch = reportDate.getTime() === fromDateOnly.getTime();
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
  
  const handleExport = () => {
    toast({ title: "Exportar CSV (Placeholder)", description: "Funcionalidade para exportar dados filtrados como CSV." });
  };

  return (
    <>
      <PageHeader
        title="Relatórios de Incidentes"
        description="Visualize, gerencie e exporte relatórios de incidentes."
      />

      <div className="flex flex-col md:flex-row md:gap-6">
        {/* Mobile: Accordion for Filters */}
        <div className="md:hidden mb-6">
          <Accordion type="single" collapsible className="w-full border rounded-lg bg-card shadow-sm">
            <AccordionItem value="filters">
              <AccordionTrigger className="px-4 py-3 text-base hover:bg-muted/50 hover:no-underline">
                <div className="flex items-center">
                  <SlidersHorizontal className="mr-2 h-5 w-5 text-primary" />
                  Filtros e Busca
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 border-t">
                <ReportFilters
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  dateRange={dateRange}
                  setDateRange={setDateRange}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  technicianFilter={technicianFilter}
                  setTechnicianFilter={setTechnicianFilter}
                  uniqueTechnicians={uniqueTechnicians}
                  selectedReportTypes={selectedReportTypes}
                  handleReportTypeChange={handleReportTypeChange}
                  allReportTypes={allReportTypes}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Desktop: Static Filter Panel (Sidebar-like) */}
        <aside className="hidden md:block md:w-72 lg:w-80 xl:w-96 md:sticky md:top-[calc(4rem+1rem)] md:h-[calc(100vh-5rem-2rem)] md:overflow-y-auto md:pr-2">
           <Card className="shadow-md">
            <CardHeader className="border-b py-4">
                <UiCardTitle className="text-lg flex items-center">
                    <FilterIcon className="mr-2 h-5 w-5 text-primary" /> Filtros de Relatórios
                </UiCardTitle>
            </CardHeader>
            <CardContent className="p-4">
               <ReportFilters
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  dateRange={dateRange}
                  setDateRange={setDateRange}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  technicianFilter={technicianFilter}
                  setTechnicianFilter={setTechnicianFilter}
                  uniqueTechnicians={uniqueTechnicians}
                  selectedReportTypes={selectedReportTypes}
                  handleReportTypeChange={handleReportTypeChange}
                  allReportTypes={allReportTypes}
                />
            </CardContent>
          </Card>
        </aside>

        {/* Reports Table Section */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
            <h2 className="text-xl font-semibold">Lista de Relatórios ({isLoading ? '...' : filteredReports.length})</h2>
            <div className="flex gap-2 w-full sm:w-auto">
                <Button onClick={handleExport} variant="outline" className="flex-1 sm:flex-none">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar (CSV)
                </Button>
                <Button onClick={handleOpenNewReportModal} className="flex-1 sm:flex-none">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Novo Relatório
                </Button>
            </div>
          </div>
          
          <Card className="shadow-sm">
            <CardContent className="p-0">
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
                        {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
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
            </CardContent>
          </Card>
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm" disabled={isLoading || filteredReports.length === 0}>
              Anterior
            </Button>
            <Button variant="outline" size="sm" disabled={isLoading || filteredReports.length === 0}>
              Próximo
            </Button>
          </div>
        </div>
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
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6">
            <IncidentForm 
              initialData={isNewReport ? undefined : {
                incidentType: editingReport?.type || '',
                description: editingReport?.description || '',
                location: editingReport?.location || '',
                geolocation: editingReport?.geolocation || '',
                date: editingReport?.date ? new Date(editingReport.date) : new Date(),
              }} 
              onSubmitSuccess={handleFormSubmitSuccess} 
              isModalMode={true}
            />
          </div>
           <DialogClose asChild className="absolute right-4 top-4">
            <Button variant="ghost" size="icon">
              <XIcon className="h-5 w-5" />
              <span className="sr-only">Fechar</span>
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}
