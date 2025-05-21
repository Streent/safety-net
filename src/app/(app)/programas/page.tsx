
// src/app/(app)/programas/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Program {
  id: string;
  nome: string;
  tipo: 'PGR' | 'PCMSO' | 'LTCAT' | 'PPP' | 'Outro';
  revisao: string; // Pode ser um número de versão ou data
  status: 'Ativo' | 'Em Revisão' | 'Obsoleto' | 'Rascunho';
}

const mockPrograms: Program[] = [
  { id: 'PROG001', nome: 'Programa de Gerenciamento de Riscos - Unidade A', tipo: 'PGR', revisao: 'Rev. 2.1 - 10/05/2024', status: 'Ativo' },
  { id: 'PROG002', nome: 'PCMSO - Sede Administrativa', tipo: 'PCMSO', revisao: 'v1.0 - 01/02/2024', status: 'Ativo' },
  { id: 'PROG003', nome: 'LTCAT - Linha de Produção B', tipo: 'LTCAT', revisao: 'Final - 15/11/2023', status: 'Ativo' },
  { id: 'PROG004', nome: 'Perfil Profissiográfico Previdenciário - Colaborador Y', tipo: 'PPP', revisao: 'Emitido 20/03/2024', status: 'Rascunho' },
  { id: 'PROG005', nome: 'Programa de Conservação Auditiva', tipo: 'Outro', revisao: 'Em elaboração', status: 'Em Revisão' },
  { id: 'PROG006', nome: 'PGR - Unidade C (Antigo)', tipo: 'PGR', revisao: 'Rev. 1.0 - 05/01/2023', status: 'Obsoleto' },
];

const getStatusBadgeClass = (status: Program['status']) => {
  switch (status) {
    case 'Ativo':
      return 'bg-green-500/20 text-green-700 border-green-500/30';
    case 'Em Revisão':
      return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
    case 'Obsoleto':
      return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    case 'Rascunho':
      return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
    default:
      return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
  }
};

export default function ProgramasPage() {
  const { toast } = useToast();
  const [programs, setPrograms] = useState<Program[]>(mockPrograms);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleAddNewProgram = () => {
    toast({
      title: 'Novo Programa',
      description: 'Funcionalidade para criar um novo programa (abrir ProgramEditorPage) será implementada aqui.',
    });
  };

  const handleEditProgram = (programId: string) => {
    toast({
      title: 'Editar Programa',
      description: `Funcionalidade para editar o programa ${programId} (abrir ProgramEditorPage) será implementada aqui.`,
    });
  };

  return (
    <>
      <PageHeader 
        title="Programas de SST"
        description="Gerencie programas como PGR, PCMSO, LTCAT e PPP."
        actions={
          <Button onClick={handleAddNewProgram}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Programa
          </Button>
        }
      />
      
      <div className="rounded-lg border shadow-sm bg-card">
        <div className="overflow-x-auto w-full">
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Nome do Programa</TableHead>
                <TableHead className="w-[15%]">Tipo</TableHead>
                <TableHead className="w-[20%]">Revisão</TableHead>
                <TableHead className="w-[15%] text-center">Status</TableHead>
                <TableHead className="w-[10%] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programs.length > 0 ? programs.map((program, index) => (
                <TableRow 
                  key={program.id} 
                  className={cn(
                    "hover:bg-muted/50 opacity-0",
                    isMounted && "animate-in fade-in-50 slide-in-from-bottom-2"
                  )}
                  style={{ animationDelay: isMounted ? `${index * 75}ms` : '0ms', transitionProperty: 'opacity, transform' }}
                >
                  <TableCell className="font-medium">{program.nome}</TableCell>
                  <TableCell>{program.tipo}</TableCell>
                  <TableCell>{program.revisao}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={`text-xs ${getStatusBadgeClass(program.status)}`}>
                      {program.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Ações para {program.nome}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditProgram(program.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        {/* Adicionar mais ações como "Ver Histórico", "Excluir", etc. */}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Nenhum programa encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
       <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" disabled={programs.length === 0}>
          Anterior
        </Button>
        <Button variant="outline" size="sm" disabled={programs.length === 0}>
          Próximo
        </Button>
      </div>
    </>
  );
}
