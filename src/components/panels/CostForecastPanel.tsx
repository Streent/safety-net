
// src/components/panels/CostForecastPanel.tsx
'use client';

import * as React from 'react';
import { BarChart, Download, Loader2, LineChart as LineChartIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { MultiSelectDropdown, type MultiSelectOption } from '@/components/ui/multi-select-dropdown';
import { useToast } from '@/hooks/use-toast';
import type { Sector } from '@/app/api/sectors/route';
import type { CostDataPoint, ForecastPayload, ForecastResponse } from '@/app/(app)/api/forecastCosts/route';
import { convertToCSV, downloadCSV } from '@/lib/csvUtils';
import { Skeleton } from '@/components/ui/skeleton';

const chartConfig = {
  cost: {
    label: 'Custo (R$)',
    color: 'hsl(var(--chart-1))',
  },
  forecast: {
    label: 'Previsão Custo (R$)',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export function CostForecastPanel() {
  const [sectors, setSectors] = React.useState<MultiSelectOption[]>([]);
  const [selectedSectors, setSelectedSectors] = React.useState<string[]>([]);
  const [historicalData, setHistoricalData] = React.useState<CostDataPoint[]>([]);
  const [forecastData, setForecastData] = React.useState<CostDataPoint[]>([]);
  const [isLoadingSectors, setIsLoadingSectors] = React.useState(true);
  const [isLoadingForecast, setIsLoadingForecast] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    async function fetchSectors() {
      setIsLoadingSectors(true);
      try {
        const response = await fetch('/api/sectors');
        if (!response.ok) {
          throw new Error('Falha ao buscar setores');
        }
        const data: Sector[] = await response.json();
        setSectors(data.map(s => ({ value: s.id, label: s.name })));
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Erro ao Carregar Setores',
          description: error instanceof Error ? error.message : 'Não foi possível carregar os dados dos setores.',
        });
      } finally {
        setIsLoadingSectors(false);
      }
    }
    fetchSectors();
  }, [toast]);

  const handleRunForecast = async () => {
    if (selectedSectors.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Seleção Necessária',
        description: 'Por favor, selecione pelo menos um setor para rodar a previsão.',
      });
      return;
    }
    setIsLoadingForecast(true);
    setForecastData([]); // Clear previous forecast
    try {
      const payload: ForecastPayload = {
        sectors: selectedSectors,
        historyMonths: 12,
        forecastMonths: 6,
      };
      const response = await fetch('/api/forecastCosts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Falha ao processar a previsão' }));
        throw new Error(errorData.error || 'Falha ao rodar a previsão');
      }
      const data: ForecastResponse = await response.json();
      setHistoricalData(data.history);
      setForecastData(data.forecast);
      toast({
        title: 'Previsão Completa',
        description: 'Os dados da previsão de custos foram gerados.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erro na Previsão',
        description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado.',
      });
    } finally {
      setIsLoadingForecast(false);
    }
  };

  const handleDownloadCSV = () => {
    if (forecastData.length === 0) {
      toast({
        variant: 'default',
        title: 'Nenhum Dado para Exportar',
        description: 'Por favor, rode a previsão primeiro.',
      });
      return;
    }
    const allData = [...historicalData.slice(Math.max(0, historicalData.length - (12-forecastData.length))), ...forecastData];
    const csvData = convertToCSV(allData);
    downloadCSV(csvData, 'previsao_custos.csv');
    toast({
      title: 'Download Iniciado',
      description: 'O arquivo CSV da previsão está sendo baixado.',
    });
  };
  
  const combinedChartData = React.useMemo(() => {
    if (historicalData.length === 0) return [];
    
    const historyMap = new Map(historicalData.map(p => [p.month, p]));
    const forecastMap = new Map(forecastData.map(p => [p.month, p]));
    
    const allMonthsSet = new Set([...historicalData.map(p => p.month), ...forecastData.map(p => p.month)]);
    
    // Need to sort the months correctly if they are not already in order
    // This simple sort might not be perfect for "MMM YY" strings if years change across decades,
    // but for typical 12-18 month spans it should work.
    // A more robust solution would parse months and years.
    const sortedMonths = Array.from(allMonthsSet).sort((a, b) => {
        const [m1, y1] = a.split(' ');
        const [m2, y2] = b.split(' ');
        const dateA = new Date(`20${y1}-${m1}-01`); // Assuming month names are parseable by Date
        const dateB = new Date(`20${y2}-${m2}-01`);
        // A better way for sorting months based on pt-BR:
        const monthOrder = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const yearA = parseInt(y1);
        const yearB = parseInt(y2);
        if (yearA !== yearB) return yearA - yearB;
        return monthOrder.indexOf(m1) - monthOrder.indexOf(m2);
    });


    return sortedMonths.map(month => ({
        month,
        cost: historyMap.get(month)?.cost,
        forecast: forecastMap.get(month)?.cost,
    }));
  }, [historicalData, forecastData]);


  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <BarChart className="mr-2 h-6 w-6 text-primary" />
          Painel de Previsão de Custos
        </CardTitle>
        <CardDescription>
          Selecione setores para visualizar o histórico de custos e gerar uma previsão.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label htmlFor="sector-select" className="text-sm font-medium text-muted-foreground mb-1 block">
            Setores
          </label>
          {isLoadingSectors ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <MultiSelectDropdown
              options={sectors}
              selectedValues={selectedSectors}
              onSelectionChange={setSelectedSectors}
              placeholder="Selecione os setores..."
              disabled={isLoadingForecast}
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <LineChartIcon className="mr-2 h-5 w-5 text-primary-600" />
                Histórico de Custos (Últimos 12 Meses)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingForecast && historicalData.length === 0 ? (
                 <Skeleton className="h-[300px] w-full" />
              ) : historicalData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <LineChart data={combinedChartData.filter(d => d.cost !== undefined)}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis tickFormatter={(value) => `R$${value / 1000}k`} />
                    <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line type="monotone" dataKey="cost" stroke="var(--color-cost)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ChartContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Nenhum dado histórico para exibir. Rode a previsão.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <LineChartIcon className="mr-2 h-5 w-5 text-accent-600" />
                Previsão de Custos (Próximos 6 Meses)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingForecast ? (
                 <Skeleton className="h-[300px] w-full" />
              ) : forecastData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <LineChart data={combinedChartData.filter(d => d.forecast !== undefined)}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis tickFormatter={(value) => `R$${value / 1000}k`} />
                    <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line type="monotone" dataKey="forecast" stroke="var(--color-forecast)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ChartContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  A previsão aparecerá aqui após a execução.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
        <Button
          variant="outline"
          onClick={handleDownloadCSV}
          disabled={forecastData.length === 0 || isLoadingForecast}
          className="w-full sm:w-auto"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Previsão (CSV)
        </Button>
        <Button 
          onClick={handleRunForecast} 
          disabled={isLoadingSectors || isLoadingForecast || selectedSectors.length === 0}
          className="w-full sm:w-auto"
        >
          {isLoadingForecast ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <BarChart className="mr-2 h-4 w-4" />
          )}
          Rodar Previsão
        </Button>
      </CardFooter>
    </Card>
  );
}
