
'use client';

import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileText, Briefcase, ExternalLink, PlusCircle, UserPlus, Edit2, Trash2, CalendarIcon as CalendarIconLucide, View, FileIcon, Building, Mail, Phone, UserCircle2, CheckSquare, XSquare, UserCheck, UserX, MapPin, History as HistoryIcon, BookOpen, ShieldCheckIcon, Activity } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription as UiDialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription as UiFormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

// Mock data - em uma aplicação real, isso viria do backend baseado no `id`
const mockCompanyData = {
  id: 'EMP001',
  nomeFantasia: 'Construtora Segura Ltda.',
  razaoSocial: 'CONSTRUTORA SEGURA E PARTICIPACOES LTDA',
  cnpj: '12.345.678/0001-99',
  inscricaoEstadual: '123.456.789.112',
  endereco: 'Rua das Palmeiras, 123, São Paulo, SP',
  email: 'contato@construtorasegura.com.br',
  telefone: '(11) 98765-4321',
  responsavelLegal: 'João da Silva',
  status: 'Ativo',
};

const mockPessoasRelacionadas = [
  { id: 'P001', nome: 'Carlos Alberto', cargo: 'Técnico de Segurança Responsável', contato: 'carlos@construtora.com' },
  { id: 'P002', nome: 'Mariana Lima', cargo: 'Engenheira de Obra', contato: 'mariana@construtora.com' },
];

interface Documento {
  id: string;
  nome: string;
  tipo: string;
  validade: string;
  descricao?: string;
  linkVisualizacao?: string;
}

const mockDocumentos: Documento[] = [
  { id: 'D001', nome: 'PGR - Programa de Gerenciamento de Riscos', tipo: 'PGR', validade: '31/12/2024', descricao: 'Documento base do Programa de Gerenciamento de Riscos da empresa, conforme NR-01. Este é o documento de exemplo principal.', linkVisualizacao: '/documents/exemplo_documento.txt' },
  { id: 'D002', nome: 'PCMSO - Programa de Controle Médico de Saúde Ocupacional', tipo: 'PCMSO', validade: '15/07/2024', descricao: 'Programa visa a promoção e preservação da saúde dos trabalhadores.', linkVisualizacao: '#' },
  { id: 'D003', nome: 'Relatório de Auditoria Interna Q3', tipo: 'Auditoria', validade: 'N/A', descricao: 'Resultados da auditoria interna de segurança realizada no terceiro trimestre.', linkVisualizacao: '#' },
];

interface Colaborador {
  id: string;
  nome: string;
  cpf: string;
  funcao: string;
  dataNascimento?: Date;
  dataAdmissao?: Date;
  status: 'Ativo' | 'Desligado';
}

const colaboradorFormSchema = z.object({
  nome: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres.' }),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, { message: 'CPF inválido. Use o formato XXX.XXX.XXX-XX.' }),
  funcao: z.string().min(2, { message: 'A função deve ter pelo menos 2 caracteres.' }),
  dataNascimento: z.date({
    errorMap: (issue, ctx) => {
      if (issue.code === z.ZodIssueCode.invalid_date) {
        return { message: "Data de nascimento inválida." };
      }
      return { message: ctx.defaultError };
    }
  }).optional(),
  dataAdmissao: z.date({
     errorMap: (issue, ctx) => {
      if (issue.code === z.ZodIssueCode.invalid_date) {
        return { message: "Data de admissão inválida." };
      }
      return { message: ctx.defaultError };
    }
  }).optional(),
  status: z.enum(['Ativo', 'Desligado'], { required_error: 'O status é obrigatório.' }),
});

type ColaboradorFormValues = z.infer<typeof colaboradorFormSchema>;

