
'use client';
import Link from 'next/link';
import { PlusCircle, Download, FilePenLine, Eye, MoreHorizontal, CalendarDays, Filter } from 'lucide-react';
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
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { IncidentForm } from '@/components/reports/incident-form';
import { useToast } from '@/hooks/use-toast';

interface Report {
  id: string;
  date: Date;
  technician: string;
  type: string;
  status: ReportStatus;
  description?: string;
  location?: string;
  geolocation?: string;
  // Add other fields as necessary for the IncidentForm
}

const initialMockReports: Report[] = [
  { id: 'RPT001', date: new Date(2024, 5, 10), technician: 'Alice Silva', type: 'Quase Acidente', status: 'Aberto', description: 'Escada escorregadia no armazém B.', location: 'Armazém B' },
  { id: 'RPT002', date: new Date(2024, 5, 12), technician: 'Roberto Costa', type: 'Observação de Segurança', status: 'Fechado', description: 'Equipamento de proteção individual (EPI) não utilizado corretamente na linha de montagem 3.', location: 'Linha de Montagem 3' },
  { id: 'RPT003', date: new Date(2024, 5, 15), technician: 'Alice Silva', type: 'Primeiros Socorros', status: 'Em Progresso', description: 'Corte leve no dedo do colaborador Mário Santos ao manusear ferramenta.', location: 'Oficina Mecânica' },
  { id: 'RPT004', date: new Date(2024, 5, 18), technician: 'Carlos Neves', type: 'Dano à Propriedade', status: 'Aberto', description: 'Empilhadeira colidiu com prateleira, causando danos menores.', location: 'Corredor 5, Armazém A' },
  { id: 'RPT005', date: new Date(2024, 5, 20), technician: 'Roberto Costa', type: 'Ambiental', status: 'Fechado', description: 'Vazamento de óleo contido próximo ao gerador G-02.', location: 'Área Externa - Geradores' },
];

type ReportStatus = 'Aberto' | 'Em Progresso' | 'Fechado';

const statusColors: Record<ReportStatus, string> = {
  Aberto: 'bg-red-500/20 text-red-700 border-red-500/30',
  'Em Progresso': 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
  Fechado: 'bg-green-500/20 text-green-700 border-green-500/30',
};

export default function ReportsListPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'Todos'>('Todos');
  const [technicianFilter, setTechnicianFilter] = useState<string>('Todos');
  
  const [reports, setReports] = useState<Report[]>(initialMockReports);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null); // Store the full report object for editing
  const [isNewReport, setIsNewReport] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  const uniqueTechnicians = useMemo(() => {
    const techs = new Set(reports.map(report => report.technician));
    return ['Todos', ...Array.from(techs)];
  }, [reports]);

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const dateMatch = !dateRange || 
                        (dateRange.from && report.date >= dateRange.from && 
                         (!dateRange.to || report.date <= dateRange.to));
      const statusMatch = statusFilter === 'Todos' || report.status === statusFilter;
      const technicianMatch = technicianFilter === 'Todos' || report.technician === technicianFilter;
      return dateMatch && statusMatch && technicianMatch;
    });
  }, [reports, dateRange, statusFilter, technicianFilter]);

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

  const handleFormSubmitSuccess = (submittedData: any) => {
    if (isNewReport) {
      // Add new report to the list
      const newReport: Report = {
        id: `RPT${Math.random().toString(36).substr(2, 3).toUpperCase()}${Date.now() % 1000}`,
        date: submittedData.date,
        technician: 'Usuário Atual', // Placeholder, in real app get from auth
        type: submittedData.incidentType,
        status: 'Aberto', // Default status for new reports
        description: submittedData.description,
        location: submittedData.location,
        geolocation: submittedData.geolocation,
      };
      setReports(prevReports => [newReport, ...prevReports]);
      toast({ title: "Relatório Criado", description: "Novo relatório de incidente adicionado com sucesso." });
    } else if (editingReport) {
      // Update existing report
      setReports(prevReports => 
        prevReports.map(r => 
          r.id === editingReport.id 
            ? { 
                ...r, 
                date: submittedData.date,
                type: submittedData.incidentType,
                description: submittedData.description,
                location: submittedData.location,
                geolocation: submittedData.geolocation,
                // status might be updated by a different flow
              } 
            : r
        )
      );
      toast({ title: "Relatório Atualizado", description: `Relatório ${editingReport.id} atualizado com sucesso.` });
    }
    handleCloseReportModal();
  };


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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label htmlFor="date-range" className="text-sm font-medium text-muted-foreground">Período</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button id="date-range" variant="outline" className="w-full justify-start text-left font-normal">
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
          <div className="space-y-1">
            <label htmlFor="status" className="text-sm font-medium text-muted-foreground">Status</label>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ReportStatus | 'Todos')}>
              <SelectTrigger id="status">
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
          <div className="space-y-1">
            <label htmlFor="technician" className="text-sm font-medium text-muted-foreground">Técnico</label>
            <Select value={technicianFilter} onValueChange={setTechnicianFilter}>
              <SelectTrigger id="technician">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {uniqueTechnicians.map(tech => (
                  <SelectItem key={tech} value={tech}>{tech}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar Tudo (CSV)
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
            <TableBody>
              {filteredReports.length > 0 ? filteredReports.map((report) => (
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
                            e.stopPropagation(); // Prevent row click when opening dropdown
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
                        <DropdownMenuItem onClick={(e) => e.stopPropagation() /* Placeholder for export */}>
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
        <Button variant="outline" size="sm" disabled={filteredReports.length === 0}>
          Anterior
        </Button>
        <Button variant="outline" size="sm" disabled={filteredReports.length === 0}>
          Próximo
        </Button>
      </div>

      <Dialog open={isReportModalOpen} onOpenChange={handleCloseReportModal}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="text-2xl">
              {isNewReport ? 'Registrar Novo Incidente' : `Editar Relatório #${editingReport?.id}`}
            </DialogTitle>
            <DialogDescription>
              {isNewReport ? 'Forneça informações detalhadas sobre o incidente.' : 'Atualize os detalhes deste relatório de incidente.'}
            </DialogDescription>
             <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground" />
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6">
            <IncidentForm 
              initialData={isNewReport ? undefined : {
                incidentType: editingReport?.type || '',
                description: editingReport?.description || '',
                location: editingReport?.location || '',
                geolocation: editingReport?.geolocation || '',
                date: editingReport?.date || new Date(),
              }} 
              onSubmitSuccess={handleFormSubmitSuccess} 
              isModalMode={true} // Indicate to form it's in a modal
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
