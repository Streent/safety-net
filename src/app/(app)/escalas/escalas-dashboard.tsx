
'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/stat-card'; // Assuming you have a generic StatCard
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart';
import { BarChart as RechartsBarChartComponent, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { mockTecnicosData, mockViagensData } from '@/app/(app)/escalas/data.ts';
import { processEscalasData } from '@/app/(app)/escalas/utils.ts'; // Import from utils
import type { TecnicoProcessado } from '@/app/(app)/escalas/data.ts'; // Import type

// Define chart configs if not already globally available or specific to this dashboard
const viagensChartConfig = {
  viagens: { label: "Viagens", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

const prioridadeChartConfig = {
  dias: { label: "Dias s/ Viajar", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

export default function EscalasDashboardTab() {
  const hoje = useMemo(() => new Date("2025-06-04T00:00:00Z"), []); // Use UTC date

  const dadosProcessados: TecnicoProcessado[] = useMemo(() => {
    return processEscalasData(mockTecnicosData, mockViagensData, hoje);
  }, [hoje]);

  const kpis = useMemo(() => {
    if (dadosProcessados.length === 0) return {
      maiorTempoSemViajar: { tecnico: '-', dias: 'N/A' },
      tecnicoMaisViagens: { tecnico: '-', viagens: 'N/A' },
      tecnicosIndisponiveis: 0,
      totalTecnicos: 0,
    };

    const disponiveis = dadosProcessados.filter(t => t.statusDisponibilidadeSistema === 'Disponível');
    const indisponiveisCount = dadosProcessados.filter(t => t.statusDisponibilidadeSistema === 'Indisponível').length;

    let maiorTempo = { Nome_Tecnico: '-', diasSemViajar: -1 as number | typeof Infinity };
    if (disponiveis.length > 0) {
      const comDiasValidos = disponiveis.filter(t => t.diasSemViajar !== Infinity);
      if (comDiasValidos.length > 0) {
        maiorTempo = comDiasValidos.reduce((max, tec) => (tec.diasSemViajar > max.diasSemViajar) ? tec : max);
      } else if (disponiveis.length > 0) { // All available have Infinity
        maiorTempo = { Nome_Tecnico: 'N/A (nunca viajaram)', diasSemViajar: Infinity };
      }
    }
    
    let maisViagens = { Nome_Tecnico: '-', viagensNoAno: -1 };
    const comViagens = dadosProcessados.filter(t => t.viagensNoAno > 0);
    if (comViagens.length > 0) {
      maisViagens = comViagens.reduce((max, tec) => tec.viagensNoAno > max.viagensNoAno ? tec : max);
    }

    return {
      maiorTempoSemViajar: { 
        tecnico: maiorTempo.Nome_Tecnico, 
        dias: maiorTempo.diasSemViajar === Infinity ? 'N/A' : maiorTempo.diasSemViajar === -1 ? '-' : String(maiorTempo.diasSemViajar)
      },
      tecnicoMaisViagens: { 
        tecnico: maisViagens.Nome_Tecnico, 
        viagens: maisViagens.viagensNoAno === -1 ? 'N/A' : String(maisViagens.viagensNoAno) 
      },
      tecnicosIndisponiveis: indisponiveisCount,
      totalTecnicos: dadosProcessados.length,
    };
  }, [dadosProcessados]);

  const viagensPorTecnicoChartData = useMemo(() => {
    return dadosProcessados
      .filter(t => t.viagensNoAno > 0)
      .sort((a, b) => b.viagensNoAno - a.viagensNoAno)
      .slice(0, 10)
      .map(t => ({ name: t.Nome_Tecnico, viagens: t.viagensNoAno }));
  }, [dadosProcessados]);

  const prioridadeViagemChartData = useMemo(() => {
    return dadosProcessados
      .filter(t => t.statusDisponibilidadeSistema === 'Disponível' && t.diasSemViajar !== Infinity)
      .sort((a, b) => b.diasSemViajar - a.diasSemViajar)
      .slice(0, 10)
      .map(t => ({ name: t.Nome_Tecnico, dias: t.diasSemViajar as number }));
  }, [dadosProcessados]);

  return (
    <div className="space-y-6">
      <div className="mb-8">
          <h2 className="text-3xl font-semibold text-slate-800 dark:text-slate-200 mb-2">Visão Geral e Indicadores</h2>
          <p className="text-slate-600 dark:text-slate-400 text-md">Este painel apresenta os principais indicadores de desempenho e a situação atual da equipa. As informações são atualizadas dinamicamente com base nos registos de viagens e no estado dos técnicos, oferecendo uma visão rápida para tomada de decisões.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <StatCard 
            title="Maior Tempo Sem Viajar (Disp.)" 
            value={kpis.maiorTempoSemViajar.dias === 'N/A' ? 0 : parseInt(kpis.maiorTempoSemViajar.dias) || 0} 
            subtitle={kpis.maiorTempoSemViajar.tecnico}
            iconName="CalendarClock"
            iconColor="text-yellow-500"
        />
        <StatCard 
            title="Técnico com Mais Viagens (Ano)" 
            value={kpis.tecnicoMaisViagens.viagens === 'N/A' ? 0 : parseInt(kpis.tecnicoMaisViagens.viagens) || 0} 
            subtitle={kpis.tecnicoMaisViagens.tecnico}
            iconName="Users" // Changed from plane to Users as per StatCard options
            iconColor="text-blue-500"
        />
        <StatCard 
            title="Técnicos Indisponíveis" 
            value={kpis.tecnicosIndisponiveis} 
            subtitle={`de ${kpis.totalTecnicos} técnicos totais`}
            iconName="AlertTriangle" // Changed from no-entry to AlertTriangle
            iconColor="text-red-500"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">Viagens no Ano por Técnico (Top 10)</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] p-2">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChartComponent data={viagensPorTecnicoChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={70} />
                <YAxis tick={{ fontSize: 10 }} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', borderRadius: '0.25rem', color: 'white' }}
                  itemStyle={{ fontSize: 12 }}
                  labelStyle={{ fontWeight: 'bold', fontSize: 14 }}
                />
                <Bar dataKey="viagens" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} barSize={30} />
              </RechartsBarChartComponent>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">Ranking de Prioridade (Top 10)</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] p-2">
             <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChartComponent data={prioridadeViagemChartData} layout="vertical" margin={{ top: 5, right: 30, left: 70, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={100} interval={0} />
                <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', borderRadius: '0.25rem', color: 'white' }}
                    itemStyle={{ fontSize: 12 }}
                    labelStyle={{ fontWeight: 'bold', fontSize: 14 }}
                />
                <Bar dataKey="dias" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} barSize={20} />
              </RechartsBarChartComponent>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
