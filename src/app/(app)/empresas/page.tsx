
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
import { Building, Eye, Edit2, Search, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription as UiCardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription as UiDialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';

const mockEmpresasData = [
  { id: 'EMP001', nomeFantasia: 'Construtora Segura Ltda.', razaoSocial: 'CONSTRUTORA SEGURA E PARTICIPACOES LTDA', cnpj: '12.345.678/0001-99', inscricaoEstadual: '123.456.789.112', status: 'Ativo', cidade: 'São Paulo, SP', endereco: 'Rua das Palmeiras, 123', email: 'contato@construtorasegura.com.br', telefone: '(11) 98765-4321', responsavelLegal: 'João da Silva' },
  { id: 'EMP002', nomeFantasia: 'Indústria Forte S.A.', razaoSocial: 'INDUSTRIA FORTE METALURGICA S.A.', cnpj: '98.765.432/0001-11', inscricaoEstadual: 'ISENTO', status: 'Inativo', cidade: 'Rio de Janeiro, RJ', endereco: 'Av. Principal, 456', email: 'financeiro@fortesa.com', telefone: '(21) 12345-6789', responsavelLegal: 'Maria Costa' },
  { id: 'EMP003', nomeFantasia: 'Serviços Ágeis EIRELI', razaoSocial: 'SERVICOS AGEIS DE CONSULTORIA EIRELI', cnpj: '11.222.333/0001-44', inscricaoEstadual: '987.654.321.000', status: 'Ativo', cidade: 'Belo Horizonte, MG', endereco: 'Alameda dos Anjos, 789', email: 'comercial@servicosageis.com.br', telefone: '(31) 99887-7665', responsavelLegal: 'Carlos Magno' },
  { id: 'EMP004', nomeFantasia: 'Tecnologia Inovadora ME', razaoSocial: 'TECNOLOGIA INOVADORA SOFTWARE ME', cnpj: '44.555.666/0001-77', status: 'Pendente', cidade: 'Curitiba, PR', endereco: 'Rua da Tecnologia, 101', email: 'suporte@tecinovadora.dev', telefone: '(41) 3030-4040', responsavelLegal: 'Ana Pereira' },
  { id: 'EMP005', nomeFantasia: 'Agropecuária Campos Verdes', razaoSocial: 'AGROPECUARIA CAMPOS VERDES LTDA - ME', cnpj: '77.888.999/0001-00', status: 'Ativo', cidade: 'Goiânia, GO', endereco: 'Fazenda Boa Esperança, S/N', email: 'agro@camposverdes.com.br', telefone: '(62) 98000-0001', responsavelLegal: 'José Oliveira' },
];

interface Empresa {
  id: string;
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  inscricaoEstadual?: string;
  status: 'Ativo' | 'Inativo' | 'Pendente';
  cidade: string;
  endereco?: string;
  email?: string;
  telefone?: string;
  responsavelLegal?: string;
}

const empresaFormSchema = z.object({
  nomeFantasia: z.string().min(3, { message: 'O nome fantasia deve ter pelo menos 3 caracteres.' }),
  razaoSocial: z.string().min(3, { message: 'A razão social deve ter pelo menos 3 caracteres.' }),
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, { message: 'CNPJ inválido. Use o formato XX.XXX.XXX/XXXX-XX.' }),
  inscricaoEstadual: z.string().optional().or(z.literal('')), // Allow empty string for optional
  endereco: z.string().optional(),
  email: z.string().email({ message: 'E-mail inválido.' }).optional().or(z.literal('')),
  telefone: z.string().optional(),
  status: z.enum(['Ativo', 'Inativo', 'Pendente'], { required_error: 'O status é obrigatório.' }),
  responsavelLegal: z.string().optional(),
  cidade: z.string().min(2, { message: 'A cidade deve ter pelo menos 2 caracteres.'}),
});

