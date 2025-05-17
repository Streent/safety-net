
'use client';
import Link from 'next/link';
import { PlusCircle, Download, FilePenLine, Eye, MoreHorizontal, Calendar as CalendarIconLucide, Filter } from 'lucide-react';
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
// import { Input } from '@/components/ui/input'; // Input de busca pode ser adicionado depois
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale'; // Importar locale ptBR
import type { DateRange } from 'react-day-picker';
import { useState } from 'react';
import { useRouter } from 'next/navigation'; 

const mockReports = [
  { id: 'RPT001', date: new Date(2024, 5, 10), technician: 'Alice Silva', type: 'Quase Acidente', status: 'Aberto' },
  { id: 'RPT002', date: new Date(2024, 5, 12), technician: 'Roberto Costa', type: 'Observação de Segurança', status: 'Fechado' },
  { id: 'RPT003', date: new Date(2024, 5, 15), technician: 'Alice Silva', type: 'Primeiros Socorros', status: 'Em Progresso' },
  { id: 'RPT004', date: new Date(2024, 5, 18), technician: 'Carlos Neves', type: 'Dano à Propriedade', status: 'Aberto' },
  { id: 'RPT005', date: new Date(2024, 5, 20), technician: 'Roberto Costa', type: 'Ambiental', status: 'Fechado' },
];

type ReportStatus = 'Aberto' | 'Em Progresso' | 'Fechado';

const statusColors: Record<ReportStatus, string> = {
  Aberto: 'bg-red-500/20 text-red-700 border-red-500/30',
  'Em Progresso': 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
  Fechado: 'bg-green-500/20 text-green-700 border-green-500/30',
};


export default function ReportsListPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const router = useRouter(); 

  const handleRowClick = (reportId: string) => {
    router.push(`/reports/${reportId}`);
  };

  return (
    <>
      <PageHeader
        title="Relatórios de Incidentes" // i18n: reportsList.title
        description="Visualize, gerencie e exporte relatórios de incidentes." // i18n: reportsList.description
        actions={
          <Link href="/reports/new" passHref>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Relatório {/* i18n: reportsList.newReportButton */}
            </Button>
          </Link>
        }
      />

      <div className="mb-6 p-4 border rounded-lg bg-card shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-1">
            <label htmlFor="date-range" className="text-sm font-medium text-muted-foreground">Período</label> {/* i18n: reportsList.filterDateRange */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button id="date-range" variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIconLucide className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                            dateRange.to ? (
                                <>{format(dateRange.from, "dd/MM/y", { locale: ptBR })} - {format(dateRange.to, "dd/MM/y", { locale: ptBR })}</>
                            ) : (
                                format(dateRange.from, "dd/MM/y", { locale: ptBR })
                            )
                        ) : (
                            <span>Selecione um período</span> /* i18n: reportsList.filterPickDate */
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={2} locale={ptBR}/>
                </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1">
            <label htmlFor="technician" className="text-sm font-medium text-muted-foreground">Técnico</label> {/* i18n: reportsList.filterTechnician */}
            <Select>
              <SelectTrigger id="technician">
                <SelectValue placeholder="Todos os Técnicos" /> {/* i18n: reportsList.filterAllTechnicians */}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Técnicos</SelectItem>
                <SelectItem value="alice">Alice Silva</SelectItem>
                <SelectItem value="bob">Roberto Costa</SelectItem>
                <SelectItem value="charlie">Carlos Neves</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label htmlFor="status" className="text-sm font-medium text-muted-foreground">Status</label> {/* i18n: reportsList.filterStatus */}
            <Select>
              <SelectTrigger id="status">
                <SelectValue placeholder="Todos os Status" /> {/* i18n: reportsList.filterAllStatuses */}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="Open">Aberto</SelectItem>
                <SelectItem value="In Progress">Em Progresso</SelectItem>
                <SelectItem value="Closed">Fechado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar Tudo (CSV) {/* i18n: reportsList.exportButton */}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border shadow-sm bg-card"> {/* Removed overflow-hidden */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">ID do Relatório</TableHead> {/* i18n: reportsList.tableHeadID */}
              <TableHead>Data</TableHead> {/* i18n: reportsList.tableHeadDate */}
              <TableHead>Técnico</TableHead> {/* i18n: reportsList.tableHeadTechnician */}
              <TableHead>Tipo</TableHead> {/* i18n: reportsList.tableHeadType */}
              <TableHead>Status</TableHead> {/* i18n: reportsList.tableHeadStatus */}
              <TableHead className="text-right">Ações</TableHead> {/* i18n: reportsList.tableHeadActions */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockReports.map((report) => (
              <TableRow 
                key={report.id} 
                className="hover:bg-muted/50 cursor-pointer"
                onClick={() => handleRowClick(report.id)}
              >
                <TableCell className="font-medium">{report.id}</TableCell>
                <TableCell>{format(report.date, 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                <TableCell>{report.technician}</TableCell>
                <TableCell>{report.type}</TableCell>
                <TableCell>
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
                        onClick={(e) => e.stopPropagation()} // Prevent row click when clicking dropdown
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Ações para {report.id}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild onClick={(e) => e.stopPropagation()}>
                        <Link href={`/reports/${report.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          <span>Visualizar</span> {/* i18n: reportsList.actionView */}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild onClick={(e) => e.stopPropagation()}>
                         <Link href={`/reports/${report.id}`}>
                          <FilePenLine className="mr-2 h-4 w-4" />
                          <span>Editar</span> {/* i18n: reportsList.actionEdit */}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                        <Download className="mr-2 h-4 w-4" />
                        <span>Exportar PDF</span> {/* i18n: reportsList.actionExportPDF */}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button variant="outline" size="sm" disabled>
            Anterior {/* i18n: reportsList.paginationPrevious */}
          </Button>
          <Button variant="outline" size="sm">
            Próximo {/* i18n: reportsList.paginationNext */}
          </Button>
        </div>
    </>
  );
}
