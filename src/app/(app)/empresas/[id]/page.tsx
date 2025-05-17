
'use client';

import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileText, Briefcase, ExternalLink } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// Mock data - em uma aplicação real, isso viria do backend baseado no `id`
const mockCompanyData = {
  nome: 'Construtora Segura Ltda.',
  cnpj: '12.345.678/0001-99',
  endereco: 'Rua das Palmeiras, 123, São Paulo, SP',
  email: 'contato@construtorasegura.com.br',
  telefone: '(11) 98765-4321',
  responsavel: 'João da Silva',
  status: 'Ativo',
};

const mockPessoasRelacionadas = [
  { id: 'P001', nome: 'Carlos Alberto', cargo: 'Técnico de Segurança Responsável', contato: 'carlos@construtora.com' },
  { id: 'P002', nome: 'Mariana Lima', cargo: 'Engenheira de Obra', contato: 'mariana@construtora.com' },
];

const mockDocumentos = [
  { id: 'D001', nome: 'PGR - Programa de Gerenciamento de Riscos', tipo: 'PGR', validade: '31/12/2024' },
  { id: 'D002', nome: 'PCMSO - Programa de Controle Médico de Saúde Ocupacional', tipo: 'PCMSO', validade: '15/07/2024' },
  { id: 'D003', nome: 'Relatório de Auditoria Interna Q3', tipo: 'Auditoria', validade: 'N/A' },
];


export default function CompanyDetailPage() {
  const params = useParams();
  const companyId = params.id as string;

  // Em uma aplicação real, você usaria o companyId para buscar os dados da empresa.
  // const { data: companyData, isLoading, error } = useFetchCompanyData(companyId);
  // Por agora, vamos usar os dados mockados.

  return (
    <>
      <PageHeader
        title={mockCompanyData.nome || `Detalhes da Empresa ${companyId}`}
        description={`Informações detalhadas, pessoas e documentos associados.`}
      />

      <div className="space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Briefcase className="mr-3 h-6 w-6 text-primary" />
              Informações da Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div><strong>CNPJ:</strong> {mockCompanyData.cnpj}</div>
              <div><strong>Status:</strong> <span className={`font-semibold ${mockCompanyData.status === 'Ativo' ? 'text-green-600' : 'text-red-600'}`}>{mockCompanyData.status}</span></div>
              <div className="md:col-span-2"><strong>Endereço:</strong> {mockCompanyData.endereco}</div>
              <div><strong>Email:</strong> {mockCompanyData.email}</div>
              <div><strong>Telefone:</strong> {mockCompanyData.telefone}</div>
              <div><strong>Responsável Principal:</strong> {mockCompanyData.responsavel}</div>
            </div>
            <Separator className="my-4" />
            <Button variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              Acessar Portal do Cliente (Placeholder)
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Users className="mr-3 h-6 w-6 text-primary" />
              Pessoas Relacionadas
            </CardTitle>
            <CardDescription>Técnicos, responsáveis e outros contatos importantes.</CardDescription>
          </CardHeader>
          <CardContent>
            {mockPessoasRelacionadas.length > 0 ? (
              <ul className="space-y-3">
                {mockPessoasRelacionadas.map(pessoa => (
                  <li key={pessoa.id} className="p-3 border rounded-md bg-muted/40">
                    <p className="font-semibold">{pessoa.nome}</p>
                    <p className="text-xs text-muted-foreground">{pessoa.cargo}</p>
                    <p className="text-xs text-muted-foreground">Contato: {pessoa.contato}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma pessoa relacionada cadastrada.</p>
            )}
            {/* TODO: Botão para adicionar/vincular nova pessoa */}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <FileText className="mr-3 h-6 w-6 text-primary" />
              Documentos da Empresa
            </CardTitle>
            <CardDescription>PGR, PCMSO, Relatórios de Auditoria e outros documentos relevantes.</CardDescription>
          </CardHeader>
          <CardContent>
            {mockDocumentos.length > 0 ? (
              <ul className="space-y-3">
                {mockDocumentos.map(doc => (
                  <li key={doc.id} className="p-3 border rounded-md bg-muted/40">
                    <p className="font-semibold">{doc.nome}</p>
                    <p className="text-xs text-muted-foreground">Tipo: {doc.tipo} | Validade: {doc.validade}</p>
                    {/* TODO: Botões para Ver/Download do documento */}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum documento cadastrado.</p>
            )}
             {/* TODO: Botão para upload de novo documento */}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