type EmpresaFormValues = z.infer<typeof empresaFormSchema>;

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
  const router = useRouter();
  const [empresas, setEmpresas] = useState<Empresa[]>(mockEmpresasData);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEmpresaModalOpen, setIsEmpresaModalOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);

  const form = useForm<EmpresaFormValues>({
    resolver: zodResolver(empresaFormSchema),
    defaultValues: {
      nomeFantasia: '',
      razaoSocial: '',
      cnpj: '',
      inscricaoEstadual: '',
      endereco: '',
      email: '',
      telefone: '',
      status: 'Ativo',
      responsavelLegal: '',
      cidade: '',
    },
  });

  useEffect(() => {
    if (isEmpresaModalOpen) {
      if (editingEmpresa) {
        form.reset({
            ...editingEmpresa,
            inscricaoEstadual: editingEmpresa.inscricaoEstadual || '', // Ensure optional fields are reset correctly
            endereco: editingEmpresa.endereco || '',
            email: editingEmpresa.email || '',
            telefone: editingEmpresa.telefone || '',
            responsavelLegal: editingEmpresa.responsavelLegal || '',
        });
      } else {
        form.reset({
          nomeFantasia: '',
          razaoSocial: '',
          cnpj: '',
          inscricaoEstadual: '',
          endereco: '',
          email: '',
          telefone: '',
          status: 'Ativo',
          responsavelLegal: '',
          cidade: '',
        });
      }
    }
  }, [editingEmpresa, form, isEmpresaModalOpen]);

  const handleViewDetails = (empresaId: string) => {
    router.push(`/empresas/${empresaId}`);
  };

  const handleOpenModal = (empresa: Empresa | null = null) => {
    setEditingEmpresa(empresa);
    setIsEmpresaModalOpen(true);
  };
  
  const handleDeleteEmpresa = (empresaId: string) => {
    setEmpresas(prev => prev.filter(e => e.id !== empresaId));
    toast({ title: "Empresa Removida", description: "A empresa foi removida da lista (localmente)." });
  };

  const formatCnpj = (value: string) => {
    const cnpj = value.replace(/\D/g, '');
    if (cnpj.length <= 2) return cnpj;
    if (cnpj.length <= 5) return `${cnpj.slice(0, 2)}.${cnpj.slice(2)}`;
    if (cnpj.length <= 8) return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5)}`;
    if (cnpj.length <= 12) return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8)}`;
    return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12, 14)}`;
  };

  const formatTelefone = (value: string) => {
    const tel = value.replace(/\D/g, '');
    if (tel.length <= 2) return `(${tel}`;
    if (tel.length <= 6) return `(${tel.slice(0,2)}) ${tel.slice(2)}`;
    if (tel.length <= 10) return `(${tel.slice(0,2)}) ${tel.slice(2,6)}-${tel.slice(6)}`;
    return `(${tel.slice(0,2)}) ${tel.slice(2,3)} ${tel.slice(3,7)}-${tel.slice(7,11)}`;
  };

  async function onEmpresaSubmit(data: EmpresaFormValues) {
    const empresaDataToSave = {
        ...data,
        inscricaoEstadual: data.inscricaoEstadual || undefined, // Convert empty string to undefined for consistency
        responsavelLegal: data.responsavelLegal || undefined,
        email: data.email || undefined,
        telefone: data.telefone || undefined,
        endereco: data.endereco || undefined,
    };

    if (editingEmpresa) {
      setEmpresas(prev => prev.map(e => e.id === editingEmpresa.id ? { ...editingEmpresa, ...empresaDataToSave } : e));
      toast({ title: "Empresa Atualizada!", description: `Os dados de ${data.nomeFantasia} foram atualizados.` });
    } else {
      const newEmpresa: Empresa = {
        id: `EMP-${Date.now()}`,
        ...empresaDataToSave,
      };
      setEmpresas(prev => [newEmpresa, ...prev]);
      toast({ title: "Empresa Adicionada!", description: `${data.nomeFantasia} foi adicionada.` });
    }
    setIsEmpresaModalOpen(false);
  }

  const filteredEmpresas = empresas.filter(empresa => 
    empresa.nomeFantasia.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.cnpj.replace(/[^\d]/g, "").includes(searchTerm.replace(/[^\d]/g, ""))
  );

  return (
    <>
      <PageHeader
        title="Gestão de Empresas"
        description="Visualize e gerencie as informações das empresas clientes e parceiras."
        actions={
          <Button onClick={() => handleOpenModal(null)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Empresa
          </Button>
        }
      />

      <Card className="mb-6 shadow">
        <CardHeader>
            <CardTitle className="text-lg">Filtro e Busca</CardTitle>
            <UiCardDescription>Use o campo abaixo para buscar por nome fantasia ou CNPJ.</UiCardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nome fantasia ou CNPJ..."
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
            <div className="overflow-x-auto w-full">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[300px]">Nome Fantasia</TableHead>
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
                        {empresa.nomeFantasia}
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
                            <Button 
                                variant="default" 
                                size="icon" 
                                className="h-9 w-9 p-0 bg-yellow-400 hover:bg-yellow-500 dark:bg-primary dark:hover:bg-primary/90"
                            >
                                <Image 
                                    src="/images/mascote-leao.png" 
                                    alt={`Ações para ${empresa.nomeFantasia}`}
                                    width={24} 
                                    height={24}
                                    className="rounded-full"
                                />
                                <span className="sr-only">Ações para {empresa.nomeFantasia}</span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(empresa.id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                <span>Ver Detalhes</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenModal(empresa)}>
                                <Edit2 className="mr-2 h-4 w-4" />
                                <span>Editar</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteEmpresa(empresa.id)} className="text-destructive focus:text-destructive-foreground focus:bg-destructive/90 hover:text-destructive-foreground hover:!bg-destructive/90">
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Excluir</span>
                            </DropdownMenuItem>
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

      <Dialog open={isEmpresaModalOpen} onOpenChange={setIsEmpresaModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingEmpresa ? 'Editar Empresa' : 'Adicionar Nova Empresa'}</DialogTitle>
            <UiDialogDescription>
              Preencha os dados da empresa abaixo.
            </UiDialogDescription>
          </DialogHeader>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onEmpresaSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
              <FormField
                control={form.control}
                name="nomeFantasia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Fantasia</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome fantasia da empresa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="razaoSocial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Razão Social</FormLabel>
                    <FormControl>
                      <Input placeholder="Razão social completa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="00.000.000/0000-00" 
                        {...field}
                        onChange={(e) => field.onChange(formatCnpj(e.target.value))}
                        maxLength={18}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="inscricaoEstadual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inscrição Estadual (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Número da IE ou 'ISENTO'" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endereco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço Completo (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Rua, Número, Bairro, Complemento..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="cidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade e UF</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: São Paulo, SP" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail (Opcional)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contato@empresa.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone (Opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="(00) 00000-0000" 
                        {...field}
                        onChange={(e) => field.onChange(formatTelefone(e.target.value))}
                        maxLength={16}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="responsavelLegal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsável Legal (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do responsável legal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Ativo">Ativo</SelectItem>
                        <SelectItem value="Inativo">Inativo</SelectItem>
                        <SelectItem value="Pendente">Pendente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="submit">{editingEmpresa ? 'Salvar Alterações' : 'Adicionar Empresa'}</Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </>
  );
}

