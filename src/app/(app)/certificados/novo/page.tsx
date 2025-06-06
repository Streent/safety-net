
// src/app/(app)/certificados/novo/page.tsx
'use client';

import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription as UiFormDescription } from "@/components/ui/form";
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState, useEffect } from 'react';
import { CalendarIcon, User, FileText, Link as LinkIcon, Building, AlertTriangle, Send, Loader2, Save, Award, Edit2Icon } from 'lucide-react'; // Added Edit2Icon
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Certificado } from '../page'; // Import Certificado type

const certificateFormSchema = z.object({
  nomeAluno: z.string().min(3, { message: "O nome do aluno deve ter pelo menos 3 caracteres." }),
  cpfAluno: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, { message: "CPF inválido. Use o formato XXX.XXX.XXX-XX." }),
  emailAluno: z.string().email({ message: "E-mail inválido." }),
  
  nomeCurso: z.string().min(3, { message: "O nome do curso/NR deve ter pelo menos 3 caracteres." }),
  cargaHoraria: z.coerce.number().positive({ message: "A carga horária deve ser um número positivo." }),
  dataRealizacao: z.date({ required_error: "A data de realização é obrigatória." }),
  dataValidade: z.date().optional().nullable(),
  localRealizacao: z.string().min(3, { message: "O local deve ter pelo menos 3 caracteres." }),
  instrutorResponsavel: z.string().min(3, { message: "O instrutor deve ter pelo menos 3 caracteres." }),
  conteudoProgramatico: z.string().optional(),

  nomeEmpresa: z.string().optional(),
  cnpjEmpresa: z.string().optional().refine(val => !val || /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(val), {
    message: "CNPJ inválido. Use o formato XX.XXX.XXX/XXXX-XX."
  }),
  
  templateCertificado: z.string().min(1, { message: "Selecione um modelo de certificado." }),
  observacoesAdicionais: z.string().optional(),
}).refine(data => {
  if (data.dataValidade && data.dataRealizacao > data.dataValidade) {
    return false;
  }
  return true;
}, {
  message: "A data de validade deve ser posterior à data de realização.",
  path: ["dataValidade"],
});

type CertificateFormValues = z.infer<typeof certificateFormSchema>;

const CERTIFICATES_STORAGE_KEY = 'safetyNetCertificates';
const EDIT_CERTIFICATE_ID_KEY = 'safetyNetEditCertificateId';