export default function CompanyDetailPage() {
  const params = useParams();
  const companyId = params.id as string;
  const { toast } = useToast();

  const [companyData, setCompanyData] = useState(mockCompanyData);

  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [isColaboradorModalOpen, setIsColaboradorModalOpen] = useState(false);
  const [editingColaborador, setEditingColaborador] = useState<Colaborador | null>(null);

  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Documento | null>(null);

  const [isColaboradorHistoryModalOpen, setIsColaboradorHistoryModalOpen] = useState(false);
  const [selectedColaboradorForHistory, setSelectedColaboradorForHistory] = useState<Colaborador | null>(null);


  const form = useForm<ColaboradorFormValues>({
    resolver: zodResolver(colaboradorFormSchema),
    defaultValues: {
      nome: '',
      cpf: '',
      funcao: '',
      dataNascimento: undefined,
      dataAdmissao: undefined,
      status: 'Ativo',
    },
  });

  useEffect(() => {
    if (companyId) {
        const foundCompany = mockCompanyData; // In a real app, fetch by companyId
        if (foundCompany && foundCompany.id === companyId) {
            setCompanyData(foundCompany);
        } else {
            // Fallback if specific company not found in mock, or just use the mock
            setCompanyData({ ...mockCompanyData, id: companyId, nomeFantasia: `Empresa ${companyId}` });
            setColaboradores([]); // Reset collaborators if it's a different company context
        }
        // Mock some collaborators for EMP001 for demonstration
        if (companyId === 'EMP001') {
          setColaboradores([
            { id: 'C001', nome: 'José Carlos', cpf: '111.222.333-44', funcao: 'Eletricista Chefe', dataAdmissao: new Date(2020, 0, 15), status: 'Ativo' },
            { id: 'C002', nome: 'Fernanda Souza', cpf: '444.555.666-77', funcao: 'Técnica de Segurança', dataAdmissao: new Date(2021, 5, 1), status: 'Ativo' },
          ]);
        }
    }
  }, [companyId]);

  useEffect(() => {
    if (isColaboradorModalOpen) {
      if (editingColaborador) {
        form.reset({
          ...editingColaborador,
          dataNascimento: editingColaborador.dataNascimento ? new Date(editingColaborador.dataNascimento) : undefined,
          dataAdmissao: editingColaborador.dataAdmissao ? new Date(editingColaborador.dataAdmissao) : undefined,
          status: editingColaborador.status || 'Ativo',
        });
      } else {
        form.reset({
          nome: '',
          cpf: '',
          funcao: '',
          dataNascimento: undefined,
          dataAdmissao: undefined,
          status: 'Ativo',
        });
      }
    }
  }, [editingColaborador, form, isColaboradorModalOpen]);

  const handleAddColaborador = () => {
    setEditingColaborador(null);
    form.reset({
        nome: '',
        cpf: '',
        funcao: '',
        dataNascimento: undefined,
        dataAdmissao: undefined,
        status: 'Ativo',
    });
    setIsColaboradorModalOpen(true);
  };

  const handleEditColaborador = (colaborador: Colaborador) => {
    setEditingColaborador(colaborador);
    setIsColaboradorModalOpen(true);
  }

  const handleDeleteColaborador = (colaboradorId: string) => {
    setColaboradores(prev => prev.filter(c => c.id !== colaboradorId));
    toast({ title: "Colaborador Removido", description: "O colaborador foi removido da lista (localmente)." });
  }

  async function onColaboradorSubmit(data: ColaboradorFormValues) {
    if (editingColaborador) {
      setColaboradores(prev => prev.map(c => c.id === editingColaborador.id ? { ...editingColaborador, ...data } : c));
      toast({ title: "Colaborador Atualizado!", description: `Os dados de ${data.nome} foram atualizados.` });
    } else {
      const newColaborador: Colaborador = {
        id: `COLAB-${Date.now()}`,
        ...data,
      };
      setColaboradores(prev => [...prev, newColaborador]);
      toast({ title: "Colaborador Adicionado!", description: `${data.nome} foi adicionado à empresa.` });
    }
    setIsColaboradorModalOpen(false);
  }

  const formatCpf = (value: string) => {
    const cpf = value.replace(/\D/g, '');
    if (cpf.length <= 3) return cpf;
    if (cpf.length <= 6) return `${cpf.slice(0, 3)}.${cpf.slice(3)}`;
    if (cpf.length <= 9) return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`;
    return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9, 11)}`;
  };

  const handleViewDocumentDetails = (docId: string) => {
    const doc = mockDocumentos.find(d => d.id === docId);
    if (doc) {
      setSelectedDocument(doc);
      setIsDocumentModalOpen(true);
    } else {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Documento não encontrado.",
      });
    }
  };

  const handleViewColaboradorHistory = (colaborador: Colaborador) => {
    setSelectedColaboradorForHistory(colaborador);
    setIsColaboradorHistoryModalOpen(true);
  };

  const getColaboradorStatusBadgeClass = (status: Colaborador['status']) => {
    switch (status) {
      case 'Ativo':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Desligado':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <>
      <PageHeader
        title={companyData.nomeFantasia || `Detalhes da Empresa`}
        description={`Informações detalhadas, contatos, colaboradores e documentos associados.`}
      />

      <div className="space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Briefcase className="mr-3 h-6 w-6 text-primary" />
              Informações da Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div><Building className="inline mr-2 h-4 w-4 text-muted-foreground" /><strong>Nome Fantasia:</strong> {companyData.nomeFantasia}</div>
              <div><Building className="inline mr-2 h-4 w-4 text-muted-foreground" /><strong>Razão Social:</strong> {companyData.razaoSocial}</div>
              <div><FileText className="inline mr-2 h-4 w-4 text-muted-foreground" /><strong>CNPJ:</strong> {companyData.cnpj}</div>
              <div><FileText className="inline mr-2 h-4 w-4 text-muted-foreground" /><strong>Inscrição Estadual:</strong> {companyData.inscricaoEstadual || 'N/A'}</div>
              <div className="md:col-span-2"><MapPin className="inline mr-2 h-4 w-4 text-muted-foreground" /><strong>Endereço:</strong> {companyData.endereco}</div>
              <div><Mail className="inline mr-2 h-4 w-4 text-muted-foreground" /><strong>Email:</strong> {companyData.email}</div>
              <div><Phone className="inline mr-2 h-4 w-4 text-muted-foreground" /><strong>Telefone:</strong> {companyData.telefone}</div>
              <div><UserCircle2 className="inline mr-2 h-4 w-4 text-muted-foreground" /><strong>Responsável Legal:</strong> {companyData.responsavelLegal}</div>
              <div>
                <span className="font-semibold">Status: </span>
                <Badge variant="outline" className={`ml-1 text-xs ${companyData.status === 'Ativo' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-700 border-red-300'}`}>
                  {companyData.status}
                </Badge>
              </div>
            </div>
            <Separator className="my-4" />
            <Button variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              Acessar Portal do Cliente (Placeholder)
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center text-xl">
                <UserPlus className="mr-3 h-6 w-6 text-primary" />
                Colaboradores da Empresa
              </CardTitle>
              <CardDescription>
                Gerencie os funcionários vinculados a esta empresa.
              </CardDescription>
            </div>
            <Button onClick={handleAddColaborador} size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Colaborador
            </Button>
          </CardHeader>
          <CardContent>
            {colaboradores.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left font-semibold">Nome</th>
                      <th className="p-2 text-left font-semibold">CPF</th>
                      <th className="p-2 text-left font-semibold">Função</th>
                      <th className="p-2 text-left font-semibold">Admissão</th>
                      <th className="p-2 text-center font-semibold">Status</th>
                      <th className="p-2 text-right font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {colaboradores.map(colaborador => (
                      <tr key={colaborador.id} className="border-b hover:bg-muted/50">
                        <td className="p-2">{colaborador.nome}</td>
                        <td className="p-2">{colaborador.cpf}</td>
                        <td className="p-2">{colaborador.funcao}</td>
                        <td className="p-2">{colaborador.dataAdmissao ? format(colaborador.dataAdmissao, "dd/MM/yyyy", { locale: ptBR }) : 'N/A'}</td>
                        <td className="p-2 text-center">
                          <Badge variant="outline" className={`text-xs ${getColaboradorStatusBadgeClass(colaborador.status)}`}>
                             {colaborador.status === 'Ativo' ? <UserCheck className="inline h-3 w-3 mr-1"/> : <UserX className="inline h-3 w-3 mr-1"/>}
                            {colaborador.status}
                          </Badge>
                        </td>
                        <td className="p-2 text-right space-x-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewColaboradorHistory(colaborador)} aria-label={`Ver histórico de ${colaborador.nome}`}>
                            <HistoryIcon className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditColaborador(colaborador)} aria-label={`Editar ${colaborador.nome}`}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteColaborador(colaborador.id)} aria-label={`Excluir ${colaborador.nome}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground p-4 text-center">Nenhum colaborador cadastrado para esta empresa.</p>
            )}
          </CardContent>
        </Card>

        <Dialog open={isColaboradorModalOpen} onOpenChange={setIsColaboradorModalOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingColaborador ? 'Editar Colaborador' : 'Adicionar Novo Colaborador'}</DialogTitle>
              <UiDialogDescription>
                Preencha os dados do colaborador abaixo.
              </UiDialogDescription>
            </DialogHeader>
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(onColaboradorSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do colaborador" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="000.000.000-00"
                          {...field}
                          onChange={(e) => {
                            field.onChange(formatCpf(e.target.value));
                          }}
                          maxLength={14}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="funcao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Função/Cargo</FormLabel>
                      <FormControl>
                        <Input placeholder="Função do colaborador" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dataNascimento"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data de Nascimento (Opcional)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                              >
                                {field.value ? format(new Date(field.value), "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                                <CalendarIconLucide className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} captionLayout="dropdown-buttons" fromYear={1950} toYear={new Date().getFullYear()} initialFocus />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dataAdmissao"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data de Admissão (Opcional)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                              >
                                {field.value ? format(new Date(field.value), "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                                <CalendarIconLucide className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} captionLayout="dropdown-buttons" fromYear={1980} toYear={new Date().getFullYear()} initialFocus />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status do Colaborador</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Ativo">Ativo</SelectItem>
                          <SelectItem value="Desligado">Desligado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <Separator className="my-6" />
                <div>
                    <FormLabel>Adicionar Vários Colaboradores (Copia e Cola)</FormLabel>
                    <Textarea
                        placeholder="Cole aqui os dados dos colaboradores (Ex: Nome;CPF;Função;Nascimento;Admissão por linha). Funcionalidade de parsing a ser implementada."
                        className="mt-1"
                        rows={3}
                        disabled
                    />
                    <p className="text-xs text-muted-foreground mt-1">Esta funcionalidade permitirá o cadastro em lote no futuro.</p>
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancelar</Button>
                  </DialogClose>
                  <Button type="submit">{editingColaborador ? 'Salvar Alterações' : 'Salvar Colaborador'}</Button>
                </DialogFooter>
              </form>
            </FormProvider>
          </DialogContent>
        </Dialog>

        {/* Modal para Histórico do Colaborador */}
        <Dialog open={isColaboradorHistoryModalOpen} onOpenChange={setIsColaboradorHistoryModalOpen}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <HistoryIcon className="mr-2 h-5 w-5 text-primary" />
                Histórico de: {selectedColaboradorForHistory?.nome}
              </DialogTitle>
              <UiDialogDescription>
                Informações e histórico do colaborador selecionado.
              </UiDialogDescription>
            </DialogHeader>
            {selectedColaboradorForHistory && (
              <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2 text-sm">
                <div>
                  <strong className="font-medium">Nome:</strong> <p className="text-muted-foreground">{selectedColaboradorForHistory.nome}</p>
                  <strong className="font-medium">CPF:</strong> <p className="text-muted-foreground">{selectedColaboradorForHistory.cpf}</p>
                  <strong className="font-medium">Função:</strong> <p className="text-muted-foreground">{selectedColaboradorForHistory.funcao}</p>
                  <strong className="font-medium">Status:</strong> <Badge variant="outline" className={`ml-1 text-xs ${getColaboradorStatusBadgeClass(selectedColaboradorForHistory.status)}`}>{selectedColaboradorForHistory.status}</Badge>
                </div>
                <Separator />
                
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center"><BookOpen className="mr-2 h-4 w-4 text-primary" />Treinamentos Realizados (Placeholder)</h4>
                  <div className="p-3 border rounded-md bg-muted/30 text-center text-muted-foreground text-xs italic">
                    Lista de treinamentos e certificados será exibida aqui.
                  </div>

                  <h4 className="font-semibold flex items-center"><CheckSquare className="mr-2 h-4 w-4 text-primary" />Inspeções e Vistorias (Placeholder)</h4>
                   <div className="p-3 border rounded-md bg-muted/30 text-center text-muted-foreground text-xs italic">
                    Histórico de participação em inspeções/vistorias.
                  </div>

                  <h4 className="font-semibold flex items-center"><ShieldCheckIcon className="mr-2 h-4 w-4 text-primary" />ASOs e EPIs Entregues (Placeholder)</h4>
                   <div className="p-3 border rounded-md bg-muted/30 text-center text-muted-foreground text-xs italic">
                    Registros de Atestados de Saúde Ocupacional e entregas de EPIs.
                  </div>
                   <h4 className="font-semibold flex items-center"><Activity className="mr-2 h-4 w-4 text-primary" />Outras Atividades (Placeholder)</h4>
                   <div className="p-3 border rounded-md bg-muted/30 text-center text-muted-foreground text-xs italic">
                    Log de outras atividades relevantes.
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Fechar</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>


        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Users className="mr-3 h-6 w-6 text-primary" />
              Pessoas Relacionadas (Contatos Chave)
            </CardTitle>
            <CardDescription>
                Técnicos, responsáveis e outros contatos importantes.
            </CardDescription>
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
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <FileText className="mr-3 h-6 w-6 text-primary" />
              Documentos da Empresa
            </CardTitle>
            <CardDescription>
                PGR, PCMSO, Relatórios de Auditoria e outros documentos relevantes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mockDocumentos.length > 0 ? (
              <ul className="space-y-3">
                {mockDocumentos.map(doc => (
                  <li
                    key={doc.id}
                    className="p-3 border rounded-md bg-muted/40 hover:bg-muted/60 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 group"
                    onClick={() => handleViewDocumentDetails(doc.id)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleViewDocumentDetails(doc.id); }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Visualizar detalhes do documento ${doc.nome}`}
                  >
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-semibold">{doc.nome}</p>
                            <p className="text-xs text-muted-foreground">Tipo: {doc.tipo} | Validade: {doc.validade}</p>
                        </div>
                        <View className="h-4 w-4 text-muted-foreground opacity-70 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum documento cadastrado.</p>
            )}
          </CardContent>
        </Card>
         {/* Placeholders for future sections */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <CheckSquare className="mr-3 h-6 w-6 text-primary" />
              Relatórios Vinculados (Placeholder)
            </CardTitle>
            <CardDescription>
              Histórico de relatórios de inspeção, incidentes, etc., associados a esta empresa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground p-4 text-center">Lista de relatórios será implementada aqui.</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <XSquare className="mr-3 h-6 w-6 text-primary" /> {/* Using XSquare as a generic placeholder for trainings */}
              Treinamentos Associados (Placeholder)
            </CardTitle>
            <CardDescription>
              Registro de treinamentos realizados ou agendados para os colaboradores desta empresa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground p-4 text-center">Lista de treinamentos será implementada aqui.</p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDocumentModalOpen} onOpenChange={setIsDocumentModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
                <FileIcon className="mr-2 h-5 w-5 text-primary" />
                Detalhes do Documento: {selectedDocument?.nome}
            </DialogTitle>
            <UiDialogDescription>
              Informações sobre o documento selecionado.
            </UiDialogDescription>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2 text-sm">
              <div>
                <strong className="font-medium">Nome:</strong>
                <p className="text-muted-foreground">{selectedDocument.nome}</p>
              </div>
              <div>
                <strong className="font-medium">Tipo:</strong>
                <p className="text-muted-foreground">{selectedDocument.tipo}</p>
              </div>
              <div>
                <strong className="font-medium">Validade:</strong>
                <p className="text-muted-foreground">{selectedDocument.validade}</p>
              </div>
              {selectedDocument.descricao && (
                <div>
                  <strong className="font-medium">Descrição:</strong>
                  <p className="text-muted-foreground whitespace-pre-wrap">{selectedDocument.descricao}</p>
                </div>
              )}
              <Separator className="my-4" />
              <div>
                <h4 className="font-medium mb-2">Conteúdo do Documento</h4>
                <div className="p-4 border rounded-md bg-muted/30 text-center text-muted-foreground">
                  <p className="text-xs italic">
                    (Visualização do PDF ou conteúdo do documento aqui)
                  </p>
                  {selectedDocument.linkVisualizacao && (
                    <Button variant="link" size="sm" asChild className="mt-2">
                      <a href={selectedDocument.linkVisualizacao} target="_blank" rel="noopener noreferrer">
                        Abrir Documento (Exemplo)
                      </a>
                    </Button>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Histórico de Versões</h4>
                <div className="p-4 border rounded-md bg-muted/30 text-center text-muted-foreground">
                  <p className="text-xs italic">
                    (Lista de versões anteriores e alterações aqui)
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Fechar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

