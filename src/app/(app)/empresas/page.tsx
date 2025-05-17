
'use client';

import { useState } from 'react';
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
import { Building, MoreHorizontal, Eye, Edit2, Search, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Mock data for companies
// @TODO: Fetch real company data from an API or data source.
const mockEmpresas = [
  { id: 'EMP001', nome: 'Construtora Segura Ltda.', cnpj: '12.345.678/0001-99', status: 'Ativo', cidade: 'São Paulo, SP' },
  { id: 'EMP002', nome: 'Indústria Forte S.A.', cnpj: '98.765.432/0001-11', status: 'Inativo', cidade: 'Rio de Janeiro, RJ' },
  { id: 'EMP003', nome: 'Serviços Ágeis EIRELI', cnpj: '11.222.333/0001-44', status: 'Ativo', cidade: 'Belo Horizonte, MG' },
  { id: 'EMP004', nome: 'Tecnologia Inovadora ME', cnpj: '44.555.666/0001-77', status: 'Pendente', cidade: 'Curitiba, PR' },
  { id: 'EMP005', nome: 'Agropecuária Campos Verdes', cnpj: '77.888.999/0001-00', status: 'Ativo', cidade: 'Goiânia, GO' },
];

interface Empresa {
  id: string;
  nome: string;
  cnpj: string;
  status: 'Ativo' | 'Inativo' | 'Pendente';
  cidade: string;
}

const getStatusBadgeClass = (status: Empresa['status']) => {
  switch (status) {
    case 'Ativo':
      return 'bg-green-500/20 text-green-700 border-green-500/30';
    case 'Inativo':
      return 'bg-red-500/20 text-red-700 border-red-500/30';
    case 'Pendente':
      return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
    default:
      return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
  }
};

export default function EmpresasPage() {
  const { toast } = useToast();
  const [empresas, setEmpresas] = useState<Empresa[]>(mockEmpresas);
  const [searchTerm, setSearchTerm] = useState('');

  // @TODO: Add logic for the 'Details' button to navigate to a company detail page, passing the company ID.
  const handleViewDetails = (empresaId: string) => {
    toast({
      title: 'Ver Detalhes da Empresa',
      description: `Funcionalidade para ver detalhes da empresa ${empresaId} (com informações, técnicos, relatórios, documentos, etc.) será implementada aqui.`,
    });
    // Placeholder: router.push(`/empresas/${empresaId}`);
  };

  const handleEditItem = (empresaId: string) => {
    toast({
      title: 'Editar Empresa',
      description: `Funcionalidade para editar empresa ${empresaId} será implementada.`,
    });
  };
  
  const handleAddItem = () => {
    toast({
      title: 'Adicionar Nova Empresa',
      description: 'Funcionalidade de modal/página para adicionar nova empresa será implementada aqui.',
    });
  };

  const filteredEmpresas = empresas.filter(empresa => 
    empresa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.cnpj.replace(/[^\d]/g, "").includes(searchTerm.replace(/[^\d]/g, ""))
  );

  return (
    <>
      <PageHeader
        title="Gestão de Empresas"
        description="Visualize e gerencie as informações das empresas clientes e parceiras."
        actions={
          <Button onClick={handleAddItem}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Empresa
          </Button>
        }
      />

      <Card className="mb-6 shadow">
        <CardHeader>
            <CardTitle className="text-lg">Filtro e Busca</CardTitle>
            <CardDescription>Use o campo abaixo para buscar por nome ou CNPJ.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nome ou CNPJ..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-ai-hint="nome da empresa ou CNPJ"
            />
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm">
        <CardHeader>
            <CardTitle>Lista de Empresas Cadastradas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
            <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[300px]">Nome da Empresa</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredEmpresas.length > 0 ? filteredEmpresas.map((empresa) => (
                    <TableRow key={empresa.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium flex items-center">
                        <Building className="mr-3 h-5 w-5 text-muted-foreground"/>
                        {empresa.nome}
                        </TableCell>
                        <TableCell>{empresa.cnpj}</TableCell>
                        <TableCell>{empresa.cidade}</TableCell>
                        <TableCell className="text-center">
                        <Badge variant="outline" className={`text-xs ${getStatusBadgeClass(empresa.status)}`}>
                            {empresa.status}
                        </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Ações para {empresa.nome}</span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(empresa.id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                <span>Ver Detalhes</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditItem(empresa.id)}>
                                <Edit2 className="mr-2 h-4 w-4" />
                                <span>Editar</span>
                            </DropdownMenuItem>
                            {/* Adicionar mais ações conforme necessário, ex: "Portal do Cliente" */}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                Nenhuma empresa encontrada com os critérios de busca.
                            </TableCell>
                         </TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
       <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" disabled={filteredEmpresas.length === 0}>
          Anterior
        </Button>
        <Button variant="outline" size="sm" disabled={filteredEmpresas.length === 0}>
          Próximo
        </Button>
      </div>
      {/* 
        Placeholder for Detail Page/Modal:
        - Company info, linked technicians, reports, trainings
        - Documents tab (PGR, PCMSO, Audit Reports)
        - Client Portal Link button
      */}
    </>
  );
}