export default function NewCertificatePage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [editingCertificateId, setEditingCertificateId] = useState<string | null>(null);
  const [pageTitle, setPageTitle] = useState("Emitir Novo Certificado");
  const [submitButtonText, setSubmitButtonText] = useState("Gerar e Salvar Certificado");
  const [submitButtonIcon, setSubmitButtonIcon] = useState(<Send className="mr-2 h-4 w-4" />);

  useEffect(() => {
    setIsMounted(true);
    const editId = sessionStorage.getItem(EDIT_CERTIFICATE_ID_KEY);
    if (editId) {
      setEditingCertificateId(editId);
      sessionStorage.removeItem(EDIT_CERTIFICATE_ID_KEY); // Clear after use
      const storedCertificatesRaw = localStorage.getItem(CERTIFICATES_STORAGE_KEY);
      if (storedCertificatesRaw) {
        const existingCertificates: Certificado[] = JSON.parse(storedCertificatesRaw).map((cert: any) => ({
          ...cert,
          dataRealizacao: new Date(cert.dataRealizacao),
          dataValidade: cert.dataValidade ? new Date(cert.dataValidade) : null,
        }));
        const certToEdit = existingCertificates.find(c => c.id === editId);
        if (certToEdit) {
          form.reset({
            nomeAluno: certToEdit.alunoNome,
            cpfAluno: certToEdit.alunoCPF,
            // emailAluno: certToEdit.emailAluno, // Assuming email is not part of Certificado interface yet or needs mapping
            emailAluno: '', // Placeholder, adjust if email is in Certificado type
            nomeCurso: certToEdit.cursoNome,
            cargaHoraria: certToEdit.cargaHoraria,
            dataRealizacao: new Date(certToEdit.dataRealizacao),
            dataValidade: certToEdit.dataValidade ? new Date(certToEdit.dataValidade) : null,
            localRealizacao: certToEdit.localRealizacao,
            instrutorResponsavel: certToEdit.instrutorResponsavel,
            conteudoProgramatico: certToEdit.conteudoProgramatico || '',
            nomeEmpresa: certToEdit.nomeEmpresa || '',
            cnpjEmpresa: certToEdit.cnpjEmpresa || '',
            templateCertificado: certToEdit.templateCertificado || '',
            observacoesAdicionais: certToEdit.observacoesAdicionais || '',
          });
          setPageTitle(`Editar Certificado: ${certToEdit.id}`);
          setSubmitButtonText("Salvar Alterações");
          setSubmitButtonIcon(<Save className="mr-2 h-4 w-4" />);
        } else {
          toast({ variant: "destructive", title: "Erro", description: "Certificado para edição não encontrado." });
          setEditingCertificateId(null); // Reset if not found
        }
      }
    } else {
      setPageTitle("Emitir Novo Certificado");
      setSubmitButtonText("Gerar e Salvar Certificado");
      setSubmitButtonIcon(<Send className="mr-2 h-4 w-4" />);
    }
  }, [toast]); // form should not be a dependency here to avoid re-runs on form state change

  const form = useForm<CertificateFormValues>({
    resolver: zodResolver(certificateFormSchema),
    defaultValues: {
      nomeAluno: '',
      cpfAluno: '',
      emailAluno: '',
      nomeCurso: '',
      cargaHoraria: undefined,
      dataRealizacao: new Date(),
      dataValidade: undefined,
      localRealizacao: '',
      instrutorResponsavel: '',
      conteudoProgramatico: '',
      nomeEmpresa: '',
      cnpjEmpresa: '',
      templateCertificado: '',
      observacoesAdicionais: '',
    },
  });

  const formatCpf = (value: string) => {
    const cpf = value.replace(/\D/g, '');
    if (cpf.length <= 3) return cpf;
    if (cpf.length <= 6) return `${cpf.slice(0, 3)}.${cpf.slice(3)}`;
    if (cpf.length <= 9) return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`;
    return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9, 11)}`;
  };

  const formatCnpj = (value: string) => {
    const cnpj = value.replace(/\D/g, '');
    if (cnpj.length <= 2) return cnpj;
    if (cnpj.length <= 5) return `${cnpj.slice(0, 2)}.${cnpj.slice(2)}`;
    if (cnpj.length <= 8) return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5)}`;
    if (cnpj.length <= 12) return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8)}`;
    return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12, 14)}`;
  };

  const onSubmit = async (data: CertificateFormValues) => {
    setIsLoading(true);
    console.log("Dados do Certificado para Salvar/Atualizar:", data);
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const storedCertificatesRaw = localStorage.getItem(CERTIFICATES_STORAGE_KEY);
      let existingCertificates: Certificado[] = storedCertificatesRaw ? JSON.parse(storedCertificatesRaw).map((cert: any) => ({
        ...cert,
        dataRealizacao: new Date(cert.dataRealizacao),
        dataValidade: cert.dataValidade ? new Date(cert.dataValidade) : null,
      })) : [];

      if (editingCertificateId) {
        // Modo de Edição
        existingCertificates = existingCertificates.map(cert => 
          cert.id === editingCertificateId 
            ? { 
                ...cert, // Mantém ID original e outros campos não editáveis se houver
                alunoNome: data.nomeAluno,
                alunoCPF: data.cpfAluno,
                // emailAluno: data.emailAluno, // Mapear se necessário
                cursoNome: data.nomeCurso,
                cargaHoraria: data.cargaHoraria,
                dataRealizacao: data.dataRealizacao,
                dataValidade: data.dataValidade || null,
                localRealizacao: data.localRealizacao,
                instrutorResponsavel: data.instrutorResponsavel,
                conteudoProgramatico: data.conteudoProgramatico || '',
                nomeEmpresa: data.nomeEmpresa || '',
                cnpjEmpresa: data.cnpjEmpresa || '',
                observacoesAdicionais: data.observacoesAdicionais || '',
                templateCertificado: data.templateCertificado,
                status: cert.status, // Mantém status original, a menos que haja lógica para mudar
              } 
            : cert
        );
        toast({
          title: "Certificado Atualizado!",
          description: `O certificado para ${data.nomeAluno} foi atualizado com sucesso.`,
           action: <Button variant="outline" size="sm"><Save className="mr-2 h-4 w-4"/>Salvo</Button>
        });
      } else {
        // Modo de Criação
        const newCertificateEntry: Certificado = {
          id: `CERT-${Date.now()}`,
          alunoNome: data.nomeAluno,
          alunoCPF: data.cpfAluno,
          cursoNome: data.nomeCurso,
          cargaHoraria: data.cargaHoraria,
          dataRealizacao: data.dataRealizacao,
          dataValidade: data.dataValidade || null,
          localRealizacao: data.localRealizacao,
          instrutorResponsavel: data.instrutorResponsavel,
          conteudoProgramatico: data.conteudoProgramatico || '',
          nomeEmpresa: data.nomeEmpresa || '',
          cnpjEmpresa: data.cnpjEmpresa || '',
          observacoesAdicionais: data.observacoesAdicionais || '',
          templateCertificado: data.templateCertificado,
          status: 'Emitido',
        };
        existingCertificates = [newCertificateEntry, ...existingCertificates];
        toast({
          title: "Certificado Gerado e Salvo!",
          description: `O certificado para ${data.nomeAluno} do curso ${data.nomeCurso} foi gerado e salvo localmente com sucesso.`,
          action: <Button variant="outline" size="sm"><Save className="mr-2 h-4 w-4"/>Salvo</Button>
        });
      }
      
      localStorage.setItem(CERTIFICATES_STORAGE_KEY, JSON.stringify(existingCertificates.map(cert => ({
        ...cert,
        dataRealizacao: cert.dataRealizacao.toISOString(),
        dataValidade: cert.dataValidade ? (cert.dataValidade as Date).toISOString() : null,
      }))));
      
      form.reset();
      setEditingCertificateId(null); // Resetar modo de edição
      setPageTitle("Emitir Novo Certificado");
      setSubmitButtonText("Gerar e Salvar Certificado");
      setSubmitButtonIcon(<Send className="mr-2 h-4 w-4" />);

    } catch (error) {
      console.error("Erro ao salvar certificado no localStorage:", error);
      toast({
        variant: "destructive",
        title: "Erro ao Salvar",
        description: "Não foi possível salvar o certificado localmente.",
      });
    }
    setIsLoading(false);
  };
  
  const sectionWrapperClass = "p-6 border rounded-lg bg-background shadow-sm";
  const formFieldWrapperClass = "opacity-0 translate-y-2 transition-all duration-500 ease-out";
  const formFieldMountedClass = isMounted ? "opacity-100 translate-y-0" : "";

  return (
    <>
      <PageHeader
        title={pageTitle}
        description={editingCertificateId ? "Altere os dados do certificado abaixo." : "Preencha os dados abaixo para gerar um novo certificado de treinamento."}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          <Card className={cn(sectionWrapperClass, formFieldWrapperClass, formFieldMountedClass)} style={{transitionDelay: '50ms'}}>
            <CardHeader className="px-0 pt-0 pb-4">
              <CardTitle className="flex items-center text-xl mb-1">
                <User className="mr-3 h-6 w-6 text-primary" />
                Dados do Aluno
              </CardTitle>
              <CardDescription>Informações sobre o participante do treinamento.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0 space-y-4">
              <FormField control={form.control} name="nomeAluno" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo do Aluno*</FormLabel>
                  <FormControl><Input placeholder="Nome completo" {...field} disabled={isLoading} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="cpfAluno" render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF do Aluno*</FormLabel>
                    <FormControl><Input placeholder="000.000.000-00" {...field} onChange={(e) => field.onChange(formatCpf(e.target.value))} maxLength={14} disabled={isLoading} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                <FormField control={form.control} name="emailAluno" render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail do Aluno*</FormLabel>
                    <FormControl><Input type="email" placeholder="email@example.com" {...field} disabled={isLoading} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
              </div>
            </CardContent>
          </Card>

          <Card className={cn(sectionWrapperClass, formFieldWrapperClass, formFieldMountedClass)} style={{transitionDelay: '150ms'}}>
            <CardHeader className="px-0 pt-0 pb-4">
              <CardTitle className="flex items-center text-xl mb-1">
                <FileText className="mr-3 h-6 w-6 text-primary" />
                Dados do Treinamento/Curso
              </CardTitle>
              <CardDescription>Detalhes sobre o curso ou Norma Regulamentadora.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0 space-y-4">
              <FormField control={form.control} name="nomeCurso" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Curso/NR*</FormLabel>
                  <FormControl><Input placeholder="Ex: NR-35 Trabalho em Altura" {...field} disabled={isLoading} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="cargaHoraria" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carga Horária (horas)*</FormLabel>
                    <FormControl><Input type="number" placeholder="Ex: 8" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} disabled={isLoading} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                <FormField control={form.control} name="dataRealizacao" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Realização*</FormLabel>
                    <Popover><PopoverTrigger asChild><FormControl>
                      <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")} disabled={isLoading}>
                        {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button></FormControl></PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || isLoading} initialFocus locale={ptBR}/></PopoverContent>
                    </Popover><FormMessage />
                  </FormItem>
                )}/>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="dataValidade" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Validade (Opcional)</FormLabel>
                     <Popover><PopoverTrigger asChild><FormControl>
                      <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")} disabled={isLoading}>
                        {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button></FormControl></PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value ?? undefined} onSelect={field.onChange} disabled={(date) => date < (form.getValues('dataRealizacao') || new Date()) || isLoading} initialFocus locale={ptBR}/></PopoverContent>
                    </Popover><FormMessage />
                  </FormItem>
                )}/>
                <FormField control={form.control} name="localRealizacao" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local de Realização*</FormLabel>
                    <FormControl><Input placeholder="Ex: Sala de Treinamento A" {...field} disabled={isLoading} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
              </div>
              <FormField control={form.control} name="instrutorResponsavel" render={({ field }) => (
                <FormItem>
                  <FormLabel>Instrutor Responsável*</FormLabel>
                  <FormControl><Input placeholder="Nome do instrutor" {...field} disabled={isLoading} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="conteudoProgramatico" render={({ field }) => (
                <FormItem>
                  <FormLabel>Conteúdo Programático (Resumido - Opcional)</FormLabel>
                  <FormControl><Textarea placeholder="Principais tópicos abordados no treinamento..." rows={3} {...field} disabled={isLoading} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
            </CardContent>
          </Card>

          <Card className={cn(sectionWrapperClass, formFieldWrapperClass, formFieldMountedClass)} style={{transitionDelay: '250ms'}}>
            <CardHeader className="px-0 pt-0 pb-4">
              <CardTitle className="flex items-center text-xl mb-1">
                <Building className="mr-3 h-6 w-6 text-primary" />
                Dados da Empresa (Opcional)
              </CardTitle>
              <CardDescription>Se o treinamento foi para uma empresa específica.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0 space-y-4">
              <FormField control={form.control} name="nomeEmpresa" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Empresa</FormLabel>
                  <FormControl><Input placeholder="Nome da empresa do aluno" {...field} disabled={isLoading} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="cnpjEmpresa" render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ da Empresa</FormLabel>
                  <FormControl><Input placeholder="00.000.000/0000-00" {...field} onChange={(e) => field.onChange(formatCnpj(e.target.value))} maxLength={18} disabled={isLoading} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
            </CardContent>
          </Card>

          <Card className={cn(sectionWrapperClass, formFieldWrapperClass, formFieldMountedClass)} style={{transitionDelay: '350ms'}}>
            <CardHeader className="px-0 pt-0 pb-4">
              <CardTitle className="flex items-center text-xl mb-1">
                <Award className="mr-3 h-6 w-6 text-primary" />
                Configurações do Certificado
              </CardTitle>
              <CardDescription>Escolha o modelo e adicione observações.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0 space-y-4">
              <FormField control={form.control} name="templateCertificado" render={({ field }) => (
                <FormItem>
                  <FormLabel>Modelo de Certificado*</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione um modelo" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="padrao_safetynet">Padrão SafetyNet</SelectItem>
                      <SelectItem value="nr35_especifico">NR-35 Específico</SelectItem>
                      <SelectItem value="nr10_basico">NR-10 Básico</SelectItem>
                      <SelectItem value="primeiros_socorros">Primeiros Socorros Completo</SelectItem>
                      <SelectItem value="custom_cliente_x">Modelo Personalizado Cliente X</SelectItem>
                    </SelectContent>
                  </Select>
                  <UiFormDescription className="text-xs">A geração do PDF com base no template será implementada.</UiFormDescription>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="observacoesAdicionais" render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações Adicionais (Opcional)</FormLabel>
                  <FormControl><Textarea placeholder="Qualquer informação adicional que deva constar no certificado..." rows={3} {...field} disabled={isLoading} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
            </CardContent>
          </Card>
          
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 mt-6 border-t">
            <Button type="button" variant="outline" onClick={() => {
              form.reset();
              setEditingCertificateId(null);
              setPageTitle("Emitir Novo Certificado");
              setSubmitButtonText("Gerar e Salvar Certificado");
              setSubmitButtonIcon(<Send className="mr-2 h-4 w-4" />);
            }} disabled={isLoading} className="w-full sm:w-auto">
              Limpar Formulário
            </Button>
            <Button type="submit" disabled={isLoading || (!form.formState.isDirty && editingCertificateId) || !form.formState.isValid} className="w-full sm:w-auto">
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {editingCertificateId ? 'Salvando...' : 'Gerando...'}</>
              ) : (
                <>{submitButtonIcon} {submitButtonText}</>
              )}
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground pt-2">
            A funcionalidade de geração de PDF e armazenamento persistente será implementada em etapas futuras.
          </p>
        </form>
      </Form>
    </>
  );
}
