
// src/app/(app)/certificados/page.tsx
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Search, Filter, Download, Edit, FileText as FileTextIcon, CalendarDays, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription as UiCardDescription } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { CertificateViewModal } from '@/components/certificates/CertificateViewModal';

// Interface Certificado expandida
export interface Certificado {
  id: string;
  alunoNome: string;
  alunoCPF: string;
  cursoNome: string;
  dataRealizacao: Date; // Renomeado de dataEmissao
  cargaHoraria: number;
  localRealizacao: string;
  instrutorResponsavel: string;
  dataValidade?: Date | null; // Pode ser Date ou null/undefined
  conteudoProgramatico?: string;
  nomeEmpresa?: string;
  cnpjEmpresa?: string;
  observacoesAdicionais?: string;
  templateCertificado?: string; // Se relevante para a visualização
  status: 'Emitido' | 'Pendente' | 'Cancelado';
  pdfUrl?: string;
}

const initialMockCertificados: Certificado[] = [
  { id: 'CERT001', alunoNome: 'Ana Beatriz Costa', alunoCPF: '111.222.333-44', cursoNome: 'NR-35 Trabalho em Altura', dataRealizacao: new Date(2024, 4, 15), cargaHoraria: 8, localRealizacao: 'Sala de Treinamento A', instrutorResponsavel: 'Robson Perusso', nomeEmpresa: 'Construtora Segura Ltda.', status: 'Emitido', pdfUrl: '#', conteudoProgramatico: 'Normas e regulamentos aplicáveis ao trabalho em altura; Análise de Risco e condições impeditivas; Riscos potenciais inerentes ao trabalho em altura e medidas de prevenção e controle; Sistemas, equipamentos e procedimentos de proteção coletiva; Equipamentos de Proteção Individual para trabalho em altura: seleção, inspeção, conservação e limitação de uso; Acidentes típicos em trabalhos em altura; Condutas em situações de emergência, incluindo noções de técnicas de resgate e de primeiros socorros.' },
  { id: 'CERT002', alunoNome: 'Carlos Eduardo Lima', alunoCPF: '222.333.444-55', cursoNome: 'NR-10 Segurança em Eletricidade', dataRealizacao: new Date(2024, 5, 20), cargaHoraria: 40, localRealizacao: 'Centro de Treinamento XYZ', instrutorResponsavel: 'Juliana Dias', nomeEmpresa: 'Indústria Forte S.A.', status: 'Emitido', pdfUrl: '#', dataValidade: new Date(2026, 5, 19) },
  { id: 'CERT003', alunoNome: 'Daniela Almeida Silva', alunoCPF: '333.444.555-66', cursoNome: 'Primeiros Socorros Avançado', dataRealizacao: new Date(2024, 3, 10), cargaHoraria: 16, localRealizacao: 'Sede SafetyNet', instrutorResponsavel: 'Dr. Ricardo Mendes', status: 'Cancelado', pdfUrl: '#' },
  { id: 'CERT004', alunoNome: 'Eduardo Ferreira Matos', alunoCPF: '444.555.666-77', cursoNome: 'NR-33 Espaço Confinado', dataRealizacao: new Date(2024, 6, 1), cargaHoraria: 16, localRealizacao: 'Unidade Industrial Z', instrutorResponsavel: 'Marcos Oliveira', nomeEmpresa: 'Tecnologia Inovadora ME', status: 'Pendente' },
  { id: 'CERT005', alunoNome: 'Fernanda Gonçalves Ribeiro', alunoCPF: '555.666.777-88', cursoNome: 'Brigada de Incêndio', dataRealizacao: new Date(2024, 2, 25), cargaHoraria: 20, localRealizacao: 'Corpo de Bombeiros Local', instrutorResponsavel: 'Sgt. Almeida', nomeEmpresa: 'Agropecuária Campos Verdes', status: 'Emitido' },
];

const CERTIFICATES_STORAGE_KEY = 'safetyNetCertificates';

const getStatusBadgeClass = (status: Certificado['status']) => {
  switch (status) {
    case 'Emitido':
      return 'bg-green-500/20 text-green-700 border-green-500/30';
    case 'Pendente':
      return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
    case 'Cancelado':
      return 'bg-red-500/20 text-red-700 border-red-500/30';
    default:
      return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
  }
};

