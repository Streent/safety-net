
'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CalendarIcon, Check, CloudUpload, MapPin, Edit3, LocateFixed, ImageIcon, Loader2, Save, Bot, Brain, AlertTriangleIcon, PlusCircle, Building, Briefcase, Users, ShieldAlert, Target, ListChecks } from 'lucide-react';
import { CardHeader, CardTitle, CardContent as UiCardContent, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription as UiFormDescription } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { extractReportDetails, type ExtractedReportDetailsOutput, type ExtractReportDetailsInput } from '@/ai/flows/extract-report-details-flow';
import { Separator } from '../ui/separator';

const incidentFormSchema = z.object({
  // Dados Gerais
  incidentType: z.string().min(1, { message: 'Por favor, selecione um tipo de incidente.' }),
  date: z.date({ required_error: 'A data do incidente/inspeção é obrigatória.' }),
  location: z.string().min(1, { message: 'A localização principal é obrigatória.' }),
  geolocation: z.string().optional().describe('Coordenadas GPS (latitude, longitude).'),
  
  // Dados da Inspeção (Opcionais se não for inspeção, mas alguns podem ser úteis)
  nomeDaEmpresaInspecionada: z.string().optional(),
  cnpjEmpresaInspecionada: z.string().optional().refine(val => !val || /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(val), {
    message: "CNPJ inválido. Use o formato XX.XXX.XXX/XXXX-XX."
  }),
  responsavelEmpresa: z.string().optional(),
  setorInspecionado: z.string().optional(),
  tipoInspecao: z.string().optional(), 
  equipeInspecao: z.string().optional(), 
  objetivoInspecao: z.string().optional(),
  
  // Resultados / Descrição
  description: z.string().min(10, { message: 'A descrição/resumo deve ter pelo menos 10 caracteres.' }),
  itensVerificados: z.string().optional(),
  naoConformidades: z.string().optional(),
  observacoesGerais: z.string().optional(),
  recomendacoesEspecificas: z.string().optional(),
  nivelDeRiscoGeral: z.string().optional(), 
  prazoParaCorrecao: z.date().optional(),

  media: z.any().optional(),
}).refine(data => {
  if (data.incidentType === "Inspeção de Segurança" || data.incidentType === "Auditoria") {
    // Tornando os campos de inspeção opcionais na UI, mas mantendo a lógica de validação se o tipo for inspeção.
    // A obrigatoriedade será tratada visualmente ou com mensagens mais amigáveis.
    // Para o schema, podemos deixar assim e focar na UI para indicar campos necessários para certos tipos.
    // Ou ajustar para: return !!data.setorInspecionado && !!data.tipoInspecao ... se realmente forem obrigatórios no backend.
    // Por agora, vamos remover a validação estrita aqui para simplificar, assumindo que a UI guiará o usuário.
  }
  return true;
}
// Removido o refine problemático para simplificar o teste do Select, 
// pode ser reintroduzido com lógica mais granular depois.
// , {
//   message: "Para Inspeções/Auditorias, os campos: Setor Inspecionado, Tipo de Inspeção, Equipe de Inspeção e Objetivo são obrigatórios.",
//   path: ["tipoInspecao"], 
// }
);


export type IncidentFormValues = z.infer<typeof incidentFormSchema>;

interface IncidentFormProps {
  initialData?: Partial<IncidentFormValues>;
  onSubmitSuccess?: (data: IncidentFormValues) => void;
  isModalMode?: boolean;
}

