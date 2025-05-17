
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale'; 
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
        title="Relatórios de Incidentes" 
        description="Visualize, gerencie e exporte relatórios de incidentes." 
        actions={
          <Link href="/reports/new" passHref>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Relatório 
            </Button>
          </Link>
        }
      />

      <div className="mb-6 p-4 border rounded-lg bg-card shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-1">
            <label htmlFor="date-range" className="text-sm font-medium text-muted-foreground">Período</label> 
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
                            <span>Selecione um período</span> 
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={2} locale={ptBR}/>
                </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1">
            <label htmlFor="technician" className="text-sm font-medium text-muted-foreground">Técnico</label> 
            <Select>
              <SelectTrigger id="technician">
                <SelectValue placeholder="Todos os Técnicos" /> 
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
            <label htmlFor="status" className="text-sm font-medium text-muted-foreground">Status</label> 
            <Select>
              <SelectTrigger id="status">
                <SelectValue placeholder="Todos os Status" /> 
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
            Exportar Tudo (CSV) 
          </Button>
        </div>
      </div>

      <div className="rounded-lg border shadow-sm bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">ID do Relatório</TableHead> 
                <TableHead>Data</TableHead> 
                <TableHead>Técnico</TableHead> 
                <TableHead>Tipo</TableHead> 
                <TableHead>Status</TableHead> 
                <TableHead className="text-right">Ações</TableHead> 
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
                          onClick={(e) => e.stopPropagation()} 
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Ações para {report.id}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild onClick={(e) => e.stopPropagation()}>
                          <Link href={`/reports/${report.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            <span>Visualizar</span> 
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild onClick={(e) => e.stopPropagation()}>
                          <Link href={`/reports/${report.id}`}>
                            <FilePenLine className="mr-2 h-4 w-4" />
                            <span>Editar</span> 
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <Download className="mr-2 h-4 w-4" />
                          <span>Exportar PDF</span> 
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button variant="outline" size="sm" disabled>
            Anterior 
          </Button>
          <Button variant="outline" size="sm">
            Próximo 
          </Button>
        </div>
    </>
  );
}
