// src/app/(app)/financeiro/page.tsx
'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription as UiFormDescription } from "@/components/ui/form";
import { Landmark, FileText, DollarSign, CheckCircle, XCircle, Download, Filter, TrendingUp, CalendarIcon, Edit, CloudUpload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

const financeEntrySchema = z.object({
  entryType: z.enum(['receita', 'despesa'], { required_error: 'O tipo de lançamento é obrigatório.' }),
  date: z.date({ required_error: 'A data do lançamento é obrigatória.' }),
  description: z.string().min(5, { message: 'A descrição deve ter pelo menos 5 caracteres.' }),
  amount: z.coerce.number().positive({ message: 'O valor deve ser positivo.' }),
  costCenter: z.string().min(1, { message: 'O centro de custo é obrigatório.' }),
  department: z.string().min(1, { message: 'O departamento é obrigatório.' }),
  expenseCategory: z.string().optional(),
  relatedCompany: z.string().optional(),
  responsible: z.string().optional(),
  attachment: z.any().optional(),
}).refine(data => {
  if (data.entryType === 'despesa' && !data.expenseCategory) {
    return false;
  }
  return true;
}, {
  message: 'A classificação de gasto é obrigatória para despesas.',
  path: ['expenseCategory'],
});

type FinanceEntryFormValues = z.infer<typeof financeEntrySchema>;

export default function FinanceiroPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  const form = useForm<FinanceEntryFormValues>({
    resolver: zodResolver(financeEntrySchema),
    defaultValues: {
      entryType: undefined,
      date: new Date(),
      description: '',
      amount: undefined,
      costCenter: '',
      department: '',
      expenseCategory: '',
      relatedCompany: '',
      responsible: '',
      attachment: undefined,
    },
  });

  const entryType = form.watch('entryType');

  const handleAttachmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setAttachmentFile(event.target.files[0]);
      form.setValue('attachment', event.target.files[0], { shouldValidate: true });
    } else {
      setAttachmentFile(null);
      form.setValue('attachment', undefined, { shouldValidate: true });
    }
  };

  async function onSubmit(data: FinanceEntryFormValues) {
    setIsLoading(true);
    console.log('Dados do Lançamento Financeiro:', { ...data, attachmentName: attachmentFile?.name });

    // Simular chamada de API
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: 'Lançamento Registrado!',
      description: `O lançamento de ${data.entryType === 'receita' ? 'receita' : 'despesa'} no valor de R$ ${data.amount.toFixed(2)} foi registrado com sucesso.`,
    });

    setIsLoading(false);
    form.reset();
    setAttachmentFile(null);
  }

  return (
    <>
      <PageHeader
        title="Painel Financeiro"
        description="Gerencie lançamentos, orçamentos, contas e indicadores financeiros."
      />
      <div className="space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Edit className="mr-3 h-7 w-7 text-primary" />
              Lançamentos de Receitas e Despesas
            </CardTitle>
            <CardDescription>
              Registre novas receitas ou despesas da empresa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="entryType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Lançamento</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="receita">Receita</SelectItem>
                            <SelectItem value="despesa">Despesa</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data do Lançamento</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                disabled={isLoading}
                              >
                                {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || isLoading} initialFocus locale={ptBR} />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Detalhes do lançamento..." {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0.00" {...field} step="0.01" disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="costCenter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Centro de Custo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o centro de custo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="administrativo">Administrativo</SelectItem>
                            <SelectItem value="operacional">Operacional</SelectItem>
                            <SelectItem value="projetos">Projetos</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Departamento</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o departamento" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="financeiro">Financeiro</SelectItem>
                            <SelectItem value="rh">Recursos Humanos</SelectItem>
                            <SelectItem value="tecnico">Técnico</SelectItem>
                            <SelectItem value="comercial">Comercial</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {entryType === 'despesa' && (
                  <FormField
                    control={form.control}
                    name="expenseCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Classificação de Gasto</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a classificação" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="fixo">Fixo</SelectItem>
                            <SelectItem value="variavel">Variável</SelectItem>
                            <SelectItem value="emergencial">Emergencial</SelectItem>
                            <SelectItem value="investimento">Investimento</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="relatedCompany"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Empresa Vinculada (Opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome da empresa" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="responsible"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Responsável pelo Lançamento (Opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do responsável" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="attachment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <CloudUpload className="mr-2 h-4 w-4 text-muted-foreground" />
                        Anexar Comprovante (Opcional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          disabled={isLoading}
                          onChange={handleAttachmentChange}
                          className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        />
                      </FormControl>
                      {attachmentFile && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Arquivo Selecionado: {attachmentFile.name} ({(attachmentFile.size / 1024).toFixed(1)} KB)
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isLoading || !form.formState.isDirty || !form.formState.isValid} className="min-w-[180px]">
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                        Registrando...
                      </>
                    ) : (
                      'Registrar Lançamento'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
            <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <DollarSign className="mr-2 h-5 w-5 text-primary" />
                    Lançamentos Recentes
                </h3>
                <div className="p-4 border rounded-lg bg-muted/30 text-center text-muted-foreground">
                    <p className="text-sm italic">
                    Uma lista/tabela de lançamentos (Data, Tipo, Descrição, Valor, Status) será exibida aqui.
                    </p>
                </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Filter className="mr-3 h-7 w-7 text-primary" />
              Filtros Avançados e Pesquisa
            </CardTitle>
            <CardDescription>
              Filtre os lançamentos por período, tipo, centro de custo, departamento ou empresa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded-lg bg-muted/30 text-center text-muted-foreground">
              <p className="text-sm italic">
                Controles de filtro (DateRangePicker, Selects múltiplos) e campo de busca serão implementados aqui.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <TrendingUp className="mr-3 h-7 w-7 text-primary" />
              Dashboard Financeiro e Indicadores
            </CardTitle>
            <CardDescription>
              Visualize gráficos de gastos por área, comparativos mensais, previsões e KPIs financeiros.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded-lg bg-muted/30 text-center text-muted-foreground">
              <p className="text-sm italic">
                Gráficos interativos (barras, pizza, linha) e cards de KPIs serão implementados aqui.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <FileText className="mr-3 h-7 w-7 text-primary" />
              Orçamentos, Propostas e Contas
            </CardTitle>
            <CardDescription>
              Acesse funcionalidades de geração de orçamentos, aprovação de propostas e controle de contas a pagar/receber.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded-lg bg-muted/30 text-center text-muted-foreground">
              <p className="text-sm italic">
                Links ou seções para estas funcionalidades (Orçamentos, Propostas, Contas a Pagar/Receber) serão implementados aqui.
              </p>
            </div>
          </CardContent>
        </Card>

      </div>
    </>
  );
}

    