export function IncidentForm({ initialData, onSubmitSuccess, isModalMode = false }: IncidentFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [aiAnalysisResults, setAiAnalysisResults] = useState<ExtractedReportDetailsOutput | null>(null);
  const [aiAnalysisError, setAiAnalysisError] = useState<string | null>(null);
  const [aiDetailsIncorporated, setAiDetailsIncorporated] = useState(false);
  const [activeAccordionItems, setActiveAccordionItems] = useState<string[]>(["dadosGerais", "descricaoResultados"]);


  const form = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentFormSchema),
  });
  
  const watchIncidentType = form.watch("incidentType");

  useEffect(() => {
    form.reset({
      incidentType: initialData?.incidentType || '',
      description: initialData?.description || '',
      location: initialData?.location || '',
      geolocation: initialData?.geolocation || '',
      date: initialData?.date ? new Date(initialData.date) : new Date(),
      media: undefined,
      nomeDaEmpresaInspecionada: initialData?.nomeDaEmpresaInspecionada || '',
      cnpjEmpresaInspecionada: initialData?.cnpjEmpresaInspecionada || '',
      responsavelEmpresa: initialData?.responsavelEmpresa || '',
      setorInspecionado: initialData?.setorInspecionado || '',
      tipoInspecao: initialData?.tipoInspecao || '',
      equipeInspecao: initialData?.equipeInspecao || '',
      objetivoInspecao: initialData?.objetivoInspecao || '',
      itensVerificados: initialData?.itensVerificados || '',
      naoConformidades: initialData?.naoConformidades || '',
      observacoesGerais: initialData?.observacoesGerais || '',
      recomendacoesEspecificas: initialData?.recomendacoesEspecificas || '',
      nivelDeRiscoGeral: initialData?.nivelDeRiscoGeral || '',
      prazoParaCorrecao: initialData?.prazoParaCorrecao ? new Date(initialData.prazoParaCorrecao) : undefined,
    });
    setMediaFiles([]);
    setAiAnalysisResults(null);
    setAiAnalysisError(null);
    setAiDetailsIncorporated(false);
    // Garante que as seções principais estejam abertas ao carregar/resetar
    setActiveAccordionItems(["dadosGerais", "descricaoResultados"]); 
  }, [initialData, form]);


  const handleMediaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setMediaFiles(Array.from(event.target.files));
      form.setValue('media', event.target.files);
    } else {
      setMediaFiles([]);
      form.setValue('media', undefined);
    }
  };

  async function onSubmit(data: IncidentFormValues) {
    setIsLoading(true);
    console.log('Dados do Relatório de Incidente Detalhado:', { ...data, mediaNames: mediaFiles.map(f => f.name) });

    await new Promise(resolve => setTimeout(resolve, 1500));

    if (isModalMode && !initialData?.description) { 
        toast({
            title: "Relatório Enviado",
            description: "Seu relatório de incidente foi registrado com sucesso."
        });
    }
    
    setIsLoading(false);
    if (onSubmitSuccess) onSubmitSuccess(data);
  }
  
  const isEditMode = !!(initialData && initialData.description);

  const handleAiAnalysis = async () => {
    const description = form.getValues('description');
    if (!description?.trim()) {
      toast({
        variant: 'destructive',
        title: 'Descrição Necessária',
        description: 'Por favor, insira uma descrição do incidente para a análise com IA.',
      });
      return;
    }

    setIsAiAnalyzing(true);
    setAiAnalysisResults(null);
    setAiAnalysisError(null);
    setAiDetailsIncorporated(false);

    const photoDataUris: string[] = [];
    if (mediaFiles.length > 0) {
      for (const file of mediaFiles) {
        if (file.type.startsWith('image/')) {
          try {
            const dataUri = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = error => reject(error);
              reader.readAsDataURL(file);
            });
            photoDataUris.push(dataUri);
          } catch (error) {
            console.error("Error converting file to data URI:", error);
            toast({ variant: "destructive", title: "Erro ao processar imagem", description: `Não foi possível ler o arquivo ${file.name}.`});
          }
        }
      }
    }
    
    const input: ExtractReportDetailsInput = {
      incidentDescription: description,
      ...(photoDataUris.length > 0 && { photoDataUris }),
    };

    try {
      const results = await extractReportDetails(input);
      setAiAnalysisResults(results);
      
      if (results.oQueAconteceu) {
        form.setValue('description', results.oQueAconteceu, { shouldValidate: true, shouldDirty: true });
      }
      if (results.local) {
        form.setValue('location', results.local, { shouldValidate: true, shouldDirty: true });
      }
      // if (results.setor && form.getValues('incidentType')?.includes('Inspeção')) { // 'setor' da IA pode ser o 'setorInspecionado'
      //   form.setValue('setorInspecionado', results.setor, { shouldValidate: true, shouldDirty: true });
      // }


      toast({
        title: 'Análise da IA Concluída',
        description: 'Campos principais atualizados. Verifique os detalhes adicionais sugeridos abaixo e incorpore-os se desejar.',
      });

    } catch (error) {
      console.error("AI Analysis failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido durante a análise.";
      setAiAnalysisError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Falha na Análise com IA',
        description: errorMessage,
      });
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const handleIncorporateAiDetails = () => {
    if (!aiAnalysisResults) return;

    const fieldsToUpdate: { formField: keyof IncidentFormValues; aiField: keyof ExtractedReportDetailsOutput; label: string }[] = [
      // { formField: 'naoConformidades', aiField: 'causaProvavel' /* Mapeando causa para não conformidade por enquanto */, label: 'Não Conformidades Sugeridas pela IA (Baseado em Causa Provável)'},
      { formField: 'naoConformidades', aiField: 'principaisNaoConformidadesSugeridas', label: 'Principais Não Conformidades Sugeridas pela IA'},
      { formField: 'recomendacoesEspecificas', aiField: 'recomendacao', label: 'Recomendações Específicas Sugeridas pela IA'},
      // Se a IA tivesse um campo para 'itensVerificados', seria adicionado aqui.
    ];
    
    let detailsIncorporatedFlag = false;

    fieldsToUpdate.forEach(fieldMap => {
        const aiValue = aiAnalysisResults[fieldMap.aiField] as string | undefined;
        if (aiValue && aiValue.toLowerCase() !== "não identificado" && aiValue.toLowerCase() !== "não aplicável") {
            const currentValue = form.getValues(fieldMap.formField) || "";
            const newValue = currentValue ? `${currentValue}\n\n**${fieldMap.label}:** ${aiValue}` : `**${fieldMap.label}:** ${aiValue}`;
            form.setValue(fieldMap.formField, newValue, { shouldValidate: true, shouldDirty: true });
            detailsIncorporatedFlag = true;
        }
    });
    
    // Preencher campos específicos de inspeção se a IA os retornou e os campos do formulário estão vazios
    if (aiAnalysisResults.setor && aiAnalysisResults.setor.toLowerCase() !== "não identificado" && aiAnalysisResults.setor.toLowerCase() !== "não aplicável" && !form.getValues('setorInspecionado')) {
        form.setValue('setorInspecionado', aiAnalysisResults.setor, {shouldValidate: true, shouldDirty: true});
        detailsIncorporatedFlag = true;
    }
    if (aiAnalysisResults.possivelTipoInspecaoSugerido && aiAnalysisResults.possivelTipoInspecaoSugerido.toLowerCase() !== "não identificado" && aiAnalysisResults.possivelTipoInspecaoSugerido.toLowerCase() !== "não aplicável" && !form.getValues('tipoInspecao')) {
        form.setValue('tipoInspecao', aiAnalysisResults.possivelTipoInspecaoSugerido, {shouldValidate: true, shouldDirty: true});
        detailsIncorporatedFlag = true;
    }


    if (detailsIncorporatedFlag) {
      toast({
        title: "Detalhes Incorporados",
        description: "As sugestões da IA foram adicionadas aos campos correspondentes ou à descrição principal.",
      });
      setAiDetailsIncorporated(true);
    } else {
       toast({
        title: "Nenhum Detalhe Novo",
        description: "A IA não forneceu detalhes adicionais significativos para incorporar nos campos específicos.",
        variant: "default"
      });
    }
  };

  const isInspectionType = watchIncidentType === "Inspeção de Segurança" || watchIncidentType === "Auditoria";
  // console.log("IncidentForm Render. isLoading:", isLoading, "isAiAnalyzing:", isAiAnalyzing, "Type Select Disabled:", isLoading || isAiAnalyzing);


  return (
    <div className={cn(!isModalMode && "w-full max-w-3xl mx-auto shadow-xl rounded-lg border bg-card")}>
      {!isModalMode && (
        <CardHeader className="pt-6 pb-4">
          <CardTitle className="text-2xl">
            {isEditMode ? 'Editar Relatório' : 'Registrar Novo Relatório'}
          </CardTitle>
          <UiFormDescription className="!mt-1">
            Forneça informações detalhadas sobre o incidente ou inspeção.
          </UiFormDescription>
        </CardHeader>
      )}
      <div className={cn(!isModalMode ? "p-6 pt-4" : "p-0")}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Accordion type="multiple" value={activeAccordionItems} onValueChange={setActiveAccordionItems} className="w-full">
              <AccordionItem value="dadosGerais">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">Dados Gerais do Relatório</AccordionTrigger>
                <AccordionContent className="pt-4 space-y-6">
                  <FormField
                    control={form.control}
                    name="incidentType"
                    render={({ field }) => {
                      // console.log("Incident Type Field Render. Value:", field.value, "Disabled:", isLoading || isAiAnalyzing);
                      return (
                      <FormItem>
                        <FormLabel>Tipo de Relatório/Incidente</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value || ''} 
                          disabled={isLoading || isAiAnalyzing}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Inspeção de Segurança">Inspeção de Segurança</SelectItem>
                            <SelectItem value="Auditoria">Auditoria</SelectItem>
                            <SelectItem value="Quase Acidente">Quase Acidente</SelectItem>
                            <SelectItem value="Observação de Segurança">Observação de Segurança</SelectItem>
                            <SelectItem value="Primeiros Socorros">Primeiros Socorros</SelectItem>
                            <SelectItem value="Dano à Propriedade">Dano à Propriedade</SelectItem>
                            <SelectItem value="Ambiental">Ambiental</SelectItem>
                            <SelectItem value="DDS">DDS (Diálogo Diário de Segurança)</SelectItem>
                            <SelectItem value="Outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-muted-foreground" />Localização Principal</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Armazém Seção B, Escritório X" {...field} value={field.value || ''} disabled={isLoading || isAiAnalyzing} data-ai-hint="localização do incidente ou inspeção" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="mb-1">Data do Evento/Inspeção</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")} disabled={isLoading || isAiAnalyzing}>
                                  {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || isLoading || isAiAnalyzing} initialFocus locale={ptBR}/>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="geolocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><LocateFixed className="h-4 w-4 mr-2 text-muted-foreground" />Geolocalização (Lat, Long)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: -23.5505, -46.6333 (automático ou manual)" {...field} value={field.value || ''} disabled={isLoading || isAiAnalyzing} data-ai-hint="coordenadas latitude longitude" />
                        </FormControl>
                        <UiFormDescription className="text-xs">Coordenadas GPS. Será tentada a captura automática se permitido.</UiFormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              {isInspectionType && (
                 <AccordionItem value="dadosInspecao">
                    <AccordionTrigger className="text-lg font-semibold hover:no-underline">Dados da Inspeção/Auditoria</AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="nomeDaEmpresaInspecionada" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center"><Building className="h-4 w-4 mr-2 text-muted-foreground"/>Empresa Inspecionada (se aplicável)</FormLabel>
                                    <FormControl><Input placeholder="Nome da empresa externa" {...field} value={field.value || ''} disabled={isLoading || isAiAnalyzing} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={form.control} name="cnpjEmpresaInspecionada" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>CNPJ (Empresa Inspecionada)</FormLabel>
                                    <FormControl><Input placeholder="XX.XXX.XXX/XXXX-XX" {...field} value={field.value || ''} onChange={(e) => {
                                        const rawValue = e.target.value.replace(/\D/g, "");
                                        let formattedValue = rawValue;
                                        if (rawValue.length > 2) formattedValue = `${rawValue.slice(0,2)}.${rawValue.slice(2)}`;
                                        if (rawValue.length > 5) formattedValue = `${formattedValue.slice(0,6)}.${rawValue.slice(5)}`;
                                        if (rawValue.length > 8) formattedValue = `${formattedValue.slice(0,10)}/${rawValue.slice(8)}`;
                                        if (rawValue.length > 12) formattedValue = `${formattedValue.slice(0,15)}-${rawValue.slice(12)}`;
                                        field.onChange(formattedValue.slice(0,18));
                                    }} disabled={isLoading || isAiAnalyzing} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </div>
                        <FormField control={form.control} name="responsavelEmpresa" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center"><Users className="h-4 w-4 mr-2 text-muted-foreground"/>Responsável/Contato na Empresa</FormLabel>
                                <FormControl><Input placeholder="Nome do contato principal" {...field} value={field.value || ''} disabled={isLoading || isAiAnalyzing} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="setorInspecionado" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center"><Briefcase className="h-4 w-4 mr-2 text-muted-foreground"/>Setor Inspecionado/Auditado</FormLabel>
                                    <FormControl><Input placeholder="Ex: Produção, Almoxarifado" {...field} value={field.value || ''} disabled={isLoading || isAiAnalyzing} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={form.control} name="tipoInspecao" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de Inspeção/Auditoria</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ''} disabled={isLoading || isAiAnalyzing}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="Inspeção Planejada">Inspeção Planejada</SelectItem>
                                            <SelectItem value="Inspeção Não Planejada">Inspeção Não Planejada</SelectItem>
                                            <SelectItem value="Inspeção de Rotina">Inspeção de Rotina</SelectItem>
                                            <SelectItem value="Inspeção Especial">Inspeção Especial</SelectItem>
                                            <SelectItem value="Auditoria de Requisitos Legais">Auditoria de Requisitos Legais</SelectItem>
                                            <SelectItem value="Auditoria Interna">Auditoria Interna</SelectItem>
                                            <SelectItem value="Auditoria Externa">Auditoria Externa</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </div>
                        <FormField control={form.control} name="equipeInspecao" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center"><Users className="h-4 w-4 mr-2 text-muted-foreground"/>Equipe de Inspeção/Auditoria</FormLabel>
                                <FormControl><Textarea placeholder="Nomes dos inspetores/auditores, separados por vírgula" {...field} value={field.value || ''} rows={2} disabled={isLoading || isAiAnalyzing} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="objetivoInspecao" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center"><Target className="h-4 w-4 mr-2 text-muted-foreground"/>Objetivo da Inspeção/Auditoria</FormLabel>
                                <FormControl><Textarea placeholder="Descreva o objetivo principal" {...field} value={field.value || ''} rows={3} disabled={isLoading || isAiAnalyzing} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                    </AccordionContent>
                 </AccordionItem>
              )}

              <AccordionItem value="descricaoResultados">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">Descrição Detalhada / Resultados</AccordionTrigger>
                <AccordionContent className="pt-4 space-y-6">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição Principal / Resumo dos Achados</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Descreva o incidente ou os principais achados da inspeção..." rows={7} {...field} value={field.value || ''} disabled={isLoading || isAiAnalyzing} data-ai-hint="detalhes da descrição do incidente ou inspeção" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="outline" onClick={handleAiAnalysis} disabled={isAiAnalyzing || isLoading} className="w-full sm:w-auto">
                    {isAiAnalyzing ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analisando com IA...</>) : (<><Brain className="mr-2 h-4 w-4" />Analisar Descrição com IA</>)}
                  </Button>

                  {aiAnalysisError && (<Alert variant="destructive" className="mt-4"><AlertTriangleIcon className="h-4 w-4" /><AlertTitle>Erro na Análise</AlertTitle><AlertDescription>{aiAnalysisError}</AlertDescription></Alert>)}
                  
                  {aiAnalysisResults && !aiAnalysisError && (
                    <div className="space-y-3 p-4 border rounded-md bg-muted/50 mt-4">
                      <h3 className="text-md font-semibold text-primary flex items-center"><Bot className="mr-2 h-5 w-5"/>Sugestões Detalhadas da IA</h3>
                      
                      {aiAnalysisResults.oQueAconteceu && aiAnalysisResults.oQueAconteceu !== form.getValues('description') && (<p className="text-sm"><strong>Resumo Sugerido:</strong> {aiAnalysisResults.oQueAconteceu}</p>)}
                      {aiAnalysisResults.local && aiAnalysisResults.local !== form.getValues('location') && (<p className="text-sm"><strong>Local Sugerido:</strong> {aiAnalysisResults.local}</p>)}
                      {aiAnalysisResults.setor && (aiAnalysisResults.setor.toLowerCase() !== "não identificado" && aiAnalysisResults.setor.toLowerCase() !== "não aplicável") && (<p className="text-sm"><strong>Setor Sugerido:</strong> {aiAnalysisResults.setor}</p>)}
                      {aiAnalysisResults.causaProvavel && (aiAnalysisResults.causaProvavel.toLowerCase() !== "não identificado" && aiAnalysisResults.causaProvavel.toLowerCase() !== "não aplicável") && (<p className="text-sm"><strong>Causa Provável Sugerida:</strong> {aiAnalysisResults.causaProvavel}</p>)}
                      {aiAnalysisResults.medidasTomadas && (aiAnalysisResults.medidasTomadas.toLowerCase() !== "não identificado" && aiAnalysisResults.medidasTomadas.toLowerCase() !== "não aplicável") && (<p className="text-sm"><strong>Medidas Tomadas Sugeridas:</strong> {aiAnalysisResults.medidasTomadas}</p>)}
                      {aiAnalysisResults.recomendacao && (aiAnalysisResults.recomendacao.toLowerCase() !== "não identificado" && aiAnalysisResults.recomendacao.toLowerCase() !== "não aplicável") && (<p className="text-sm"><strong>Recomendação Sugerida:</strong> {aiAnalysisResults.recomendacao}</p>)}
                      {aiAnalysisResults.possivelTipoInspecaoSugerido && (aiAnalysisResults.possivelTipoInspecaoSugerido.toLowerCase() !== "não identificado" && aiAnalysisResults.possivelTipoInspecaoSugerido.toLowerCase() !== "não aplicável") && (<p className="text-sm"><strong>Tipo de Inspeção Sugerido:</strong> {aiAnalysisResults.possivelTipoInspecaoSugerido}</p>)}
                      {aiAnalysisResults.principaisNaoConformidadesSugeridas && (aiAnalysisResults.principaisNaoConformidadesSugeridas.toLowerCase() !== "não identificado" && aiAnalysisResults.principaisNaoConformidadesSugeridas.toLowerCase() !== "não aplicável") && (<p className="text-sm"><strong>Não Conformidades Sugeridas:</strong> {aiAnalysisResults.principaisNaoConformidadesSugeridas}</p>)}
                      
                      {!aiDetailsIncorporated ? (
                        <Button type="button" onClick={handleIncorporateAiDetails} variant="secondary" size="sm" className="mt-3">
                          <PlusCircle className="mr-2 h-4 w-4" />Incorporar Detalhes nos Campos
                        </Button>
                      ) : (<p className="text-xs text-green-600 italic mt-3">Sugestões da IA verificadas para incorporação.</p>)}
                      <p className="text-xs text-muted-foreground italic mt-2">Revise e ajuste os campos do formulário ou a descrição principal conforme necessário.</p>
                    </div>
                  )}

                  {isInspectionType && (
                    <>
                        <Separator className={cn((!aiAnalysisResults && !aiAnalysisError) && "hidden", "my-6")} />
                        <FormField control={form.control} name="itensVerificados" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center"><ListChecks className="h-4 w-4 mr-2 text-muted-foreground"/>Itens Verificados / Escopo Detalhado</FormLabel>
                                <FormControl><Textarea placeholder="Liste os principais equipamentos, áreas, processos ou documentos verificados..." rows={4} {...field} value={field.value || ''} disabled={isLoading || isAiAnalyzing} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="naoConformidades" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center"><ShieldAlert className="h-4 w-4 mr-2 text-destructive"/>Não Conformidades Identificadas</FormLabel>
                                <FormControl><Textarea placeholder="Liste as não conformidades encontradas, incluindo evidências e referências normativas se aplicável..." rows={5} {...field} value={field.value || ''} disabled={isLoading || isAiAnalyzing} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                    </>
                  )}
                  <FormField control={form.control} name="observacoesGerais" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Observações Gerais</FormLabel>
                        <FormControl><Textarea placeholder="Outras observações relevantes..." rows={3} {...field} value={field.value || ''} disabled={isLoading || isAiAnalyzing} /></FormControl>
                        <FormMessage />
                    </FormItem>
                  )}/>
                  <FormField control={form.control} name="recomendacoesEspecificas" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Recomendações Específicas / Plano de Ação Imediato</FormLabel>
                        <FormControl><Textarea placeholder="Ações corretivas, preventivas ou de melhoria recomendadas..." rows={4} {...field} value={field.value || ''} disabled={isLoading || isAiAnalyzing} /></FormControl>
                        <FormMessage />
                    </FormItem>
                  )}/>
                  {isInspectionType && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="nivelDeRiscoGeral" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nível de Risco Geral (Pós-Inspeção)</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ''} disabled={isLoading || isAiAnalyzing}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione o nível de risco" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="Baixo">Baixo</SelectItem>
                                        <SelectItem value="Médio">Médio</SelectItem>
                                        <SelectItem value="Alto">Alto</SelectItem>
                                        <SelectItem value="Crítico">Crítico</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="prazoParaCorrecao" render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel className="mb-1">Prazo para Correções (se aplicável)</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")} disabled={isLoading || isAiAnalyzing}>
                                        {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha um prazo</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date() || isLoading || isAiAnalyzing} initialFocus locale={ptBR}/>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}/>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="midiaAssinatura">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">Mídia e Assinatura</AccordionTrigger>
                <AccordionContent className="pt-4 space-y-6">
                  <FormItem>
                    <FormLabel className="flex items-center"><CloudUpload className="h-4 w-4 mr-2 text-muted-foreground" />Upload de Mídia (Fotos, Vídeos, Áudio)</FormLabel>
                    <FormControl>
                      <Input type="file" multiple disabled={isLoading || isAiAnalyzing} onChange={handleMediaChange} data-ai-hint="upload fotos videos audio" className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                    </FormControl>
                    {mediaFiles.length > 0 && (
                      <div className="mt-2 space-y-2">
                        <p className="text-sm font-medium">Arquivos Selecionados ({mediaFiles.length}):</p>
                        <ul className="list-disc list-inside text-xs text-muted-foreground max-h-24 overflow-y-auto">
                          {mediaFiles.map(file => <li key={file.name}>{file.name} ({ (file.size / 1024).toFixed(1) } KB)</li>)}
                        </ul>
                        <div className="mt-1 text-xs text-muted-foreground flex items-center"><ImageIcon className="h-3 w-3 mr-1.5" />Pré-visualizações aparecerão aqui.</div>
                      </div>
                    )}
                    <UiFormDescription className="text-xs">Anexe arquivos relevantes.</UiFormDescription>
                  </FormItem>
                  <FormItem>
                    <FormLabel className="flex items-center"><Edit3 className="h-4 w-4 mr-2 text-muted-foreground" />Assinatura</FormLabel>
                    <FormControl>
                      <div className="w-full h-32 border border-dashed rounded-md flex items-center justify-center text-muted-foreground bg-muted/50">Área de Assinatura (Placeholder)</div>
                    </FormControl>
                  </FormItem>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              {!isModalMode && (<Button type="button" variant="outline" disabled={isLoading || isAiAnalyzing}><Save className="mr-2 h-4 w-4" />Salvar Rascunho</Button>)}
              <Button type="submit" disabled={isLoading || isAiAnalyzing || (!form.formState.isDirty && isEditMode && !mediaFiles.length)} className="min-w-[180px]">
                {isLoading ? (<><Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />{isEditMode ? 'Salvando...' : (isModalMode ? 'Registrando...' : 'Enviar Relatório')}</>) 
                           : (isEditMode ? 'Salvar Alterações' : (isModalMode ? 'Registrar Incidente' : 'Enviar Relatório'))}
              </Button>
            </div>
            {!isModalMode && (<p className="text-xs text-center text-muted-foreground pt-2">Opções de exportação estarão disponíveis após o envio.</p>)}
          </form>
        </Form>
      </div>
    </div>
  );
}
