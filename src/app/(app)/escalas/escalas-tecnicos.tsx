
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mockTecnicosData, mockViagensData, type TecnicoRaw, type ViagemRaw, type TecnicoProcessado } from './data';
import { parseDateUTC, diffInDaysUTC } from './utils'; // Assuming utils.ts will be created or functions moved

// Function to process technician data (can be moved to a utils file)
const processEscalasData = (
  tecnicos: TecnicoRaw[],
  viagens: ViagemRaw[],
  hoje: Date
): TecnicoProcessado[] => {
  return tecnicos.map((tec) => {
    const viagensTecnico = viagens.filter((v) => v.ID_Tecnico === tec.ID_Tecnico);
    let ultimaViagemObj: ViagemRaw | null = null;

    if (viagensTecnico.length > 0) {
      ultimaViagemObj = viagensTecnico.reduce((latest, current) => {
        const currentDate = parseDateUTC(current.Data_Viagem);
        const latestDate = parseDateUTC(latest.Data_Viagem);
        if (!currentDate) return latest;
        if (!latestDate) return current;
        return currentDate > latestDate ? current : latest;
      });
    }

    const ultimaViagemData = ultimaViagemObj ? parseDateUTC(ultimaViagemObj.Data_Viagem) : null;
    const diasSemViajar = ultimaViagemData ? diffInDaysUTC(hoje, ultimaViagemData) : Infinity;

    const viagensNoAno = viagensTecnico.filter((v) => {
      const dataViagem = parseDateUTC(v.Data_Viagem);
      return dataViagem && dataViagem.getUTCFullYear() === hoje.getUTCFullYear();
    }).length;

    const statusDisponibilidadeSistema = tec.Status_Original_Tecnico === 'Ativo' ? 'Disponível' : 'Indisponível';

    return {
      ...tec,
      diasSemViajar,
      viagensNoAno,
      statusDisponibilidadeSistema,
      ultimaViagemDataFormatada: ultimaViagemData
        ? ultimaViagemData.toLocaleDateString('pt-BR', { timeZone: 'UTC' })
        : 'Nunca viajou',
    };
  });
};


