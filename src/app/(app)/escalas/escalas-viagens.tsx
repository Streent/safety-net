
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mockTecnicosData, mockViagensData, type ViagemRaw, type TecnicoRaw } from '@/app/(app)/escalas/data.ts';
import { parseDateUTC } from '@/app/(app)/escalas/utils.ts';

export default function EscalasViagensTab() {
  const [filtroDataViagem, setFiltroDataViagem] = useState('');
  const [filtroClienteViagem, setFiltroClienteViagem] = useState('');
  const [filtroCidadeViagem, setFiltroCidadeViagem] = useState('');
  const [filtroTecnicoViagem, setFiltroTecnicoViagem] = useState('');

  const uniqueClientes = useMemo(() => {
    return [...new Set(mockViagensData.map(v => v.Cliente))].filter(Boolean).sort((a, b) => a.localeCompare(b));
  }, []);

  const uniqueCidades = useMemo(() => {
    return [...new Set(mockViagensData.map(v => v.Cidade_Cliente))].filter(Boolean).sort((a, b) => a.localeCompare(b));
  }, []);

  const uniqueNomesTecnicos = useMemo(() => {
    return [...new Set(mockTecnicosData.map(t => t.Nome_Tecnico))].filter(Boolean).sort((a, b) => a.localeCompare(b));
  }, []);

  const viagensComNomeTecnico = useMemo(() => {
    return mockViagensData.map(v => {
      const tecnico = mockTecnicosData.find(t => t.ID_Tecnico === v.ID_Tecnico);
      return { ...v, nomeTecnico: tecnico ? tecnico.Nome_Tecnico : "Desconhecido" };
    });
  }, []);

  const filteredViagens = useMemo(() => {
    return viagensComNomeTecnico.filter(v => {
      const dataViagem = parseDateUTC(v.Data_Viagem);
      const dataFormatadaParaFiltro = dataViagem ? `${dataViagem.getUTCFullYear()}-${String(dataViagem.getUTCMonth() + 1).padStart(2, '0')}-${String(dataViagem.getUTCDate()).padStart(2, '0')}` : '';

      return (filtroDataViagem === '' || dataFormatadaParaFiltro.includes(filtroDataViagem)) &&
             (filtroClienteViagem === '' || v.Cliente === filtroClienteViagem) &&
             (filtroCidadeViagem === '' || v.Cidade_Cliente === filtroCidadeViagem) &&
             (filtroTecnicoViagem === '' || v.nomeTecnico === filtroTecnicoViagem);
    }).sort((a, b) => {
      const dateA = parseDateUTC(a.Data_Viagem);
      const dateB = parseDateUTC(b.Data_Viagem);
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateB.getTime() - dateA.getTime(); // Sort descending by date
    });
  }, [viagensComNomeTecnico, filtroDataViagem, filtroClienteViagem, filtroCidadeViagem, filtroTecnicoViagem]);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-slate-800 dark:text-slate-200 mb-2">Registo de Viagens</h2>
        <p className="text-slate-600 dark:text-slate-400 text-md">
          Acompanhe o histórico completo de viagens realizadas. Utilize os filtros para analisar deslocamentos por cliente, cidade, técnico ou período.
        </p>
      </div>
      <Card className="shadow-md">
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Input
              type="text"
              value={filtroDataViagem}
              onChange={e => setFiltroDataViagem(e.target.value)}
              className="placeholder-slate-400 dark:placeholder-slate-500"
              placeholder="🔎 Data (AAAA-MM-DD)"
              aria-label="Filtrar por data da viagem"
            />
            <Select value={filtroClienteViagem} onValueChange={setFiltroClienteViagem}>
              <SelectTrigger aria-label="Filtrar por cliente">
                <SelectValue placeholder="Todos os Clientes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os Clientes</SelectItem>
                {uniqueClientes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filtroCidadeViagem} onValueChange={setFiltroCidadeViagem}>
              <SelectTrigger aria-label="Filtrar por cidade">
                <SelectValue placeholder="Todas as Cidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as Cidades</SelectItem>
                {uniqueCidades.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filtroTecnicoViagem} onValueChange={setFiltroTecnicoViagem}>
              <SelectTrigger aria-label="Filtrar por técnico">
                <SelectValue placeholder="Todos os Técnicos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os Técnicos</SelectItem>
                {uniqueNomesTecnicos.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <ScrollArea className="h-[60vh] w-full rounded-md border dark:border-slate-700">
            <Table>
              <TableHeader className="sticky top-0 bg-slate-200 dark:bg-slate-700 z-10">
                <TableRow className="border-slate-300 dark:border-slate-600">
                  <TableHead className="px-4 py-3 sm:px-6">Data</TableHead>
                  <TableHead className="px-4 py-3 sm:px-6">Técnico</TableHead>
                  <TableHead className="px-4 py-3 sm:px-6">Cliente</TableHead>
                  <TableHead className="px-4 py-3 sm:px-6">Cidade</TableHead>
                  <TableHead className="px-4 py-3 sm:px-6">Turno</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredViagens.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center p-6 text-slate-500 dark:text-slate-400">
                      Nenhuma viagem encontrada com os filtros aplicados.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredViagens.map((v, index) => {
                    const dataViagem = parseDateUTC(v.Data_Viagem);
                    const dataFormatada = dataViagem ? dataViagem.toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'Data Inválida';
                    return (
                      <TableRow key={`${v.ID_Tecnico}-${v.Data_Viagem}-${index}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150">
                        <TableCell className="px-4 py-4 sm:px-6 whitespace-nowrap">{dataFormatada}</TableCell>
                        <TableCell className="px-4 py-4 sm:px-6 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">{v.nomeTecnico}</TableCell>
                        <TableCell className="px-4 py-4 sm:px-6 whitespace-nowrap">{v.Cliente || 'N/A'}</TableCell>
                        <TableCell className="px-4 py-4 sm:px-6 whitespace-nowrap">{v.Cidade_Cliente || 'N/A'}</TableCell>
                        <TableCell className="px-4 py-4 sm:px-6 whitespace-nowrap">{v.Turno || 'N/A'}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
