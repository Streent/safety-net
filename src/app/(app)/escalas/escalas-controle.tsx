
// src/app/(app)/escalas/escalas-controle.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useMemo } from 'react';
import { mockTecnicosData, type TecnicoProcessado } from './data.ts';
import { processEscalasData } from './utils.ts';

const SELECT_ANY_OPTION_VALUE = "__ANY_OPTION_VALUE__"; // Constante para valor não vazio

export default function EscalasControleTab() {
  const hoje = useMemo(() => new Date("2025-06-04T00:00:00Z"), []);
  const dadosProcessados: TecnicoProcessado[] = useMemo(() => {
    return processEscalasData(mockTecnicosData, [], hoje); 
  }, [hoje]);


  const [simuladorPerfil, setSimuladorPerfil] = useState('');
  const [simuladorEspecialidade, setSimuladorEspecialidade] = useState('');
  const [resultadoSimulacao, setResultadoSimulacao] = useState<TecnicoProcessado[] | null>(null);

  const uniquePerfis = useMemo(() => {
    return [...new Set(mockTecnicosData.map(t => t.Perfil_Tecnico))].filter(Boolean).sort((a, b) => a.localeCompare(b));
  }, []);

  const uniqueEspecialidades = useMemo(() => {
    return [...new Set(mockTecnicosData.map(t => t.Especialidade_Tecnica))].filter(Boolean).sort((a, b) => a.localeCompare(b));
  }, []);


  const handleSimular = () => {
    const elegiveis = dadosProcessados.filter(t => 
        t.statusDisponibilidadeSistema === 'Disponível' &&
        (simuladorPerfil === '' || t.Perfil_Tecnico === simuladorPerfil) &&
        (simuladorEspecialidade === '' || t.Especialidade_Tecnica === simuladorEspecialidade)
    );

    if (elegiveis.length === 0) {
        setResultadoSimulacao([]);
        return;
    }

    const pontuados = elegiveis.map(t => {
        let pontuacao = 0;
        if (t.diasSemViajar !== Infinity) {
            pontuacao += t.diasSemViajar * 1.5; 
        }
        if (simuladorPerfil !== '' && t.Perfil_Tecnico === simuladorPerfil) pontuacao += 100;
        if (simuladorEspecialidade !== '' && t.Especialidade_Tecnica === simuladorEspecialidade) pontuacao += 75;
        pontuacao -= t.viagensNoAno * 0.5; // Menos viagens no ano = melhor
        return { ...t, pontuacao };
    }).sort((a,b) => (b.pontuacao ?? 0) - (a.pontuacao ?? 0)); 
    
    setResultadoSimulacao(pontuados.slice(0,5));
  };

  return (
    <div className="space-y-6">
        <div className="mb-8">
            <h2 className="text-3xl font-semibold text-slate-800 dark:text-slate-200 mb-2">Controlo e Simulação de Próxima Viagem</h2>
            <p className="text-slate-600 dark:text-slate-400 text-md">
                Insira os requisitos da demanda e o sistema sugerirá os técnicos mais adequados.
            </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="text-xl">Parâmetros da Simulação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <label htmlFor="simuladorPerfil" className="block mb-2 text-sm font-medium text-foreground">Perfil Técnico Necessário:</label>
                        <Select 
                          value={simuladorPerfil || SELECT_ANY_OPTION_VALUE} 
                          onValueChange={(value) => setSimuladorPerfil(value === SELECT_ANY_OPTION_VALUE ? '' : value)}
                        >
                            <SelectTrigger id="simuladorPerfil">
                                <SelectValue placeholder="Qualquer Perfil" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={SELECT_ANY_OPTION_VALUE}>Qualquer Perfil</SelectItem>
                                {uniquePerfis.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label htmlFor="simuladorEspecialidade" className="block mb-2 text-sm font-medium text-foreground">Especialidade Requerida:</label>
                         <Select 
                           value={simuladorEspecialidade || SELECT_ANY_OPTION_VALUE} 
                           onValueChange={(value) => setSimuladorEspecialidade(value === SELECT_ANY_OPTION_VALUE ? '' : value)}
                         >
                            <SelectTrigger id="simuladorEspecialidade">
                                <SelectValue placeholder="Qualquer Especialidade" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={SELECT_ANY_OPTION_VALUE}>Qualquer Especialidade</SelectItem>
                                {uniqueEspecialidades.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleSimular} className="w-full">
                        <span className="mr-2">💡</span>Gerar Sugestões
                    </Button>
                </CardContent>
            </Card>
            <Card className="shadow-md">
                 <CardHeader>
                    <CardTitle className="text-xl">Resultado da Simulação (Top 5)</CardTitle>
                </CardHeader>
                 <CardContent className="min-h-[200px]">
                    {resultadoSimulacao === null && <p className="italic text-muted-foreground">A lista de técnicos sugeridos aparecerá aqui.</p>}
                    {resultadoSimulacao && resultadoSimulacao.length === 0 && <p className="text-center p-4 text-muted-foreground italic">Nenhum técnico disponível com os critérios selecionados.</p>}
                    {resultadoSimulacao && resultadoSimulacao.length > 0 && (
                        <ol className="list-decimal list-inside space-y-3">
                            {resultadoSimulacao.map((t, index) => (
                                <li key={t.ID_Tecnico} className={`p-4 rounded-lg ${index === 0 ? 'bg-green-500/10 border border-green-500/30' : 'bg-muted/50 border border-border'}`}>
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-foreground">{t.Nome_Tecnico}</span>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${index === 0 ? 'bg-green-500/20 text-green-700' : 'bg-muted text-muted-foreground'}`}>Prioridade #{index + 1}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1.5">
                                        {t.Perfil_Tecnico || 'N/A'} • {t.Especialidade_Tecnica || 'N/A'} • {t.diasSemViajar === Infinity ? 'Nunca viajou' : `${t.diasSemViajar} dias s/ viajar`}
                                    </div>
                                     <div className="text-xs text-muted-foreground/70 mt-1">Score: {t.pontuacao?.toFixed(1) ?? 'N/A'}</div>
                                </li>
                            ))}
                        </ol>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