export default function EscalasTecnicosTab() {
  const hoje = useMemo(() => new Date("2025-06-04T00:00:00Z"), []); // Use UTC date
  const [dadosProcessados, setDadosProcessados] = useState<TecnicoProcessado[]>([]);

  const [filtroNome, setFiltroNome] = useState('');
  const [filtroPerfil, setFiltroPerfil] = useState('');
  const [filtroEspecialidade, setFiltroEspecialidade] = useState('');
  const [filtroStatusSistema, setFiltroStatusSistema] = useState('');

  useEffect(() => {
    setDadosProcessados(processEscalasData(mockTecnicosData, mockViagensData, hoje));
  }, [hoje]);

  const uniquePerfis = useMemo(() => {
    return [...new Set(mockTecnicosData.map(t => t.Perfil_Tecnico))].filter(Boolean).sort((a, b) => a.localeCompare(b));
  }, []);

  const uniqueEspecialidades = useMemo(() => {
    return [...new Set(mockTecnicosData.map(t => t.Especialidade_Tecnica))].filter(Boolean).sort((a, b) => a.localeCompare(b));
  }, []);

  const filteredTecnicos = useMemo(() => {
    return dadosProcessados.filter(t =>
      (t.Nome_Tecnico.toLowerCase().includes(filtroNome.toLowerCase())) &&
      (filtroPerfil === '' || t.Perfil_Tecnico === filtroPerfil) &&
      (filtroEspecialidade === '' || t.Especialidade_Tecnica === filtroEspecialidade) &&
      (filtroStatusSistema === '' || t.statusDisponibilidadeSistema === filtroStatusSistema)
    );
  }, [dadosProcessados, filtroNome, filtroPerfil, filtroEspecialidade, filtroStatusSistema]);

  const getDiasSemViajarColor = (dias: number | typeof Infinity) => {
    if (dias === Infinity) return 'text-slate-500';
    if (dias > 60) return 'text-red-600 font-semibold';
    if (dias > 30) return 'text-amber-600 font-semibold';
    return 'text-green-600';
  };

  const getStatusSistemaBadge = (status: 'Disponível' | 'Indisponível') => {
    return status === 'Disponível' ? 'bg-green-100 text-green-700 border-green-400' : 'bg-red-100 text-red-700 border-red-400';
  };

  const getStatusOriginalBadge = (status: string) => {
    return status === 'Ativo' ? 'bg-blue-100 text-blue-700 border-blue-400' : 'bg-yellow-100 text-yellow-700 border-yellow-400';
  };
  

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-slate-800 dark:text-slate-200 mb-2">Gestão de Técnicos</h2>
        <p className="text-slate-600 dark:text-slate-400 text-md">
          Consulte, filtre e ordene a lista de técnicos. A tabela abaixo exibe o perfil completo, o estado atual (calculado pelo sistema com base no seu estado original e restrições) e o tempo desde a última viagem. Alertas visuais ajudam a identificar rapidamente técnicos que não viajam há muito tempo ou que estão indisponíveis.
        </p>
      </div>
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Input
              type="text"
              value={filtroNome}
              onChange={e => setFiltroNome(e.target.value)}
              className="placeholder-slate-400"
              placeholder="🔎 Filtrar por nome..."
              aria-label="Filtrar por nome"
            />
            <Select value={filtroPerfil} onValueChange={setFiltroPerfil}>
              <SelectTrigger aria-label="Filtrar por perfil">
                <SelectValue placeholder="Todos os Perfis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os Perfis</SelectItem>
                {uniquePerfis.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filtroEspecialidade} onValueChange={setFiltroEspecialidade}>
              <SelectTrigger aria-label="Filtrar por especialidade">
                <SelectValue placeholder="Todas as Especialidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as Especialidades</SelectItem>
                {uniqueEspecialidades.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filtroStatusSistema} onValueChange={setFiltroStatusSistema}>
              <SelectTrigger aria-label="Filtrar por status do sistema">
                <SelectValue placeholder="Todos os Estados (Sistema)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os Estados (Sistema)</SelectItem>
                <SelectItem value="Disponível">Disponível</SelectItem>
                <SelectItem value="Indisponível">Indisponível</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ScrollArea className="h-[60vh] w-full rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-slate-200 dark:bg-slate-700 z-10">
                <TableRow>
                  <TableHead className="px-6 py-3">Nome</TableHead>
                  <TableHead className="px-6 py-3">Perfil</TableHead>
                  <TableHead className="px-6 py-3">Especialidade</TableHead>
                  <TableHead className="px-6 py-3">Residência</TableHead>
                  <TableHead className="px-6 py-3 text-center">Dias s/ Viajar</TableHead>
                  <TableHead className="px-6 py-3 text-center">Estado (Sistema)</TableHead>
                  <TableHead className="px-6 py-3 text-center">Estado (Original)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredTecnicos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center p-6 text-slate-500 dark:text-slate-400">
                      Nenhum técnico encontrado com os filtros aplicados.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTecnicos.map(t => (
                    <TableRow key={t.ID_Tecnico} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150">
                      <TableCell className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">{t.Nome_Tecnico}</TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">{t.Perfil_Tecnico || 'N/A'}</TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">{t.Especialidade_Tecnica || 'N/A'}</TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">{t.Residencia_Tecnico || 'N/A'}</TableCell>
                      <TableCell className={`px-6 py-4 text-center whitespace-nowrap ${getDiasSemViajarColor(t.diasSemViajar)}`}>
                        {t.diasSemViajar === Infinity ? 'Nunca viajou' : t.diasSemViajar}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center whitespace-nowrap">
                        <Badge variant="outline" className={`text-xs ${getStatusSistemaBadge(t.statusDisponibilidadeSistema)}`}>
                          {t.statusDisponibilidadeSistema}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center whitespace-nowrap">
                        <Badge variant="outline" className={`text-xs ${getStatusOriginalBadge(t.Status_Original_Tecnico)}`}>
                          {t.Status_Original_Tecnico || 'N/A'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

