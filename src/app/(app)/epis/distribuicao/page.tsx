
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, User, Briefcase, Package, Edit3, Check, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription as UiCardDescription } from '@/components/ui/card'; // Renomeado CardDescription para UiCardDescription
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { mockEpis, type Epi } from '../page'; 
import { Separator } from '@/components/ui/separator';

// Schema de validação para o formulário de distribuição
const distributionFormSchema = z.object({
  colaboradorNome: z.string().min(3, { message: 'O nome do colaborador deve ter pelo menos 3 caracteres.' }),
  colaboradorCargo: z.string().min(2, { message: 'O cargo do colaborador deve ter pelo menos 2 caracteres.' }),
  epiId: z.string().min(1, { message: 'Por favor, selecione um EPI.' }),
  quantidadeEntregue: z.coerce.number().min(1, { message: 'A quantidade deve ser pelo menos 1.' }),
  dataEntrega: z.date({ required_error: 'A data da entrega é obrigatória.' }),
});

const refinedDistributionFormSchema = (availableQuantity: number | undefined) =>
  distributionFormSchema.refine(
    (data) => {
      if (availableQuantity === undefined || availableQuantity < 0) return true; // Allow if EPI not selected or no quantity (e.g. error case)
      return data.quantidadeEntregue <= availableQuantity;
    },
    {
      message: 'A quantidade entregue não pode ser maior que a disponível no estoque.',
      path: ['quantidadeEntregue'],
    }
  );

type DistributionFormValues = z.infer<typeof distributionFormSchema>;

interface DistributionRecord {
  id: string;
  colaboradorNome: string;
  colaboradorCargo: string;
  epiName: string;
  epiId: string;
  quantidadeEntregue: number;
  dataEntrega: Date;
}

