
'use client';
import { TrendingUp, Users, Calendar as CalendarIcon } from 'lucide-react';
import {
  Bar,
  Cell,
  Pie,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  BarChart as RechartsBarChartComponent, 
  PieChart as RechartsPieChartComponent, 
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig
} from "@/components/ui/chart"
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale'; // Importar locale ptBR

const barChartData = [
  { month: 'Jan', tecnicoA: 40, tecnicoB: 24 },
  { month: 'Fev', tecnicoA: 30, tecnicoB: 13 },
  { month: 'Mar', tecnicoA: 20, tecnicoB: 58 },
  { month: 'Abr', tecnicoA: 27, tecnicoB: 39 },
  { month: 'Mai', tecnicoA: 18, tecnicoB: 48 },
  { month: 'Jun', tecnicoA: 23, tecnicoB: 38 },
];

const barChartConfig = {
  tecnicoA: {
    label: "Técnico A", // i18n: charts.technicianA
    color: "hsl(var(--chart-1))",
  },
  tecnicoB: {
    label: "Técnico B", // i18n: charts.technicianB
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

const pieChartData = [
  { name: 'Bom Estado', value: 400, fill: 'hsl(var(--chart-1))' }, // i18n: charts.epiGood
  { name: 'Reparo Necessário', value: 150, fill: 'hsl(var(--chart-2))' }, // i18n: charts.epiNeedsRepair
  { name: 'Expirado', value: 50, fill: 'hsl(var(--chart-3))' }, // i18n: charts.epiExpired
  { name: 'Em Uso', value: 200, fill: 'hsl(var(--chart-4))' }, // i18n: charts.epiInUse
];

const pieChartConfig = {
  items: {
    label: "Itens", // i18n: charts.pieLabelItems
  },
  bomEstado: { // Match the data 'name' key if specific labels are needed
    label: "Bom Estado", // i18n: charts.epiGood
    color: "hsl(var(--chart-1))",
  },
  reparoNecessario: {
    label: "Reparo Necessário", // i18n: charts.epiNeedsRepair
    color: "hsl(var(--chart-2))",
  },
  expirado: {
    label: "Expirado", // i18n: charts.epiExpired
    color: "hsl(var(--chart-3))",
  },
  emUso: {
    label: "Em Uso", // i18n: charts.epiInUse
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig


export function OverviewCharts() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className="w-full sm:w-[280px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>} {/* i18n: charts.pickDate */}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
              locale={ptBR} // Adicionar locale ptBR ao Calendar
            />
          </PopoverContent>
        </Popover>
        <Select>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por Técnico" /> {/* i18n: charts.filterPlaceholder */}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Técnicos</SelectItem> {/* i18n: charts.filterAllTechnicians */}
            <SelectItem value="techA">Técnico A</SelectItem> {/* i18n: charts.filterTechA */}
            <SelectItem value="techB">Técnico B</SelectItem> {/* i18n: charts.filterTechB */}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Relatórios por Técnico (Últimos 6 Meses) {/* i18n: charts.reportsPerTechnicianTitle */}
            </CardTitle>
            <CardDescription>
              Tendências mensais de relatórios de incidentes por técnico. {/* i18n: charts.reportsPerTechnicianDesc */}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={barChartConfig} className="h-[300px] w-full">
              <RechartsBarChartComponent data={barChartData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }} animationDuration={500}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis tickLine={false} tickMargin={10} axisLine={false} />
                <ChartTooltip 
                  cursor={{fill: 'hsl(var(--muted))', radius: 4}} 
                  content={<ChartTooltipContent />} 
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="tecnicoA" fill="var(--color-tecnicoA)" radius={[4, 4, 0, 0]} animationDuration={500} />
                <Bar dataKey="tecnicoB" fill="var(--color-tecnicoB)" radius={[4, 4, 0, 0]} animationDuration={500} />
              </RechartsBarChartComponent>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Status dos EPIs {/* i18n: charts.epiStatusTitle */}
            </CardTitle>
            <CardDescription>
              Distribuição atual dos status dos Equipamentos de Proteção Individual (EPIs). {/* i18n: charts.epiStatusDesc */}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={pieChartConfig} className="h-[300px] w-full aspect-square">
               <RechartsPieChartComponent animationDuration={500}>
                <ChartTooltip 
                  cursor={{fill: 'hsl(var(--muted))'}} 
                  content={<ChartTooltipContent hideLabel nameKey="name"/>} 
                />
                <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label animationDuration={500} >
                   {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Pie>
                 <ChartLegend content={<ChartLegendContent nameKey="name"/>} className="-mt-4" />
              </RechartsPieChartComponent>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
