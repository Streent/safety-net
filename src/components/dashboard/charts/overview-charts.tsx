
'use client';
import { TrendingUp, Users } from 'lucide-react'; // Corrected: Removed BarChart and PieChart icons
import {
  Bar,
  Cell,
  Pie,
  // ResponsiveContainer, // Removed: ChartContainer handles this
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  BarChart as RechartsBarChartComponent, // Added: Actual BarChart component from recharts
  PieChart as RechartsPieChartComponent, // Added: Actual PieChart component from recharts
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
import { Calendar as CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { format } from 'date-fns';

// Mock data for charts
const barChartData = [
  { month: 'Jan', technicianA: 40, technicianB: 24 },
  { month: 'Feb', technicianA: 30, technicianB: 13 },
  { month: 'Mar', technicianA: 20, technicianB: 58 },
  { month: 'Apr', technicianA: 27, technicianB: 39 },
  { month: 'May', technicianA: 18, technicianB: 48 },
  { month: 'Jun', technicianA: 23, technicianB: 38 },
];

const barChartConfig = {
  technicianA: {
    label: "Technician A",
    color: "hsl(var(--chart-1))",
  },
  technicianB: {
    label: "Technician B",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

const pieChartData = [
  { name: 'Good', value: 400, fill: 'hsl(var(--chart-1))' },
  { name: 'Needs Repair', value: 150, fill: 'hsl(var(--chart-2))' },
  { name: 'Expired', value: 50, fill: 'hsl(var(--chart-3))' },
  { name: 'In Use', value: 200, fill: 'hsl(var(--chart-4))' },
];

const pieChartConfig = {
  items: {
    label: "Items",
  },
  good: {
    label: "Good",
    color: "hsl(var(--chart-1))",
  },
  needsRepair: {
    label: "Needs Repair",
    color: "hsl(var(--chart-2))",
  },
  expired: {
    label: "Expired",
    color: "hsl(var(--chart-3))",
  },
  inUse: {
    label: "In Use",
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
              className="w-[280px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Select>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by..." /> {/* i18n: charts.filterPlaceholder */}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Technicians</SelectItem> {/* i18n: charts.filterAllTechnicians */}
            <SelectItem value="techA">Technician A</SelectItem> {/* i18n: charts.filterTechA */}
            <SelectItem value="techB">Technician B</SelectItem> {/* i18n: charts.filterTechB */}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {/* i18n: charts.reportsPerTechnicianTitle */}
              Reports per Technician (Last 6 Months)
            </CardTitle>
            <CardDescription>
              {/* i18n: charts.reportsPerTechnicianDesc */}
              Monthly incident report trends by technician.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={barChartConfig} className="h-[300px] w-full">
              {/* Removed explicit ResponsiveContainer, ChartContainer handles it */}
              <RechartsBarChartComponent data={barChartData}> {/* Used actual Recharts BarChart */}
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis tickLine={false} tickMargin={10} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="technicianA" fill="var(--color-technicianA)" radius={4} />
                <Bar dataKey="technicianB" fill="var(--color-technicianB)" radius={4} />
              </RechartsBarChartComponent>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {/* i18n: charts.epiStatusTitle */}
              EPI Status Breakdown
            </CardTitle>
            <CardDescription>
              {/* i18n: charts.epiStatusDesc */}
              Current distribution of Equipment Protection Individual (EPI) statuses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={pieChartConfig} className="h-[300px] w-full">
              {/* Removed explicit ResponsiveContainer, ChartContainer handles it */}
               <RechartsPieChartComponent> {/* Used actual Recharts PieChart */}
                <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label >
                   {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Pie>
                 <ChartLegend content={<ChartLegendContent nameKey="name" />} className="-mt-4" />
              </RechartsPieChartComponent>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Removed: const RechartsBarChart = BarChart; // This was causing BarChart to be the lucide icon