export default function DistribuicaoEpisPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEpi, setSelectedEpi] = useState<Epi | null>(null);
  const [currentMockEpis, setCurrentMockEpis] = useState<Epi[]>(() => 
    JSON.parse(JSON.stringify(mockEpis))
  );
  const [distributionHistory, setDistributionHistory] = useState<DistributionRecord[]>([]);

  const form = useForm<DistributionFormValues>({
    resolver: zodResolver(refinedDistributionFormSchema(selectedEpi?.quantity)),
    defaultValues: {
      colaboradorNome: '',
      colaboradorCargo: '',
      epiId: '',
      quantidadeEntregue: 1,
      dataEntrega: new Date(),
    },
  });

  useEffect(() => {
    const epiId = form.watch('epiId');
    if (epiId) {
      const epiDetails = currentMockEpis.find(e => e.id === epiId);
      setSelectedEpi(epiDetails || null);
    } else {
      setSelectedEpi(null);
    }
  }, [form.watch('epiId'), currentMockEpis]);

  useEffect(() => {
    // Re-validate 'quantidadeEntregue' when 'selectedEpi' changes its quantity
    if (selectedEpi) {
        form.trigger('quantidadeEntregue');
    }
  }, [selectedEpi, form]);


  async function onSubmit(data: DistributionFormValues) {
    if (!selectedEpi) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Nenhum EPI selecionado.',
      });
      return;
    }
     // Ensure refinement is re-evaluated with current selectedEpi quantity
    const currentResolver = zodResolver(refinedDistributionFormSchema(selectedEpi?.quantity));
    const validationResult = await currentResolver(data, form.control.formState.context, {});
    if (Object.keys(validationResult.errors).length > 0) {
        // Manually set errors if refine fails, as useForm might not pick it up immediately on submit
        if (validationResult.errors.quantidadeEntregue) {
            form.setError('quantidadeEntregue', { 
                type: 'manual', 
                message: validationResult.errors.quantidadeEntregue.message 
            });
        }
        setIsLoading(false); // Stop loading if validation fails
        return;
    }


    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    setCurrentMockEpis(prevEpis =>
      prevEpis.map(epi =>
        epi.id === selectedEpi.id
          ? { ...epi, quantity: epi.quantity - data.quantidadeEntregue }
          : epi
      )
    );

    const newDistributionRecord: DistributionRecord = {
      id: `dist-${Date.now()}`,
      colaboradorNome: data.colaboradorNome,
      colaboradorCargo: data.colaboradorCargo,
      epiName: selectedEpi.name,
      epiId: selectedEpi.id,
      quantidadeEntregue: data.quantidadeEntregue,
      dataEntrega: data.dataEntrega,
    };
    setDistributionHistory(prevHistory => [newDistributionRecord, ...prevHistory]);

    toast({
      title: 'Entrega Registrada!',
      description: `${data.quantidadeEntregue} unidade(s) de "${selectedEpi?.name}" entregue(s) para ${data.colaboradorNome}. Recibo digital será implementado futuramente.`,
      action: <Button variant="outline" size="sm"><Check className="mr-2 h-4 w-4" />OK</Button>,
    });
    
    setIsLoading(false);
    form.reset({ 
      colaboradorNome: '',
      colaboradorCargo: '',
      epiId: '', 
      quantidadeEntregue: 1,
      dataEntrega: new Date(),
    });
    setSelectedEpi(null); 
  }

  return (
    <>
      <PageHeader
        title="Registrar Distribuição de EPIs"
        description="Preencha os dados para registrar a entrega de um Equipamento de Proteção Individual."
      />
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle>Formulário de Entrega de EPI</CardTitle>
          <UiCardDescription>
            Certifique-se de que todos os dados estão corretos antes de registrar.
          </UiCardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="colaboradorNome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground"/>
                        Nome do Colaborador
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o nome completo" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="colaboradorCargo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-2 text-muted-foreground"/>
                        Cargo do Colaborador
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o cargo" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="epiId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                        <Package className="h-4 w-4 mr-2 text-muted-foreground"/>
                        EPI Entregue
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o EPI do inventário" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currentMockEpis.map(epi => (
                          <SelectItem key={epi.id} value={epi.id} disabled={epi.quantity <= 0}>
                            {epi.name} (Disponível: {epi.quantity})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedEpi && (
                <Card className="p-4 bg-muted/50 border-dashed">
                  <UiCardDescription className="text-sm space-y-1">
                    <p><strong>Item Selecionado:</strong> {selectedEpi.name}</p>
                    <p><strong>Quantidade Disponível:</strong> {selectedEpi.quantity}</p>
                    <p><strong>Validade do Lote:</strong> {format(new Date(selectedEpi.validity), 'dd/MM/yyyy', { locale: ptBR })}</p>
                  </UiCardDescription>
                </Card>
              )}

              <FormField
                control={form.control}
                name="quantidadeEntregue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade Entregue</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field} 
                        disabled={isLoading || !selectedEpi}
                        min="1"
                        max={selectedEpi?.quantity?.toString()}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dataEntrega"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data da Entrega</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={isLoading}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ptBR })
                            ) : (
                              <span>Escolha uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("2000-01-01") || isLoading
                          }
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel className="flex items-center">
                  <Edit3 className="h-4 w-4 mr-2 text-muted-foreground" />
                  Assinatura / Comprovante de Entrega
                </FormLabel>
                <FormControl>
                  <div className="w-full h-32 border border-dashed rounded-md flex items-center justify-center text-muted-foreground bg-muted/50">
                    (Espaço para assinatura digital ou upload de foto do recibo)
                  </div>
                </FormControl>
                <FormMessage />
                 <FormDescription className="text-xs mt-1">
                    Emissão de recibo digital com assinatura e histórico de entregas serão funcionalidades futuras.
                 </FormDescription>
              </FormItem>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isLoading || !form.formState.isValid || !selectedEpi}>
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                      Registrando...
                    </>
                  ) : (
                    'Registrar Entrega'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      <Card className="w-full max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle>Histórico de Entregas de EPIs (Sessão Atual)</CardTitle>
          <UiCardDescription>
            Lista das entregas de EPIs registradas nesta sessão.
          </UiCardDescription>
        </CardHeader>
        <CardContent>
          {distributionHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>EPI</TableHead>
                  <TableHead className="text-center">Quantidade</TableHead>
                  <TableHead>Data Entrega</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {distributionHistory.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.colaboradorNome}</TableCell>
                    <TableCell>{record.colaboradorCargo}</TableCell>
                    <TableCell>{record.epiName}</TableCell>
                    <TableCell className="text-center">{record.quantidadeEntregue}</TableCell>
                    <TableCell>{format(record.dataEntrega, 'dd/MM/yyyy HH:mm', { locale: ptBR })}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-6 border rounded-lg bg-muted/30 text-center text-muted-foreground">
              <p>Nenhuma entrega registrada nesta sessão ainda.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
