
// src/components/reports/ReportFilters.tsx
'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CalendarDays, Search, Download } from 'lucide-react'; // Added Download
import type { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { ReportStatus } from '@/app/(app)/reports/page';

interface ReportFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  dateRange: DateRange | undefined;
  setDateRange: (dateRange: DateRange | undefined) => void;
  statusFilter: ReportStatus | 'Todos';
  setStatusFilter: (status: ReportStatus | 'Todos') => void;
  technicianFilter: string;
  setTechnicianFilter: (tech: string) => void;
  uniqueTechnicians: string[];
  selectedReportTypes: string[];
  handleReportTypeChange: (type: string) => void;
  allReportTypes: string[];
  // Removed onExport from here as it's better placed with the table actions
}

export function ReportFilters({
  searchTerm,
  setSearchTerm,
  dateRange,
  setDateRange,
  statusFilter,
  setStatusFilter,
  technicianFilter,
  setTechnicianFilter,
  uniqueTechnicians,
  selectedReportTypes,
  handleReportTypeChange,
  allReportTypes,
}: ReportFiltersProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="search-term-filter" className="text-sm font-medium text-muted-foreground">Buscar</Label>
        <div className="relative mt-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search-term-filter"
            placeholder="ID, técnico, descrição..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-ai-hint="buscar em relatorios"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="date-range-filter" className="text-sm font-medium text-muted-foreground">Período</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button id="date-range-filter" variant="outline" className="w-full justify-start text-left font-normal mt-1">
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
        <Label htmlFor="status-filter" className="text-sm font-medium text-muted-foreground">Status</Label>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ReportStatus | 'Todos')}>
          <SelectTrigger id="status-filter" className="mt-1">
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

      <div>
        <Label htmlFor="technician-filter" className="text-sm font-medium text-muted-foreground">Técnico</Label>
        <Select value={technicianFilter} onValueChange={setTechnicianFilter}>
          <SelectTrigger id="technician-filter" className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {uniqueTechnicians.map(tech => (
              <SelectItem key={tech} value={tech}>{tech}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-medium text-muted-foreground">Tipo de Relatório</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mt-2 p-3 border rounded-md bg-muted/30 max-h-48 overflow-y-auto">
          {allReportTypes.map(type => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`type-filter-${type}`}
                checked={selectedReportTypes.includes(type)}
                onCheckedChange={() => handleReportTypeChange(type)}
              />
              <Label htmlFor={`type-filter-${type}`} className="text-sm font-normal cursor-pointer">{type}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