export default function CertificadosPage() {
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<Certificado[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cursoFilter, setCursoFilter] = useState('');
  const [dataFilter, setDataFilter] = useState<Date | undefined>();
  const [isMounted, setIsMounted] = useState(false);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCertificateForView, setSelectedCertificateForView] = useState<Certificado | null>(null);

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedCertificates = localStorage.getItem(CERTIFICATES_STORAGE_KEY);
      if (storedCertificates) {
        const parsedCerts: Certificado[] = JSON.parse(storedCertificates).map((cert: any) => ({
          ...cert,
          dataRealizacao: new Date(cert.dataRealizacao),
          dataValidade: cert.dataValidade ? new Date(cert.dataValidade) : null,
        }));
        setCertificates(parsedCerts);
      } else {
        setCertificates(initialMockCertificados);
        localStorage.setItem(CERTIFICATES_STORAGE_KEY, JSON.stringify(initialMockCertificados.map(cert => ({
          ...cert,
          dataRealizacao: cert.dataRealizacao.toISOString(),
          dataValidade: cert.dataValidade ? cert.dataValidade.toISOString() : null,
        }))));
      }
    } catch (error) {
      console.error("Erro ao carregar certificados do localStorage:", error);
      setCertificates(initialMockCertificados);
    }
  }, []);

  const filteredCertificados = useMemo(() => {
    return certificates.filter(cert => {
      const searchMatch = searchTerm === '' || 
                          cert.alunoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          cert.alunoCPF.includes(searchTerm);
      const cursoMatch = cursoFilter === '' || cert.cursoNome.toLowerCase().includes(cursoFilter.toLowerCase());
      const dataMatch = !dataFilter || format(cert.dataRealizacao, 'yyyy-MM-dd') === format(dataFilter, 'yyyy-MM-dd');
      return searchMatch && cursoMatch && dataMatch;
    }).sort((a, b) => b.dataRealizacao.getTime() - a.dataRealizacao.getTime());
  }, [certificates, searchTerm, cursoFilter, dataFilter]);

  const handleViewPdf = (certificate: Certificado) => {
    setSelectedCertificateForView(certificate);
    setIsViewModalOpen(true);
  };

  const handleAction = (action: string, certificadoId: string, alunoNome: string) => {
    toast({
      title: `Ação: ${action} (Placeholder)`,
      description: `Funcionalidade para "${action.toLowerCase()}" o certificado ${certificadoId} de ${alunoNome} será implementada.`,
    });
  };

  return (
    <>
      <PageHeader
        title="Gestão de Certificados"
        description="Emita, gerencie e acompanhe todos os certificados de treinamentos."
        actions={
          <Button asChild>
            <Link href="/certificados/novo">
              <PlusCircle className="mr-2 h-4 w-4" />
              Emitir Novo Certificado
            </Link>
          </Button>
        }
      />

      <Card className="mb-6 shadow">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Filter className="mr-2 h-5 w-5 text-primary" />
            Filtrar Certificados
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por Aluno ou CPF..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-ai-hint="nome do aluno ou CPF"
              />
            </div>
            <Input
              placeholder="Filtrar por Curso (NR)..."
              value={cursoFilter}
              onChange={(e) => setCursoFilter(e.target.value)}
              data-ai-hint="nome do curso ou NR"
            />
            <Input
              type="date"
              placeholder="Filtrar por Data de Realização"
              value={dataFilter ? format(dataFilter, 'yyyy-MM-dd') : ''}
              onChange={(e) => setDataFilter(e.target.value ? new Date(e.target.value + 'T00:00:00') : undefined)}
              data-ai-hint="data de realização"
            />
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <Table className="min-w-[1000px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead className="w-[250px]">Aluno</TableHead>
                  <TableHead className="w-[150px]">CPF</TableHead>
                  <TableHead className="w-[250px]">Curso (NR)</TableHead>
                  <TableHead className="w-[150px]">Data Realização</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCertificados.length > 0 ? filteredCertificados.map((cert, index) => (
                  <TableRow 
                    key={cert.id}
                    className={cn(
                        "hover:bg-muted/50 opacity-0",
                        isMounted && "animate-in fade-in-50 slide-in-from-bottom-2"
                    )}
                    style={{ animationDelay: isMounted ? `${index * 60}ms` : '0ms' }}
                  >
                    <TableCell className="font-medium">{cert.id}</TableCell>
                    <TableCell>{cert.alunoNome}</TableCell>
                    <TableCell>{cert.alunoCPF}</TableCell>
                    <TableCell>{cert.cursoNome}</TableCell>
                    <TableCell>{format(cert.dataRealizacao, 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                    <TableCell>{cert.nomeEmpresa || 'N/A'}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={`text-xs ${getStatusBadgeClass(cert.status)}`}>
                        {cert.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewPdf(cert)}>
                            <Eye className="mr-2 h-4 w-4" /> Visualizar PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction('Editar', cert.id, cert.alunoNome)}>
                            <Edit className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction('Reemitir', cert.id, cert.alunoNome)}>
                            <Download className="mr-2 h-4 w-4" /> Reemitir
                          </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => handleAction('Ver Histórico', cert.id, cert.alunoNome)}>
                            <CalendarDays className="mr-2 h-4 w-4" /> Ver Histórico
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      Nenhum certificado encontrado com os filtros atuais.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" disabled={filteredCertificados.length === 0}>
          Anterior
        </Button>
        <Button variant="outline" size="sm" disabled={filteredCertificados.length === 0}>
          Próximo
        </Button>
      </div>
      <CertificateViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        certificateData={selectedCertificateForView}
      />
    </>
  );
}

